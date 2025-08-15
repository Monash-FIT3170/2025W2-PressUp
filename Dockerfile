# Stage 1: Build Meteor App
FROM node:18.18-bookworm AS build

ENV METEOR_ALLOW_SUPERUSER=true
WORKDIR /app

RUN curl https://install.meteor.com/ | sh

# Ensure Meteor is in PATH
ENV PATH="/root/.meteor:${PATH}"

COPY . .
RUN meteor npm install && \
    meteor build --directory /build --server-only && \
    cd /build/bundle/programs/server && \
    npm install

# Stage 2: Run Meteor App
FROM node:18.18-bookworm-slim as server

RUN useradd --user-group --create-home --shell /bin/false appuser
WORKDIR /build

COPY --from=build /build/bundle /build

USER appuser

ENV PORT=3000
EXPOSE 3000

CMD ["node", "main.js"]