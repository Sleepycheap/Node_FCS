import express from 'express';
import morgan from 'morgan';
import graphRouter from './routes/graphRouter.js';
import notificationRouter from './routes/notificationRouter.js';
import lifecycleRouter from './routes/lifecycleRouter.js';
import emailTestRouter from './routes/emailTestRouter.js';
import emailRouter from './routes/emailRouter.js';

const app = express();
const router = express.Router();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('./public'));

app.use('/graph', graphRouter);

app.use('/notifications', notificationRouter);
app.use('/lifecycleNotifications', lifecycleRouter);
app.use('/emailTest', emailTestRouter);
app.use('/saveEmail', emailRouter);

export default app;
