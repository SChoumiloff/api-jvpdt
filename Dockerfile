FROM node:18

WORKDIR /usr/src/jvpdt
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD [ "node", "dist/main.js" ]