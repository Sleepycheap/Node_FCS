const express = require('express');
const logger = require('morgan');
const graphRouter = require('./routes/graphRouter');
const egnyteRouter = require('./routes/egnyteRouter');
const notificationRouter = require('./routes/notificationRouter');

const app = express();
const router = express.Router();

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/graph', graphRouter);

app.use('/notifications', notificationRouter);

module.exports = app;
