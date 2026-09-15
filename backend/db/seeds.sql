-- =====================================================================
-- SEED DATA - 3 Pontos de Coleta de Sorocaba + Capacidades
-- =====================================================================

INSERT INTO pontos_coleta (id, nome, endereco, cep, bairro, latitude, longitude, telefone, horario_funcionamento, tipo)
VALUES
  (1, 'Comunidade Santa Bárbara',
      'Rua Luiz Geraldo Franco de Mendonça, 150 - Jardim das Estrelas, Sorocaba - SP',
      '18017-310', 'Jardim das Estrelas', -23.4945, -47.4563,
      '(15) 3000-1001', 'Seg-Sáb, 08h-18h', 'comunidade'),
  (2, 'Paróquia Santo Antônio',
      'R. Martins de Oliveira, 229 - Vila Haro, Sorocaba - SP',
      '18015-245', 'Vila Haro', -23.5321, -47.4896,
      '(15) 3000-1002', 'Seg-Dom, 07h-19h', 'paroquia'),
  (3, 'Paróquia São Carlos Borromeu',
      'Av. Dr. Eugênio Salerno, 166 - Centro, Sorocaba - SP',
      '18035-430', 'Centro', -23.5057, -47.4742,
      '(15) 3000-1003', 'Seg-Dom, 07h-20h', 'centro');

-- Reset da sequence para próximos inserts
SELECT setval('pontos_coleta_id_seq', (SELECT MAX(id) FROM pontos_coleta));

-- Capacidades por tipo de item (usando o valor máximo da faixa do spec)
INSERT INTO capacidade_pontos (ponto_coleta_id, tipo_item, capacidade_maxima, quantidade_atual) VALUES
  -- Ponto 1: Comunidade Santa Bárbara
  (1, 'cesta_basica',  600, 0),
  (1, 'kit_higiene',   700, 0),
  (1, 'kit_limpeza',   500, 0),
  (1, 'agua_litros',  2000, 0),
  -- Ponto 2: Paróquia Santo Antônio
  (2, 'cesta_basica',  900, 0),
  (2, 'kit_higiene',  1000, 0),
  (2, 'kit_limpeza',   700, 0),
  (2, 'agua_litros',  3000, 0),
  -- Ponto 3: Paróquia São Carlos Borromeu
  (3, 'cesta_basica', 1500, 0),
  (3, 'kit_higiene',  1800, 0),
  (3, 'kit_limpeza',  1200, 0),
  (3, 'agua_litros',  6000, 0);

-- Usuário admin padrão (senha: admin123 — TROQUE EM PRODUÇÃO)
-- Hash gerado com bcryptjs, 10 rounds
INSERT INTO usuarios (nome, email, tipo, senha_hash, ativo)
VALUES (
  'Administrador',
  'admin@sorocaba-logistics.local',
  'admin',
  '$2b$10$FpbZ1RaXBnK6WTsy92GxaOgUX7g00DCOJecCmm9gMV.oSjTS7afuy',
  TRUE
);
