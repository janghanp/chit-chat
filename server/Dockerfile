# base node image
FROM node:16-bullseye-slim

# Install openssl for Prisma
RUN apt-get update && apt-get install -y fuse3 openssl sqlite3 ca-certificates

WORKDIR /app

COPY ["package.json", "yarn-lock.json*", "./"]

RUN yarn add -- production
ADD prisma .
RUN npx prisma generate

COPY . .

CMD ["yarn", "dev"]


