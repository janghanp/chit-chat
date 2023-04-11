# Base node image
FROM node:16-bullseye-slim as base
ENV NODE_ENV production
RUN apt-get update && apt-get install -y fuse3 openssl sqlite3 ca-certificates

# Install all node_modules, including dev dependencies.
FROM base as deps
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --frozen-lockfile --production=false

# Development
FROM deps as development
WORKDIR /app
COPY prisma .
RUN npx prisma generate
COPY . .
EXPOSE 8080
CMD [ "yarn", "dev", "&", "npx", "prisma", "studio" ]

# Setup production node_modules
FROM base as production-deps
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Build the app
FROM base as build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY prisma .
RUN npx prisma generate
COPY . .
RUN yarn build

# Production
FROM base as production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/prisma /app/prisma
COPY . .
EXPOSE 8080
CMD [ "node", "dist/index.js" ]