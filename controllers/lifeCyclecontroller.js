import { renewSubscription } from './../controllers/subscriptionController.js';
import { getAccessToken } from './authController.js';
import axios from 'axios';

export const lifecycle = async (req, res) => {
  if (req.query.validationToken) {
    const validationToken = req.query.validationToken;
    res.status(202).type('text/plain').send(validationToken);
  } else {
    res.status(202).type('text/plain').send('Renewing subscription');
    const id = req.body.value[0].subscriptionId;
    const token = await getAccessToken();
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const renewDate = date.toISOString();
    try {
      const subRenew = await axios.patch(
        `https://graph.microsoft.com/v1.0/subscriptions/${id}`,
        { expirationDateTime: renewDate },
        { header: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.log(`Failed to renew Subscription: ${err}`);
    }
  }
};

// export const lifecycle = (req, res) => {
//   const validationToken = req.query.validationToken;
//   res.status(202).type('text/plain').send(validationToken);
//   //res.status('202').send('received subscription');
//   console.log(`REQ: ${JSON.stringify(req.body)}`);
// };
