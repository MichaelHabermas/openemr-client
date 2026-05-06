# Production image: Vite build + Express BFF on one origin.
# Runtime env (set via -e, compose, or orchestrator): OPENEMR_URL, OAUTH_CLIENT_ID,
# OAUTH_CLIENT_SECRET, REDIRECT_URI, APP_ORIGIN; optional PORT, OAUTH_SCOPE.
# Example: APP_ORIGIN and REDIRECT_URI should be the public URL (e.g. https://app.example.com
# and https://app.example.com/callback). Use TLS in front for secure cookies (NODE_ENV=production).

FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY server ./server
COPY tsconfig.server.json ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["bun", "server/index.ts"]
