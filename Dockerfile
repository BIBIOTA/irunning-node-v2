FROM node:18-alpine as builder

ENV NODE_ENV build

RUN npm i -g pnpm

USER node
WORKDIR /home/node

COPY package*.json ./

RUN pnpm install

COPY --chown=node:node . .
RUN pnpm run build \
    && pnpm prune --prod

# ---

FROM node:18-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

CMD ["node", "dist/main.js"]
