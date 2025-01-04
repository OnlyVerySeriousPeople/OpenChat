FROM node:20-bookworm

RUN npx -y playwright@1.49.1 install --with-deps

WORKDIR /dir

COPY package*.json .
RUN npm clean-install

COPY . .
