import { renewSubscription } from './../controllers/subscriptionController.js';
import { getAccessToken } from './authController.js';
import axios from 'axios';

export const lifecycle = async (req, res) => {
  if (req.query.validationToken) {
    const validationToken = req.query.validationToken;
    res.status(202).type('text/plain').send(validationToken);
  } else {
    const id = req.body.value[0].subscriptionId;
    console.log(`ID: ${id}`);
    const token = await getAccessToken();
    console.log(`Token: ${token}`);
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const renewDate = date.toISOString();
    try {
      const subRenew = await axios.patch(
        `https://graph.microsoft.com/v1.0/subscriptions/${id}`,
        { expirationDateTime: renewDate },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      res.status(202).type('text/plain').send('Renewing subscription');
    } catch (err) {
      console.log(`Failed to renew Subscription: ${err}`, res.textContent);
      res.status(`${res.statusCode}`).send(err);
    }
  }
};

// export const lifecycle = (req, res) => {
//   const validationToken = req.query.validationToken;
//   res.status(202).type('text/plain').send(validationToken);
//   //res.status('202').send('received subscription');
//   console.log(`REQ: ${JSON.stringify(req.body)}`);
// };
