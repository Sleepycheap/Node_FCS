import express from 'express';
import logger from 'morgan';
import { graphRouter } from './routes/graphRouter.js';
import { notificationRouter } from './routes/notificationRouter.js';
import { lifecycleRouter } from './routes/lifecycleRouter.js';

export const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.static('./public'));

app.use('/graph', graphRouter);

app.use('/notifications', notificationRouter);
app.use('/lifecycleNotifications', lifecycleRouter);

// module.exports = app;
