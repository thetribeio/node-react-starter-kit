FROM node:10.15.1-slim

RUN userdel node

ARG UID=1000
RUN useradd --uid $UID --create-home app
USER app

WORKDIR /usr/src/project

ENV PATH="/usr/src/project/node_modules/.bin:${PATH}"

CMD ["yarn", "start"]
