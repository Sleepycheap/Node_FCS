import { getEmail } from '../utils/email.js';
import { getSubject } from './emailController.js';

export const emailSend = async (req, res) => {
  try {
    const resource = req.body.value[0].resource;
    console.log(`🔔 Received notifications: ${resource}`);
    await getEmail(resource);
    res.status(202).send();
  } catch (err) {
    console.log(`Email received, but cannot get data! ${err}`);
    res.status(503).send();
  }
};
