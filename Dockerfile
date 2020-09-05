FROM nathsou/node-12-ghc-8.6.5-ocaml-4.08.1

WORKDIR /usr/src/app/

COPY tsconfig.json jest.config.js ./
COPY tests_package.json ./package.json
COPY src/ ./src/

RUN npm install

CMD [ "npm", "run", "test" ]