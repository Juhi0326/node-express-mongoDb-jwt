const http = require('http');
const app = require("./app");
const mongoose = require('mongoose');
const port = process.env.PORT || 8081;

const server = http.createServer(app);





server.listen(port);