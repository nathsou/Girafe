FROM nathsou/node-12-ghc-8.6.5-ocaml-4.08.1

WORKDIR /usr/src/app/

COPY package.json package-lock.json tsconfig.json jest.config.js ./
COPY src/ ./src/

RUN npm install

CMD [ "npm", "run", "test" ]