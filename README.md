# brev.ly

![Encurtador de Links Thumbnail](https://github.com/user-attachments/assets/3014a783-1dda-4236-9917-03872d5c16e9)

Encurtador de URLs com painel web, API REST e exportação de relatório em CSV hospedado em armazenamento compatível com S3.

## Documentação oficial do desafio (Rocketseat)

| Recurso | Link |
| -------- | ---- |
| Desafio — Fase 1 (Brev.ly) | [Notion — Desafio Fase 1 Brev.ly](https://docs-rocketseat.notion.site/Desafio-Fase-1-Brev-ly-1a8395da577080649fb5d515416e9e34) |
| Requisitos do back-end | [Notion — Descrição e Requisitos (API)](https://docs-rocketseat.notion.site/Descri-o-e-Requisitos-1a8395da577080459f99c0f00b09bd0b?pvs=25) |
| Requisitos do front-end | [Notion — Descrição e Requisitos (Front)](https://docs-rocketseat.notion.site/Descri-o-e-Requisitos-1a8395da5770802bbe18d2f282b190a0) |

## Sobre o projeto

Implementação do desafio prático da pós-graduação **Tech Developer 360** (Faculdade Rocketseat): API em **Node.js** com **Fastify** e interface **React** (SPA com **Vite**).

**Estrutura do repositório**

- `server/` — API HTTP, persistência e geração/upload do CSV (ex.: Cloudflare R2).
- `web/` — SPA React + TypeScript, consumo da API.

## Stack (implementação neste repo)

| Camada | Tecnologias |
| ------ | ----------- |
| Front | React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS |
| Back | Fastify, Zod, Drizzle ORM, PostgreSQL, AWS SDK (S3) para bucket compatível com S3 |

## Como executar

**Pré-requisitos:** Node.js compatível com o projeto, [pnpm](https://pnpm.io/) e Docker (para o PostgreSQL local).

1. **Banco de dados** — na pasta `server/`:

   ```bash
   cd server && docker compose up -d
   ```

   Aguarde o Postgres ficar pronto (o serviço `pg` tem healthcheck). Se você usar `docker compose down -v`, o volume é apagado: será preciso rodar as migrações de novo (passo 3).

2. **Variáveis de ambiente** — copie os exemplos e ajuste conforme o seu ambiente (o desafio exige `.env.example` documentado no front):

   - `server/.env.example` → `server/.env` (inclui `DATABASE_URL`, credenciais do bucket para o CSV, etc.)
   - `web/.env.example` → `web/.env`

   No `DATABASE_URL` do servidor, o **usuário** é `docker` e a **senha** é `docker`; o nome do banco é `brev` (não confundir com o usuário).

3. **Migrações** — com `server/.env` configurado (sem este passo a tabela `links` não existe e a API retorna 500):

   ```bash
   cd server && pnpm install && pnpm run db:migrate:local
   ```

   Com Yarn na pasta `server/`: `yarn install && yarn db:migrate:local`.

4. **API** — em um terminal:

   ```bash
   cd server && pnpm run dev
   ```

   A API sobe na porta definida em `PORT` (padrão **3333** neste exemplo).

5. **Front** — em outro terminal:

   ```bash
   cd web && pnpm install && pnpm run dev
   ```

   O Vite costuma expor o app em **http://localhost:5173**; `VITE_BACKEND_URL` deve apontar para a API.

## Objetivo

Permitir **cadastro**, **listagem** e **remoção** de links encurtados, **relatório de acessos** por link, **redirecionamento** da URL curta para a original e **exportação** dos dados em CSV (com regras de armazenamento e nome de arquivo definidas no desafio da API).

## Funcionalidades e regras

### Front-end

- [x] Deve ser possível criar um link
  - [x] Não deve ser possível criar um link com encurtamento mal formatado
  - [x] Não deve ser possível criar um link com encurtamento já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio do encurtamento
- [x] Deve ser possível listar todas as URL’s cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível baixar um CSV com o relatório dos links criados

Regras adicionais do front (conforme [requisitos oficiais](https://docs-rocketseat.notion.site/Descri-o-e-Requisitos-1a8395da5770802bbe18d2f282b190a0)):

- [x] SPA React com **Vite** como bundler
- [x] Seguir o layout do **Figma** o mais fielmente possível
- [x] Boa UX: *empty state*, feedback de carregamento, desabilitar ações conforme o estado
- [x] Layout **responsivo** (desktop e mobile)

#### Páginas da SPA

Conforme o material do desafio:

| Rota | Comportamento |
| ---- | --------------- |
| `/` | Formulário de cadastro e listagem dos links |
| `/:url-encurtada` | Lê o segmento da URL, consulta a API e redireciona para a URL original |
| Demais rotas | Página de recurso não encontrado (404), inclusive quando o encurtamento não existe |

#### Ferramentas (desafio)

- **Obrigatório:** TypeScript, React, Vite **sem** meta-framework (ex.: não é obrigatório Next.js no escopo base).
- **Flexível:** Tailwind CSS, React Query, React Hook Form, Zod (este projeto utiliza essas opções no `web/`).

#### Dicas do material (resumo)

- Começar pelo **Style Guide** no Figma (tema, fontes, componentes).
- Priorizar **mobile first** ao estilizar.
- Usar bibliotecas que melhorem **DX** quando fizer sentido.

### Back-end

- [x] Deve ser possível criar um link
  - [x] Não deve ser possível criar um link com URL encurtada mal formatada
  - [x] Não deve ser possível criar um link com URL encurtada já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio de uma URL encurtada
- [x] Deve ser possível listar todas as URL’s cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível exportar os links criados em um CSV
  - [x] Deve ser possível acessar o CSV por meio de uma CDN (Amazon S3, Cloudflare R2, etc.)
  - [x] Deve ser gerado um nome aleatório e único para o arquivo
  - [x] Deve ser possível realizar a listagem de forma performática
  - [x] O CSV deve ter campos como URL original, URL encurtada, contagem de acessos e data de criação

Detalhes e contexto adicional: [requisitos da API no Notion](https://docs-rocketseat.notion.site/Descri-o-e-Requisitos-1a8395da577080459f99c0f00b09bd0b?pvs=25).

## Ir além (opcional)

Ideias citadas no material do desafio (não obrigatórias para correção): SSR/Remix/Next, metadados **OpenGraph**, upload de imagem para preview, **UI otimista** no cadastro. Vale enviar a versão obrigatória antes ou isolar em *branch* separada.

---

Feito no contexto do programa **Tech Developer 360** — [Rocketseat](https://www.rocketseat.com.br/).
