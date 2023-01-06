FROM node:18.12-bullseye-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 8080
CMD [ "yarn", "dev" ]