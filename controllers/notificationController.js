import { getEmail } from '../utils/email.js';

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
      const resource = req.body.value[0].resource;
      console.log(`🔔 Received notifications: ${resource}`);
      await getEmail(resource);
    }
  } else {
    executed = false;
    return res.send('This email has already been sent!').status(418);
  }
};
