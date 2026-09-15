# 🌧️ Sorocaba — Logística Humanitária

Plataforma web para coordenação de **doações, beneficiários e voluntários** durante enchentes em Sorocaba/SP. Capacidade em tempo real, alertas meteorológicos (Open-Meteo) e roteamento ao ponto de coleta mais próximo com estoque disponível.

```
┌─────────────────────────────────────────────────────────────────────┐
│   Frontend (React + Vite + Tailwind + Leaflet + Recharts)            │
│        │                                                             │
│        │   REST/JSON                                                 │
│        ▼                                                             │
│   Backend (Node.js + Express)                                       │
│        ├─→ PostgreSQL (capacidade, doações, distribuições, chuva)   │
│        ├─→ Open-Meteo API (chuva, sem chave)                        │
│        └─→ Cron (a cada hora: persiste previsão + recalcula alerta) │
└─────────────────────────────────────────────────────────────────────┘
```

## 📐 Stack

| Camada       | Tech                                                 |
|--------------|------------------------------------------------------|
| Frontend     | React 18 · Vite · Tailwind 3 · React-Leaflet · Recharts · React Router |
| Backend      | Node.js 20 · Express 4 · pg · JWT · bcryptjs · helmet · rate-limit · node-cron · qrcode |
| Banco        | PostgreSQL 16                                        |
| Meteorologia | Open-Meteo (gratuita, sem chave)                    |
| Infra        | Docker · docker-compose · Nginx (frontend prod)      |

## 🗺️ Pontos de Coleta

| # | Nome                         | Bairro              | Tipo       |
|---|------------------------------|---------------------|------------|
| 1 | Comunidade Santa Bárbara     | Jardim das Estrelas | Comunidade |
| 2 | Paróquia Santo Antônio       | Vila Haro           | Paróquia   |
| 3 | Paróquia São Carlos Borromeu | Centro              | Centro     |

Capacidades por tipo de item (cesta básica, kit higiene, kit limpeza, água em litros) estão em `backend/db/seeds.sql`.

---

## 🚀 Setup rápido com Docker (recomendado)

Pré-requisito: Docker + Docker Compose.

```bash
git clone <este-repo>
cd sorocaba-logistics
docker compose up --build
```

Quando os containers ficarem saudáveis:

- **Frontend**: http://localhost:8080
- **Backend**:  http://localhost:5000/health
- **Postgres**: localhost:5432 (user/pass: `sorocaba`/`sorocaba`)

Credenciais de admin para testar o dashboard:

```
email: admin@sorocaba-logistics.local
senha: admin123
```

> ⚠️ Em produção, troque o admin padrão, o `JWT_SECRET` e a senha do banco antes de subir.

---

## 🛠️ Setup local (sem Docker)

### 1. Banco de dados

```bash
# instale Postgres 14+ e crie o banco
createdb sorocaba_logistics
psql sorocaba_logistics -f backend/db/schema.sql
psql sorocaba_logistics -f backend/db/seeds.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # ajuste DATABASE_URL/JWT_SECRET se preciso
npm install
npm run dev                # roda em http://localhost:5000
```

Outros scripts úteis:

```bash
npm run db:setup           # re-aplica schema + seeds
npm start                  # produção
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (com proxy para :5000)
```

Build de produção:

```bash
npm run build              # gera ./dist
npm run preview            # serve o build localmente
```

---

## 🔌 API REST

Base URL: `/api`

### Públicas

| Método | Rota                                       | Descrição                                  |
|--------|--------------------------------------------|--------------------------------------------|
| GET    | `/pontos-coleta`                           | Lista os 3 pontos                          |
| GET    | `/pontos-coleta/:id`                       | Detalhe + capacidade + itens que faltam    |
| GET    | `/capacidade`                              | Capacidade atual de todos os pontos        |
| POST   | `/doacoes`                                 | Registra doação (valida espaço + gera QR)  |
| GET    | `/doacoes/protocolo/:protocolo`            | Consulta doação pelo protocolo             |
| POST   | `/beneficiarios/solicitar-ajuda`           | Acha ponto mais próximo com estoque        |
| GET    | `/chuva/sorocaba`                          | Dados atuais + previsão 7 dias             |
| GET    | `/chuva/alerta-atual`                      | Apenas o nível (VERDE/AMARELO/LARANJA/VERMELHO) |
| POST   | `/auth/register`                           | Cadastro (doador/beneficiário/voluntário)  |
| POST   | `/auth/login`                              | Retorna JWT                                |

### Protegidas (Bearer JWT)

| Método | Rota                          | Role                |
|--------|-------------------------------|---------------------|
| GET    | `/auth/me`                    | qualquer autenticado |
| GET    | `/admin/resumo`               | admin               |
| GET    | `/admin/doacoes`              | admin               |
| GET    | `/admin/serie-doacoes`        | admin               |
| GET    | `/admin/alertas`              | admin               |
| GET    | `/admin/exportar`             | admin (CSV)         |
| PATCH  | `/doacoes/:id/status`         | admin, voluntario   |

### Exemplo: criar doação

```bash
curl -X POST http://localhost:5000/api/doacoes \
  -H "Content-Type: application/json" \
  -d '{
    "ponto_coleta_id": 3,
    "tipo_kit": "cesta_basica",
    "quantidade": 5,
    "contato_nome": "Maria",
    "contato_telefone": "(15) 99999-1234"
  }'
```

Resposta (201):

```json
{
  "sucesso": true,
  "protocolo": "DOA-20260514-A1B2C3",
  "doacao": { /* ... */ },
  "qr_code_data_url": "data:image/png;base64,iVBORw0KGgoA..."
}
```

Quando a capacidade está cheia, retorna 409 com sugestão de outro ponto:

```json
{
  "error": "Capacidade insuficiente neste ponto.",
  "details": {
    "espaco_disponivel": 0,
    "sugestao_alternativa": { "id": 2, "nome": "Paróquia Santo Antônio", "espaco_disponivel": 230 },
    "mensagem": "Este ponto está cheio. Sugerimos: Paróquia Santo Antônio (Vila Haro) com 230 unidades de espaço."
  }
}
```

---

## 🧠 Fluxos críticos implementados

### 1. Verificação de capacidade ao registrar doação

Em `doacoes.controller.js` → `criar()`:

1. Valida campos obrigatórios e tipo de kit.
2. Chama `capacidade.service.verificarEspaco(...)`.
3. Se não couber: 409 + ponto alternativo sugerido (mais espaço).
4. Se couber: cria doação **em transação** e incrementa a capacidade atomicamente.
5. Gera protocolo único `DOA-AAAAMMDD-XXXXXX` e QR code (data URL PNG).

### 2. Alerta de chuva (Open-Meteo)

- `chuva.service.buscarDadosSorocaba()` consulta `api.open-meteo.com/v1/forecast` com cache em memória de 15 min.
- `calcularNivelAlerta()` soma a precipitação dos próximos 2 dias:
  - `< 5 mm` → **VERDE**
  - `5–20 mm` → **AMARELO**
  - `20–50 mm` → **LARANJA**
  - `> 50 mm` → **VERMELHO**
- Cron job em `cron.service.js` roda **a cada hora** (`5 * * * *`) e persiste a previsão.

### 3. Roteamento de beneficiários (PVPS-ready)

`beneficiarios.controller.solicitarAjuda()`:

1. Filtra pontos com estoque suficiente do tipo solicitado.
2. Ordena por distância Haversine se o beneficiário informou lat/lon.
3. Reserva o estoque (decrementa a capacidade) em transação.

> O esquema já contempla `data_validade` em `doacoes`, e o endpoint `/admin/alertas` lista doações vencendo em até 5 dias ou já vencidas — base para a regra **PVPS (Primeiro que Vence, Primeiro que Sai)**.

---

## 🗄️ Banco de dados

- `usuarios` — doadores, beneficiários, voluntários e admins (com `senha_hash`).
- `pontos_coleta` — os 3 locais físicos.
- `capacidade_pontos` — capacidade atual e máxima por tipo de item (`UNIQUE(ponto, tipo)`).
- `doacoes` — entradas; status: pendente → recebida → conferida → distribuída (ou cancelada).
- `distribuicoes` — saídas para beneficiários.
- `historico_chuva` e `previsao_chuva`.

Schema completo: [`backend/db/schema.sql`](backend/db/schema.sql).

---

## 🔐 Segurança

- **JWT** com expiração configurável (`JWT_EXPIRATION`).
- **bcryptjs** para hash de senhas (10 rounds).
- **helmet** + **CORS** + **rate-limit** (300 req / 15min em produção).
- **Queries parametrizadas** em todos os controllers (SQL injection-safe).
- **CHECK constraints** garantem enums válidos no Postgres.
- **Transações** em operações que tocam capacidade + doação.

> Para produção: ative SSL no Postgres, rote o `JWT_SECRET` em vault, e considere mover o rate-limit para um Redis compartilhado se houver múltiplas instâncias.

---

## 🚢 Deploy

### Heroku

```bash
heroku create sorocaba-logistics-api
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production JWT_SECRET=$(openssl rand -base64 48)
git subtree push --prefix backend heroku main
heroku run npm run db:setup
```

### DigitalOcean / AWS / VPS

1. Provisione PostgreSQL gerenciado.
2. Suba a imagem do backend (use o `Dockerfile` da pasta).
3. Configure variáveis de ambiente (ver `.env.example`).
4. Sirva o frontend buildado pelo Nginx (ou use o `docker-compose.yml`).
5. Aponte um domínio com HTTPS (Let's Encrypt + Nginx ou Cloudflare).

---

## 🧪 Testes manuais sugeridos

```bash
# 1. Veja capacidade inicial (tudo zerado)
curl http://localhost:5000/api/capacidade | jq

# 2. Doação que cabe
curl -X POST http://localhost:5000/api/doacoes \
  -H "Content-Type: application/json" \
  -d '{"ponto_coleta_id":3,"tipo_kit":"cesta_basica","quantidade":100}'

# 3. Doação que NÃO cabe (volume > capacidade)
curl -X POST http://localhost:5000/api/doacoes \
  -H "Content-Type: application/json" \
  -d '{"ponto_coleta_id":3,"tipo_kit":"cesta_basica","quantidade":9999}'

# 4. Alerta de chuva
curl http://localhost:5000/api/chuva/alerta-atual | jq

# 5. Login admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sorocaba-logistics.local","senha":"admin123"}'
```

---

## 📂 Estrutura de pastas

```
sorocaba-logistics/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── db/
│   │   ├── schema.sql
│   │   └── seeds.sql
│   ├── scripts/
│   │   └── setup-db.js
│   └── src/
│       ├── config/db.js
│       ├── middleware/{auth,errorHandler}.js
│       ├── routes/index.js
│       ├── controllers/{auth,pontos,doacoes,beneficiarios,chuva,admin}.controller.js
│       ├── services/{capacidade,chuva,cron,protocolo}.service.js
│       └── utils/distance.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/{client,endpoints}.js
        ├── context/AuthContext.jsx
        ├── components/{NavBar,AlertBanner,CapacityBar,MapaPontos}.jsx
        └── pages/{Home,Pontos,Doar,Ajuda,Login,Admin}.jsx
```

---

## 📝 Licença

MIT. Use, modifique, distribua à vontade. Se ajudar uma operação humanitária real, mande notícia.
