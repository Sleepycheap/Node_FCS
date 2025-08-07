import { getEmail } from '../utils/email.js';
import { getSubject } from './emailController.js';
import axios from 'axios';

export const getNotifications = (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(200).type('text/plain').send(validationToken);
  } else {
    res.status(400).send('Missing Validation Token');
  }
};

// ALL NEW EMAILS WILL HAVE 'EXECUTED' SET TO FALSE FORCEFULLY
// let executed = false;

export const postNotifications = async (req, res) => {
  const resource = req.body.value[0].resource;
  if (req.query.validationToken) {
    // RESPONDS TO GRAPH API TO CREATE CHANGE NOTIFICATION
    const validationToken = req.query.validationToken;
    res.status(200).type('text/plain').send(validationToken);
  } else {
    try {
      // This is triggered when new email comes in
      // const id = req.body.value[0].resourceData.id;
      console.log(`🔔 Received notifications: ${resource}`);
      const subject = await getSubject(resource);
      //executed = true;
      await getEmail(resource, subject);
      return;
    } catch (err) {
      console.log(`Email received, but cannot get data!: ${err}`);
    }
  }
};
