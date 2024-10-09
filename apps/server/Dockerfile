# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.13.1
ARG PNPM_VERSION=9.6.0

FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@${PNPM_VERSION}
WORKDIR /usr/src/app

# root deps
COPY package*.json ./
COPY pnpm*.yaml ./

#server deps 
RUN mkdir -p apps/server 
RUN mkdir -p packages/schema 

COPY ./apps/server/package*.json ./apps/server
COPY ./packages/schema/package*json ./packages/schema

FROM base AS build 

# install the server and dependent package dependencies
RUN pnpm --filter server... install
COPY . .

RUN npx prisma generate --schema ./packages/schema/prisma/schema.prisma

RUN pnpm --filter server... build 


FROM base AS prod 

ENV NODE_ENV=production

RUN mkdir -p apps/server/dist

COPY --from=build /usr/src/app/apps/server/dist ./apps/server/dist

RUN pnpm --filter server... install --prod

COPY ./apps/server/nest-cli.json ./apps/server
EXPOSE 4000

CMD ["pnpm", "--filter", "server", "start"]



