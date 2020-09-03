FROM node:12

WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.json jest.config.js ./
COPY src/ ./src/

RUN npm install
RUN npm run test
