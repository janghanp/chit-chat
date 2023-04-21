# Base node image
FROM node:16-bullseye-slim as base
ENV NODE_ENV production

# Install all node_modules, including dev dependencies.
FROM base as deps
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --frozen-lockfile --production=false

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
COPY . .
RUN yarn build

# Production
FROM nginx as production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY nginx.conf /etc/nginx/nginx.conf
