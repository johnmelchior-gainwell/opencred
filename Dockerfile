# Copyright 2023 - 2026 California Department of Motor Vehicles
# Copyright 2023 - 2026 Digital Bazaar, Inc.
#
# SPDX-License-Identifier: BSD-3-Clause

FROM node:24-alpine AS base
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

FROM base AS build-setup
# TEMP(corp-network): trust corporate TLS-intercepting CA for apk/npm
COPY corp-ca.crt /usr/local/share/ca-certificates/corp-ca.crt
RUN set -eux; \
  for f in /etc/ssl/certs/ca-certificates.crt /etc/ssl/cert.pem; do \
    if [ -f "$f" ] && [ ! -L "$f" ]; then \
      printf '\n' >> "$f"; \
      cat /usr/local/share/ca-certificates/corp-ca.crt >> "$f"; \
    fi; \
  done
RUN apk add --no-cache git bash

FROM build-setup AS build
ARG NODE_AUTH_TOKEN
# TEMP(corp-network): make Node/npm trust corporate CA
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/corp-ca.crt
USER node
COPY --chown=node:node . .
RUN mv dev.js index.js

RUN npm ci --omit=dev --package-lock
RUN node index.js bundle --webpack-mode production --bundle-mode production

FROM build AS test
# RUN cd test && npm t
# RUN rm -rf test#

FROM base AS release
COPY --from=test --chown=node:node /home/node/app ./
EXPOSE 22443
ENV NODE_ENV=production
CMD [ "node", "index", "--bundle-mode", "production"]
