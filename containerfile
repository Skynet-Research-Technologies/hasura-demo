FROM node:24 AS builder

WORKDIR /app
COPY . ./

RUN npm install
