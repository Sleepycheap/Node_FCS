const express = require('express');
const router = express.Router();
const {
  renewSubscription,
} = require('./../controllers/subscriptionController');

router.post('/', async (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(202).type('text/plain').send(validationToken);
    console.log('Subscription is about to expire');
    await renewSubscription();
  } else {
    res.status(400).send('Missing Validation Token');
  }
});
