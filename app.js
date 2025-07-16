const express = require('express');
const logger = require('morgan');
const graphRouter = require('./routes/graphRouter');
const egnyteRouter = require('./routes/egnyteRouter');
const notificationRouter = require('./routes/notificationRouter');
const lifecycleRouter = require('./routes/lifecycleRouter');

const app = express();
const router = express.Router();

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/graph', graphRouter);

app.use('/notifications', notificationRouter);
app.use('/lifecycleNotifications', lifecycleRouter);

module.exports = app;
