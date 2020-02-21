################ Build the application ############################

FROM node:12.16.0-slim as build

WORKDIR /usr/src/app

ENV PATH="/usr/src/app/node_modules/.bin:${PATH}"

COPY package.json yarn.lock ./
RUN yarn install

COPY babel.config.js ./
COPY tools ./tools
COPY api ./api
COPY app ./app

ENV NODE_ENV=production

RUN yarn build
RUN babel api/migrations -d build/migrations --copy-files
RUN babel api/db.config.js -o build/db.config.js
COPY .production/.sequelizerc ./build

RUN cp -f build/package.json .

RUN yarn install

################ Build the finale image ###################

FROM node:12.16.0-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./

ENV NODE_ENV=production

CMD [ "yarn", "start" ]
