---
description: Bun for package manager and scripts; Vite + React for this repo's frontend.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to **Bun** instead of Node.js for installs and script execution.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest` (unless the project adds Vitest explicitly)
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads `.env` for the BFF; don't add `dotenv` for server env in this repo

## This repo's frontend

The **openemr-client** app uses **Vite + React + TypeScript** under `src/`. Use `bun run dev` / `bun run build` (Vite). Do not rip out Vite in favor of Bun HTML imports unless the team explicitly changes stack.

## BFF

OAuth and FHIR proxy live in `server/` (Express). Keep `client_secret` and token exchange server-only.

**Agents:** Do not read `.env` or other live env files; use `.env.example` and ask the human to verify values locally. `.cursorignore` excludes `.env` from indexing.

## Optional Bun APIs (elsewhere)

For greenfield Bun servers without Vite: `Bun.serve()`, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.file`, `Bun.$` — see Bun docs. This repo's BFF may stay on Express for now.
