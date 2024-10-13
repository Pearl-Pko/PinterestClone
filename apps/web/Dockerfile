# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.13.1
ARG PNPM_VERSION=9.6.0

FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@${PNPM_VERSION}
WORKDIR /usr/src/app

FROM base AS build 
# root deps
COPY package*.json ./
COPY pnpm*.yaml ./

#web deps 
RUN mkdir -p apps/web 
RUN mkdir -p packages/schema 

COPY ./apps/web/package*.json ./apps/web
COPY ./packages/schema/package*json ./packages/schema

RUN pnpm --filter web... install --frozen-lockfile --shamefully-hoist
COPY . .
RUN npx prisma generate --schema ./packages/schema/prisma/schema.prisma

ENV API_URL="http://localhost:4000"

RUN pnpm --filter web build 

FROM base AS prod 

COPY --from=build /usr/src/app/apps/web/.next/standalone ./
COPY --from=build /usr/src/app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /usr/src/app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]


