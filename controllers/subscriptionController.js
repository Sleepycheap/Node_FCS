//const apiClient = require('./apiController');
import axios from 'axios';
import { getAccessToken } from './authController.js';

export const createSubscription = async (req, res) => {
  const token = await getAccessToken();
  try {
    const sub = await axios.post(
      'https://graph.microsoft.com/v1.0/subscriptions',
      {
        changeType: req.body.changeType,
        notificationUrl: req.body.notificationUrl,
        resource: req.body.resource,
        expirationDateTime: req.body.expirationDateTime,
        clientState: req.body.clientState,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    console.error(`Failed to create subscription! ${err}`);
    throw err;
  }
};

export const renewSubscription = async (req, res) => {
  const token = await getAccessToken();
  const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const renewDate = date.toISOString();
  try {
    const renew = await axios.patch(
      `https://graph.microsoft.com/v1.0/subscriptions/${res.value[0].subscriptionId}`,
      {
        expirationDateTime: renewDate,
      },
      {
        header: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (err) {
    console.error(`Failed to renew subscription! ${err}`);
    throw err;
  }
};
