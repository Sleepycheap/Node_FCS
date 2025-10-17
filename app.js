import express from 'express';
import pino from 'pino-http';
import graphRouter from './routes/graphRouter.js';
import notificationRouter from './routes/notificationRouter.js';
import lifecycleRouter from './routes/lifecycleRouter.js';
import testsRouter from './routes/testsRouter.js';
import emailsendRouter from './routes/emailsendRouter.js';
import mongoSanitize from 'express-mongo-sanitize';
import fs from 'fs';
import EmlParser from 'eml-parser';
import { rateLimit } from 'express-rate-limit';
import formsRouter from './routes/formsRouter.js';
import formLifeRouter from './routes/formLifeRouter.js';
import { formLifeCycle } from './controllers/formsController.js';
import apiRouter from './routes/apiRouter.js';
import path from 'path';
import logger from './logger.js';
import pinoHTTP from 'pino-http';
import { fileURLToPath } from 'url';
import { parseEml } from './emlParse.js';

const app = express();

//app.use(morgan('dev'));
app.use(pinoHTTP({ logger }));

const limiter = rateLimit({
  limit: 15,
  windowMs: 60 * 60 * 1000, // minutes * seconds * milliseconds
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(limiter);

app.use(express.json());

app.use(mongoSanitize());
//app.use(xss);
//app.use(helmet());

app.use(express.static('public'));

//app.use('/graph', graphRouter);

// app.get('/', function (req, res, next) {
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = path.dirname(__filename);
//   const _restfile = path.join(__dirname, 'index.html');
//   res.sendFile(_restfile);
// });
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});
app.use('/notifications', notificationRouter);
app.use('/emailsend', emailsendRouter);
app.use('/lifecycleNotifications', lifecycleRouter);
app.use('/test', testsRouter);
app.use('/forms', formsRouter);
app.use('/formLifecycle', formLifeRouter);
app.use('/api', apiRouter);
app.get('/hello', (req, res) => {
  res.status(200).send('Hello! You are connected to ReDirect');
  console.log('Hello There!');
});
// app.get('/eml', async (req, res) => {
//   try {
//     const emlFilePath = path.resolve('test.eml');
//     const stream = fs.createReadStream(emlFilePath);
//     const parser = new EmlParser(stream);

//     const parsedEmail = await parser.parseEml();

//     console.log(`parsed email: ${parsedEmail}`);
//     console.log(`Subject: ${parsedEmail.subject}`);
//     console.log(`From: ${parsedEmail.from}`);
//     console.log(`Text body: ${parsedEmail.text}`);
//     console.log(`Html body: ${parsedEmail.html}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'failed to parse eml file' });
//   }
// });
app.get('/eml', parseEml);

app.get('*', (req, res) => {
  res.status(404).send('Route not found!');
});
//app.use('/saveEmail', emailRouter);

export default app;
