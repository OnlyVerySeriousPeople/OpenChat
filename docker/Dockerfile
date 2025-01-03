FROM alpine

RUN apk add --no-cache nodejs npm

WORKDIR /dir

COPY package*.json .
RUN npm clean-install

COPY . .
