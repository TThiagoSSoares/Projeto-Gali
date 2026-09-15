// src/routes/index.js
// Roteador raiz - monta todos os recursos

const { Router } = require('express');

const authCtrl = require('../controllers/auth.controller');
const pontosCtrl = require('../controllers/pontos.controller');
const doacoesCtrl = require('../controllers/doacoes.controller');
const beneficiariosCtrl = require('../controllers/beneficiarios.controller');
const chuvaCtrl = require('../controllers/chuva.controller');
const adminCtrl = require('../controllers/admin.controller');

const { requireAuth, requireRole } = require('../middleware/auth');

// Wrapper para promises rejeitadas -> errorHandler
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();

// --- Auth ---
router.post('/auth/register', wrap(authCtrl.register));
router.post('/auth/login',    wrap(authCtrl.login));
router.get ('/auth/me',       requireAuth, wrap(authCtrl.me));

// --- Pontos de coleta (público) ---
router.get('/pontos-coleta',       wrap(pontosCtrl.listar));
router.get('/pontos-coleta/:id',   wrap(pontosCtrl.detalhar));
router.get('/capacidade',          wrap(pontosCtrl.capacidade));

// --- Doações ---
router.post('/doacoes',                                wrap(doacoesCtrl.criar));            // pública (com contato_*)
router.get ('/doacoes',            requireAuth, requireRole('admin'),
                                                       wrap(doacoesCtrl.listar));
router.get ('/doacoes/protocolo/:protocolo',           wrap(doacoesCtrl.buscarPorProtocolo));
router.patch('/doacoes/:id/status', requireAuth, requireRole('admin','voluntario'),
                                                       wrap(doacoesCtrl.atualizarStatus));

// --- Beneficiários ---
router.post('/beneficiarios/solicitar-ajuda', wrap(beneficiariosCtrl.solicitarAjuda));
router.get ('/beneficiarios/minhas-solicitacoes', requireAuth,
                                                       wrap(beneficiariosCtrl.minhasSolicitacoes));

// --- Meteorologia ---
router.get('/chuva/sorocaba',     wrap(chuvaCtrl.sorocaba));
router.get('/chuva/alerta-atual', wrap(chuvaCtrl.alertaAtual));

// --- Admin (protegido) ---
router.get('/admin/resumo',    requireAuth, requireRole('admin'), wrap(adminCtrl.resumo));
router.get('/admin/doacoes',   requireAuth, requireRole('admin'), wrap(doacoesCtrl.listar));
router.get('/admin/serie-doacoes', requireAuth, requireRole('admin'), wrap(adminCtrl.serieDoacoes));
router.get('/admin/alertas',   requireAuth, requireRole('admin'), wrap(adminCtrl.alertas));
router.get('/admin/exportar',  requireAuth, requireRole('admin'), wrap(adminCtrl.exportarCSV));

module.exports = router;
