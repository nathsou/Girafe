FROM node:12-alpine

WORKDIR /usr/src/app/

COPY package.json package-lock.json tsconfig.json jest.config.js ./
COPY src/ ./src/

RUN apk add ghc=8.6.5-r3
RUN npm install

CMD [ "npm", "run", "test" ]