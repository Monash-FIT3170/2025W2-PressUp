# Stage 1: Build Meteor App
FROM node:18.18-bookworm AS build

ENV METEOR_ALLOW_SUPERUSER=true
WORKDIR /app

RUN curl https://install.meteor.com/ | sh

# Ensure Meteor is in PATH
ENV PATH="/root/.meteor:${PATH}"

COPY . .
RUN meteor npm ci || meteor npm install
RUN meteor build --directory /build --server-only
RUN cd /build/bundle/programs/server && (npm ci || npm install --production)

# Stage 2: Run Meteor App
FROM node:18.18-bookworm as server

WORKDIR /build

COPY --from=build /build/bundle /build
COPY private/settings.json /build/settings.json
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV BIND_IP=0.0.0.0
ENV PORT=3000
ENV METEOR_SETTINGS_FILE=/build/settings.json

EXPOSE $PORT
USER node
ENTRYPOINT ["/entrypoint.sh"]
