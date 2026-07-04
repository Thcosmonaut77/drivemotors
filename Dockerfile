FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN RUN npm install --omit=dev && npm cache clean --force

COPY . .

RUN node seed.js

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "server.js"]
