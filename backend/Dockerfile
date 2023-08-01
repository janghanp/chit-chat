# Base node image
FROM node:18-bullseye-slim as base
RUN apt-get update && apt-get install -y fuse3 openssl sqlite3 ca-certificates

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

# Production
FROM base as build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN npx prisma generate
RUN npm run build
EXPOSE 9000
CMD [ "npm", "start" ]



