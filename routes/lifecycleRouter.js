import { Router } from 'express';
export const lifecycleRouter = Router();

import { renewSubscription } from './../controllers/subscriptionController.js';

lifecycleRouter.post('/', async (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(202).type('text/plain').send(validationToken);
    console.log('Subscription is about to expire');
    await renewSubscription();
  } else {
    res.status(400).send('Missing Validation Token');
  }
});
