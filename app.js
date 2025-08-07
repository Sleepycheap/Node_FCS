import express from 'express';
import morgan from 'morgan';
import graphRouter from './routes/graphRouter.js';
import notificationRouter from './routes/notificationRouter.js';
import lifecycleRouter from './routes/lifecycleRouter.js';
import testsRouter from './routes/testsRouter.js';
//import mongoSanitize from 'express-mongo-sanitize';
//import xss from 'xss';
//import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const router = express.Router();

app.use(morgan('dev'));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // minutes * seconds * milliseconds
  message: 'Too many requests from this IP, please try again in an hour!',
});

//app.use(limiter);

app.use(express.json());

// app.use(mongoSanitize());
// // app.use(xss);
// app.use(helmet());

app.use(express.static('./public'));

app.use('/graph', graphRouter);

app.use('/notifications', notificationRouter);
//app.use('/emailsend', emailsendRouter);
app.use('/lifecycleNotifications', lifecycleRouter);
app.use('/test', testsRouter);
//app.use('/saveEmail', emailRouter);

export default app;
