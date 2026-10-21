# Alumni Tracking System: production image
# Builds the Next.js app and runs it with `npm start` (next start) on port 3000.
# The same image also runs the database migrations (`npm run migrate`) and the seed (`npm run seed`).
# Node 24 LTS (ships npm 11, which matches package-lock.json); Next.js 16 needs Node >= 20.9.

# ---- 1. Build: install all dependencies and run `next build` ----
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies first, so Docker can reuse this layer when only the code changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- 2. Run: production dependencies + the build output only ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts
# Static files served as-is from the site root, e.g. /logo.png (the university logo in the header)
COPY --from=builder /app/public ./public

# Database migrations, the migration runner, the seed script and the factories (all in scripts/),
# used by the "migrate" and "seed" services in docker-compose.yml
COPY migrations ./migrations
COPY scripts ./scripts

# Run as the unprivileged "node" user that the official image provides
USER node

EXPOSE 3000
CMD ["npm", "start"]
