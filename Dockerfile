FROM node:18.17.1
RUN npm i -g nodemon
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
ENTRYPOINT [ "npm","start" ]