import { getEmail } from '../utils/email.js';
import { getSubject } from './emailController.js';
import axios from 'axios';
import { getAccessToken } from './authController.js';
import { sendDenial } from './confirmationController.js';
import logger from '../logger.js';

export const getNotifications = async (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(202).type('text/plain').send(validationToken);
  } else {
    logger.error('GET /notification failed');
    res.status(400).send('Missing Validation Token');
  }
};

export const postNotifications = async (req, res) => {
  if (req.query.validationToken) {
    // RESPONDS TO GRAPH API TO CREATE CHANGE NOTIFICATION
    const validationToken = req.query.validationToken;
    res.status(202).type('text/plain').send(validationToken);
  } else {
    try {
      // This is triggered when new email comes in
      res.status(202).send('Sending 202');
      const resource = req.body.value[0].resource;
      console.log(`🔔 Received notifications: ${resource}`);
      const token = await getAccessToken();
      const call = await axios.get(
        `https://graph.microsoft.com/v1.0/${resource}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const sender = call.data.sender.emailAddress.address;
      const sub = call.data.subject;
      const parser = call.data.bodyPreview;
      console.log(`Parser: ${parser}`);
      await getEmail(resource, sender, sub, parser);
      // return { parser, sender, sub };
    } catch (err) {
      logger.error(err);
      await sendDenial(sender, sub, err);
      res.status(503).send();
    }
  }
};
