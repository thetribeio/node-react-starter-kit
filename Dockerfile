FROM node:12.16.0-slim

COPY docker/docker-entrypoint.sh docker/docker-is-script.js /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

RUN userdel node

ARG UID=1000
RUN useradd --uid $UID --create-home app
USER app

WORKDIR /usr/src/project

ENV PATH="/usr/src/project/node_modules/.bin:${PATH}"

CMD ["start"]
