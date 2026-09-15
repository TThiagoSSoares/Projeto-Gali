-- =====================================================================
-- SOROCABA LOGISTICS - DATABASE SCHEMA
-- Sistema de Logística Humanitária - Sorocaba, SP
-- =====================================================================

-- Limpeza segura (uso em dev)
DROP TABLE IF EXISTS previsao_chuva CASCADE;
DROP TABLE IF EXISTS historico_chuva CASCADE;
DROP TABLE IF EXISTS distribuicoes CASCADE;
DROP TABLE IF EXISTS doacoes CASCADE;
DROP TABLE IF EXISTS capacidade_pontos CASCADE;
DROP TABLE IF EXISTS pontos_coleta CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- =====================================================================
-- USUÁRIOS
-- =====================================================================
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    telefone        VARCHAR(20),
    tipo            VARCHAR(20) NOT NULL
                    CHECK (tipo IN ('doador', 'beneficiario', 'voluntario', 'admin')),
    cpf             VARCHAR(14) UNIQUE,
    endereco        TEXT,
    bairro          VARCHAR(100),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    ativo           BOOLEAN DEFAULT TRUE,
    data_cadastro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    senha_hash      VARCHAR(255)
);

CREATE INDEX idx_usuario_email ON usuarios(email);

-- =====================================================================
-- PONTOS DE COLETA
-- =====================================================================
CREATE TABLE pontos_coleta (
    id                      SERIAL PRIMARY KEY,
    nome                    VARCHAR(255) NOT NULL,
    endereco                TEXT NOT NULL,
    cep                     VARCHAR(10),
    bairro                  VARCHAR(100),
    latitude                DECIMAL(10, 8) NOT NULL,
    longitude               DECIMAL(11, 8) NOT NULL,
    telefone                VARCHAR(20),
    horario_funcionamento   VARCHAR(100),
    email_responsavel       VARCHAR(255),
    tipo                    VARCHAR(50),
    ativo                   BOOLEAN DEFAULT TRUE
);

-- =====================================================================
-- CAPACIDADE DOS PONTOS (controle de ocupação por tipo de item)
-- =====================================================================
CREATE TABLE capacidade_pontos (
    id                      SERIAL PRIMARY KEY,
    ponto_coleta_id         INTEGER NOT NULL REFERENCES pontos_coleta(id) ON DELETE CASCADE,
    tipo_item               VARCHAR(50) NOT NULL,
    quantidade_atual        INTEGER DEFAULT 0,
    capacidade_maxima       INTEGER NOT NULL,
    ultima_atualizacao      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alertado_80_percent     BOOLEAN DEFAULT FALSE,
    UNIQUE (ponto_coleta_id, tipo_item)
);

-- =====================================================================
-- DOAÇÕES (entrada)
-- =====================================================================
CREATE TABLE doacoes (
    id                          SERIAL PRIMARY KEY,
    usuario_id                  INTEGER REFERENCES usuarios(id),
    ponto_coleta_id             INTEGER NOT NULL REFERENCES pontos_coleta(id),
    tipo_kit                    VARCHAR(50) NOT NULL,
    quantidade                  INTEGER NOT NULL CHECK (quantidade > 0),
    descricao                   TEXT,
    data_prevista_entrega       TIMESTAMP,
    data_doacao_efetiva         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_validade               DATE,
    status                      VARCHAR(20) DEFAULT 'pendente'
                                CHECK (status IN ('pendente', 'recebida', 'conferida', 'distribuida', 'cancelada')),
    numero_protocolo            VARCHAR(20) UNIQUE NOT NULL,
    observacoes                 TEXT,
    foto_url                    VARCHAR(500),
    -- contato direto caso doador anônimo
    contato_nome                VARCHAR(255),
    contato_telefone            VARCHAR(20)
);

CREATE INDEX idx_doacao_ponto ON doacoes(ponto_coleta_id);
CREATE INDEX idx_doacao_data ON doacoes(data_doacao_efetiva);
CREATE INDEX idx_doacao_validade ON doacoes(data_validade);
CREATE INDEX idx_doacao_status ON doacoes(status);

-- =====================================================================
-- DISTRIBUIÇÕES (saída para beneficiários)
-- =====================================================================
CREATE TABLE distribuicoes (
    id                  SERIAL PRIMARY KEY,
    beneficiario_id     INTEGER REFERENCES usuarios(id),
    ponto_coleta_id     INTEGER NOT NULL REFERENCES pontos_coleta(id),
    tipo_kit            VARCHAR(50) NOT NULL,
    quantidade          INTEGER NOT NULL CHECK (quantidade > 0),
    quantidade_pessoas  INTEGER,
    motivo              VARCHAR(200),
    data_retirada       TIMESTAMP,
    data_entrega        TIMESTAMP,
    voluntario_id       INTEGER REFERENCES usuarios(id),
    status              VARCHAR(20) DEFAULT 'agendada'
                        CHECK (status IN ('agendada', 'retirada', 'entregue', 'cancelada')),
    numero_protocolo    VARCHAR(20) UNIQUE NOT NULL,
    observacoes         TEXT,
    contato_nome        VARCHAR(255),
    contato_telefone    VARCHAR(20),
    endereco_entrega    TEXT,
    modo_recebimento    VARCHAR(20) CHECK (modo_recebimento IN ('retirada', 'entrega'))
);

CREATE INDEX idx_distribuicao_beneficiario ON distribuicoes(beneficiario_id);
CREATE INDEX idx_distribuicao_status ON distribuicoes(status);

-- =====================================================================
-- HISTÓRICO DE CHUVA
-- =====================================================================
CREATE TABLE historico_chuva (
    id                  SERIAL PRIMARY KEY,
    data                DATE NOT NULL,
    hora                TIME,
    precipitacao_mm     DECIMAL(6, 2),
    temperatura_celsius DECIMAL(5, 2),
    umidade_relativa    INTEGER,
    condicao_tempo      VARCHAR(50),
    data_registro       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chuva_data ON historico_chuva(data);

-- =====================================================================
-- PREVISÃO DE CHUVA (próximos 7 dias)
-- =====================================================================
CREATE TABLE previsao_chuva (
    id                              SERIAL PRIMARY KEY,
    data_previsao                   DATE NOT NULL,
    hora                            TIME,
    precipitacao_esperada_mm        DECIMAL(6, 2),
    temperatura_minima              DECIMAL(5, 2),
    temperatura_maxima              DECIMAL(5, 2),
    condicao_prevista               VARCHAR(50),
    probabilidade_chuva_percent     INTEGER,
    data_atualizacao                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (data_previsao, hora)
);

CREATE INDEX idx_previsao_data ON previsao_chuva(data_previsao);
