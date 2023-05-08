FROM node:latest

WORKDIR /usr/src/app

COPY package.json .
RUN npm install --production

COPY ./build ./

EXPOSE 3000
CMD ["node", "index.js"]