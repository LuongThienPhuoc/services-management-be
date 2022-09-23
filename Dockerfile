FROM node

WORKDIR /app

COPY ./package.json ./

RUN npm install -g npm@8.19.2

RUN npm install --force

COPY . .

CMD ["node", "indexProduct.js"]
