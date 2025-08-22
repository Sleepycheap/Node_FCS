import dotenv from 'dotenv';
import app from './app.js';
import ngrok from '@ngrok/ngrok';
import mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {})
  .then(() => console.log(`${process.env.NODE_ENV}: DB connection succesful`));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

if (process.env.NODE_ENV !== 'production') {
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
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
