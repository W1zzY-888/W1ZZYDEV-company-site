FROM node:24.11.1-alpine3.22

WORKDIR /app
ENV NODE_ENV=staging

RUN addgroup -S w1zzydev && adduser -S -G w1zzydev -u 10001 w1zzydev

COPY package.json ./
COPY index.js ./
COPY api ./api
COPY auth ./auth
COPY chat ./chat
COPY config ./config
COPY consents ./consents
COPY controllers ./controllers
COPY core ./core
COPY crm ./crm
COPY database ./database
COPY middleware ./middleware
COPY notifications ./notifications
COPY providers ./providers
COPY repositories ./repositories
COPY routing ./routing
COPY services ./services
COPY storage ./storage
COPY types ./types
COPY utils ./utils
COPY validation ./validation
COPY deploy/ru-staging/scripts/ru-only-staging-server.js ./deploy/ru-staging/scripts/ru-only-staging-server.js
COPY deploy/ru-staging/scripts/backend-entrypoint.sh ./deploy/ru-staging/scripts/backend-entrypoint.sh

USER 10001:10001
EXPOSE 8787

CMD ["sh", "deploy/ru-staging/scripts/backend-entrypoint.sh"]
