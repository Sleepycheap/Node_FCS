import { getEmail } from '../utils/email.js';
import { getSubject } from './emailController.js';

export const getNotifications = (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(200).type('text/plain').send(validationToken);
  } else {
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
      const subject = await getSubject(resource);
      await getEmail(resource);
    } catch (err) {
      console.log(`Email received, but cannot get data!: ${err}`);
      res.status(503).send();
    }
  }
};
