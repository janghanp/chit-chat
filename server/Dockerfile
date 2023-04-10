# base node image
FROM node:16-bullseye-slim
ENV NODE_ENV=production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y fuse3 openssl sqlite3 ca-certificates
# ADD prisma .
# RUN npx prisma generate

WORKDIR /app

COPY ["package.json", "yarn-lock.json*", "./"]


RUN yarn install -- production

COPY . .

CMD ["yarn", "dev"]


