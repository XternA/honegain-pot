FROM node:22-alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache chromium

ENV TERM=xterm-256color
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

ENV PROCESS_WAIT=true
ENV IS_CONTAINER=true

COPY . ./

# Bootstrap
CMD while true; do sh run.sh; sleep 60; done
