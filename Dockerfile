FROM node:24-alpine3.23 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN pnpm build
RUN pnpm prune --prod

# Clean node_modules
RUN find node_modules -name '*.md' -o -name '*.ts' -o -name '*.map' -o -name 'LICENSE*' -o -name 'CHANGELOG*' | head -5000 | xargs rm -f 2>/dev/null; \
    find node_modules -type d -name 'test' -o -name 'tests' -o -name '__tests__' -o -name 'docs' | xargs rm -rf 2>/dev/null; \
    exit 0

FROM node:24-alpine3.23

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/build build/
COPY --from=builder --chown=nodejs:nodejs /app/node_modules node_modules/
COPY --from=builder --chown=nodejs:nodejs /app/package.json .
COPY --from=builder --chown=nodejs:nodejs /app/prisma prisma/

RUN mkdir -p /app/data/bibles && chown -R nodejs:nodejs /app/data

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build"]
