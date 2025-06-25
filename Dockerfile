FROM node:20-slim AS deps

# Enable corepack so we can use pnpm without a global install
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies based on lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# ---------- Build stage ----------
FROM node:20-slim AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y && apt-get install -y openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Pass build-time arguments
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

# Build the Next.js application
RUN pnpm build

# ---------- Production stage ----------
FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL and enable pnpm via corepack
RUN apt-get update -y && apt-get install -y openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy necessary files from build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Copy node_modules from builder stage, which includes the generated prisma client
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Run database migrations, then start the app
CMD ["sh", "-c", "npx prisma migrate deploy --schema=/app/prisma/schema.prisma && pnpm start"]