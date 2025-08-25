import dotenv from 'dotenv';
import app from './app.js';
import ngrok from '@ngrok/ngrok';
import mongoose from 'mongoose';
import logger from './logger.js';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  logger.fatal(err, 'uncaught exception!');
  process.exit(1);
});

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {})
  .then(() =>
    console.log(`${process.env.NODE_ENV}: TEST: DB connection succesful`),
  );

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

if (process.env.NODE_ENV === 'development') {
  (async function () {
    const listener = await ngrok.forward({
      addr: process.env.PORT || 3000,
      authtoken: process.env.NGROK_AUTHTOKEN,
      domain: process.env.NGROK_DOMAIN,
    });
    console.log(`Ingress established at ${listener.url()}`);
  })();
}
process.stdin.resume();

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  logger.fatal(err, 'UNCAUGHT EXCEPTION!');
  server.close(() => {
    process.exit(1);
  });
});
