# ── Stage 1: Build the React frontend ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production dependencies manifest and install
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend server files
COPY server.js ./
COPY server/ ./server/

# Cloud Run sets PORT automatically; default to 8080
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
