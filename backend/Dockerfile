FROM node:current-alpine3.22

WORKDIR /app

COPY package.json .

RUN npm install

COPY src/ .

RUN npm install express

CMD ["node", "index.js"]
