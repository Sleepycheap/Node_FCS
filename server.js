import dotenv from 'dotenv';
import { app } from './app.js';
import ngrok from '@ngrok/ngrok';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

(async function () {
  const listener = await ngrok.forward({
    addr: process.env.PORT || 3000,
    authtoken: process.env.NGROK_AUTHTOKEN,
    domain: 'balanced-fully-moccasin.ngrok-free.app',
  });
  console.log(`Ingress established at ${listener.url()}`);
})();
process.stdin.resume();

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
