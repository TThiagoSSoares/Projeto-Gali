// src/controllers/auth.controller.js
// Registro e login de usuários

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

const TIPOS_VALIDOS = ['doador', 'beneficiario', 'voluntario', 'admin'];

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' },
  );
}

async function register(req, res) {
  const { nome, email, telefone, tipo, senha, cpf, endereco, bairro } = req.body;

  if (!nome || !email || !senha) {
    throw new HttpError(400, 'Campos obrigatórios: nome, email, senha.');
  }
  if (senha.length < 6) {
    throw new HttpError(400, 'A senha deve ter pelo menos 6 caracteres.');
  }
  // Só permite cadastrar 'admin' se já existir um admin autenticado (controle externo)
  const tipoFinal = TIPOS_VALIDOS.includes(tipo) && tipo !== 'admin' ? tipo : 'doador';

  const senha_hash = await bcrypt.hash(senha, 10);

  const { rows } = await query(
    `INSERT INTO usuarios (nome, email, telefone, tipo, cpf, endereco, bairro, senha_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, nome, email, tipo`,
    [nome, email, telefone, tipoFinal, cpf, endereco, bairro, senha_hash],
  );
  const usuario = rows[0];
  const token = gerarToken(usuario);

  res.status(201).json({ usuario, token });
}

async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    throw new HttpError(400, 'Email e senha são obrigatórios.');
  }

  const { rows } = await query(
    `SELECT id, nome, email, tipo, senha_hash, ativo
       FROM usuarios WHERE email = $1`,
    [email],
  );
  const u = rows[0];
  if (!u || !u.ativo) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }
  const ok = await bcrypt.compare(senha, u.senha_hash || '');
  if (!ok) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  const usuario = { id: u.id, nome: u.nome, email: u.email, tipo: u.tipo };
  res.json({ usuario, token: gerarToken(usuario) });
}

async function me(req, res) {
  const { rows } = await query(
    `SELECT id, nome, email, tipo, telefone, bairro
       FROM usuarios WHERE id = $1`,
    [req.user.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(rows[0]);
}

module.exports = { register, login, me };
