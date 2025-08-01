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

let executed = false;

export const postNotifications = async (req, res) => {
  if (!executed) {
    executed = true;
    if (req.query.validationToken) {
      const validationToken = req.query.validationToken;
      res.status(200).type('text/plain').send(validationToken);
    } else {
      try {
        const resource = req.body.value[0].resource;
        const id = req.body.value[0].resourceData.id;
        console.log(`🔔 Received notifications: ${resource}`);
        const subject = await getSubject(resource);
        await getEmail(resource, subject);
      } catch (err) {
        console.log(`Email received, but cannot get data!: ${err}`);
      }
    }
  } else {
    executed = false;
    return res.send('This email has already been sent!').status(418);
  }
};
