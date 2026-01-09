FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/cache/apk/* /root/.npm && \
    find /app/node_modules -type d \( -name "test" -o -name "tests" -o -name "__tests__" \) -exec rm -rf {} + 2>/dev/null || true && \
    find /app/node_modules -type f \( -name "*.map" -o -name "*.ts" -o -name "*.tsx" \) -delete 2>/dev/null || true

COPY swagger_output.json* ./

COPY src ./src

RUN mkdir -p uploads logs && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8001/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]