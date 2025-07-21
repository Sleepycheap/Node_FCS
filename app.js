import express from 'express';
import morgan from 'morgan';
import graphRouter from './routes/graphRouter.js';
import notificationRouter from './routes/notificationRouter.js';
import lifecycleRouter from './routes/lifecycleRouter.js';

const app = express();
const router = express.Router();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('./public'));

app.use('/graph', graphRouter);

app.use('/notifications', notificationRouter);
app.use('/lifecycleNotifications', lifecycleRouter);

export default app;
