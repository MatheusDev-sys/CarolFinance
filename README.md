# Carol Finance 💸

Sistema de controle financeiro feito pra facilitar a vida da Carolaine.

A ideia é simples: ela consegue registrar pedidos, acompanhar o histórico e ter tudo organizado num lugar só — sem planilha, sem papel, sem dor de cabeça.

## O que tem aqui

- Login com autenticação via Supabase
- Dashboard com visão geral dos pedidos
- Área de admin separada
- Novo pedido com upload de imagem
- Ajustes de conta
- Funciona como app no celular (PWA) — é só adicionar na tela inicial

## Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (auth + banco)
- Hospedado no GitHub Pages

## Rodar localmente

Precisa ter o Node.js instalado.

```bash
npm install
```

Cria um arquivo `.env` na raiz com:

```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

Depois é só:

```bash
npm run dev
```

## Deploy

O deploy é automático via GitHub Actions sempre que tem push na `main`. O site vai pra:

```
https://matheusdev-sys.github.io/CarolFinance/
```
