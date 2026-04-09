# Brev.ly - API Backend

API para gerenciamento de encurtamento de URLs. Desenvolvido com TypeScript, Fastify, Drizzle ORM e PostgreSQL.

Referência de requisitos do desafio: [Rocketseat — Descrição e Requisitos](https://docs-rocketseat.notion.site/Descri-o-e-Requisitos-1a8395da577080459f99c0f00b09bd0b).

## Checklist (requisitos do desafio)

- [x] Uso do banco de dados **Postgres**
- [x] Deve ser possível **criar** um link
- [x] Não deve ser possível criar um link com URL encurtada **mal formatada**
- [x] Não deve ser possível criar um link com URL encurtada **já existente**
- [x] Deve ser possível **deletar** um link
- [x] Deve ser possível obter a **URL original** por meio de uma URL encurtada
- [x] Deve ser possível **listar todas** as URL's cadastradas (via paginação + `total` para listagem performática)
- [x] Deve ser possível **incrementar** a quantidade de acessos de um link
- [x] Deve ser possível **exportar** os links criados em um CSV
- [x] Deve ser possível **acessar o CSV** por meio de uma CDN (Cloudflare R2)
- [x] Deve ser gerado um **nome aleatório e único** para o arquivo exportado
- [x] Listagem **performática** (paginação, índice em `created_at`, contagem total em query dedicada)
- [x] O CSV contém **URL original**, **URL encurtada**, **contagem de acessos** e **data de criação**

**Padrão de identificação:** operações de resolver URL, incrementar acessos e deletar usam a **URL encurtada** (`shortUrl`), de forma consistente (recomendação do enunciado).

## Ferramentas obrigatórias (desafio)

- TypeScript
- Fastify
- Drizzle
- Postgres

## Outras tecnologias

- `fastify-type-provider-zod`, OpenAPI / Swagger UI em `/docs`
- Cloudflare R2 (S3-compatible) para o CSV na CDN
- Zod, Biome, Vitest

## Configuração

### Variáveis de ambiente (obrigatório: `.env.example`)

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não (default: 3333) | Porta do servidor |
| `NODE_ENV` | Não | `development` \| `test` \| `production` |
| `DATABASE_URL` | Sim | URL PostgreSQL (`postgresql://...`) |
| `CLOUDFLARE_ACCOUNT_ID` | Para export CSV | ID da conta Cloudflare |
| `CLOUDFLARE_ACCESS_KEY_ID` | Para export CSV | Access Key do R2 |
| `CLOUDFLARE_ACCESS_SECRET_KEY` | Para export CSV | Secret Key do R2 |
| `CLOUDFLARE_BUCKET` | Para export CSV | Nome do bucket R2 |
| `CLOUDFLARE_PUBLIC_URL` | Para export CSV | URL pública do bucket (CDN) |

Em desenvolvimento, `pnpm dev` carrega o `.env` via `tsx --env-file .env`.

### Banco local (Docker)

```bash
docker compose up -d
```

O script [`docker/init.sql`](docker/init.sql) cria o banco `brev_test` na primeira inicialização. O banco principal da aplicação é `brev` (`POSTGRES_DB` no compose).

### Execução local

```bash
pnpm install

# Migrations (com variáveis do .env)
pnpm db:migrate:local

pnpm dev
pnpm build
pnpm start
```

### Testes

Com o Postgres rodando e `brev_test` criado:

```bash
pnpm test
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/links` | Cria um novo link |
| `GET` | `/links` | Lista links (`page`, `pageSize`, `searchQuery`, `sortBy`, `sortDirection`) |
| `GET` | `/links/:shortUrl` | Retorna a URL original e incrementa contador de acessos |
| `DELETE` | `/links/:shortUrl` | Remove um link |
| `POST` | `/links/export-csv` | Exporta CSV para o R2; resposta `{ reportUrl }` |

Documentação interativa: **http://localhost:3333/docs**

CORS está habilitado (`origin: '*'`).

### Exemplos

**Criar link:**

```bash
curl -X POST http://localhost:3333/links \
  -H "Content-Type: application/json" \
  -d '{"original_url": "https://example.com", "short_url": "exemplo"}'
```

**Listar (paginado):**

```bash
curl 'http://localhost:3333/links?page=1&pageSize=20'
```

**Exportar CSV:**

```bash
curl -X POST 'http://localhost:3333/links/export-csv?searchQuery=foo'
```

## Scripts

- `pnpm dev` — desenvolvimento (`tsx watch --env-file .env`)
- `pnpm build` / `pnpm start` — produção
- `pnpm lint` / `pnpm format` — Biome
- `pnpm test` / `pnpm test:watch` — Vitest (carrega `.env.test` via `src/test/setup-env.ts`)
- **`pnpm db:migrate`** — executa migrations (chave exigida pelo desafio; usa `DATABASE_URL` do ambiente)
- `pnpm db:migrate:local` — migrations carregando `.env`
- `pnpm db:generate` / `pnpm db:studio` — Drizzle Kit (com `.env`)

## Docker

O [`Dockerfile`](Dockerfile) gera a imagem de produção da aplicação (multi-stage, usuário não root, migrations na subida).
