import { getEmail } from '../utils/email.js';

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
    const validationToken = req.query.validationToken;
    res.status(200).type('text/plain').send(validationToken);
  } else {
    const resource = req.body.value[0].resource;
    console.log(`🔔 Received notifications: ${resource}`);
    await getEmail(resource);
  }
};
