const apiClient = require('./apiController');
const axios = require('axios');
const { getAccessToken } = require('./authController');

const createSubscription = async (req, res) => {
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
      },
    );
  } catch (err) {
    console.error(`Failed to create subscription! ${err}`);
    throw err;
  }
};

nodule.exports = { createSubscription };
