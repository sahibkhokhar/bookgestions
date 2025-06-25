FROM node:20-alpine AS deps

# Enable corepack so we can use pnpm without a global install
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies based on lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# ---------- Build stage ----------
FROM node:20-alpine AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy necessary files from build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Install production dependencies only
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]