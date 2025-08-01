import { renewSubscription } from './../controllers/subscriptionController.js';

export const lifecycle = async (req, res) => {
  const validationToken = req.query.validationToken;
  if (req.query && validationToken) {
    res.status(202).type('text/plain').send(validationToken);
  } else if (req.body) {
    res.status(202).type('text/plain').send(validationToken);
    const subId = res.body.value[0].resourceData.id;
    await renewSubscription(subId);
  } else {
    res.status(400).send('Missing Validation Token');
  }
};
