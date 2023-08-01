# Base node image
FROM node:18-bullseye-slim as base

# Install all node_modules, including dev dependencies.
FROM base as deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Setup production node_modules
FROM base as production-deps
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY package*.json ./
RUN npm install --omit=dev

# Build the app
FROM base as build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npm run build

# Production with nginx
FROM nginx as production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
