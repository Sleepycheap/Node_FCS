import pino from 'pino';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const __dirname = import.meta.dirname;

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: `${__dirname}/app.log` },
    },
    {
      target: 'pino-pretty',
    },
  ],
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

export default logger;
