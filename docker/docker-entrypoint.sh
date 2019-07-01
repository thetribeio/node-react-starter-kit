#!/bin/sh
set -e

if docker-is-script.js "${1}"; then
  set -- yarn "$@"
fi

exec "$@"
