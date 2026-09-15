# FreshPack

Site do projeto integrador de Engenharia de Produção (Uniso) — protótipo digital de uma seladora com atmosfera controlada para o hortifrúti de supermercados regionais. Não existe máquina física: este site é o produto que demonstra o projeto na apresentação.

## Stack

- Next.js + TypeScript + Tailwind CSS
- react-three-fiber + drei (modelo 3D da seladora)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura de conteúdo

Textos e listas ficam em arquivos de dados separados dos componentes, para edição sem mexer em código:

- `src/data/site.ts` — nome, tagline e navegação
- `src/data/components.ts` — lista de componentes de montagem da seladora (também usada como pontos clicáveis no modelo 3D)

## Deploy

Publicado na Vercel a cada push na branch `master`.
