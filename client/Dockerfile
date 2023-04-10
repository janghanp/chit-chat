FROM node:16-bullseye-slim

WORKDIR /app

COPY ["package.json", "yarn-lock.json*", "./"]

RUN yarn add -- production

COPY . .

EXPOSE 5173

CMD ["yarn", "dev"]