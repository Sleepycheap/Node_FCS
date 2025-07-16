const express = require('express');
const router = express.Router();
const apiClient = require('./../controllers/apiController');
const getEmail = require('./../utils/getEmail');
const { resource } = require('../app');

router.get('/', (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(200).type('text/plain').send(validationToken);
  } else {
    res.status(400).send('Missing Validation Token');
  }
});

router.post('/', async (req, res) => {
  if (req.query.validationToken) {
    const validationToken = req.query.validationToken;
    res.status(200).type('text/plain').send(validationToken);
    console.log('Subscription Created');
  } else {
    const resource = req.body.value[0].resource;
    console.log(`🔔 Received notifications: ${resource}`);
    await getEmail(resource);
  }
});

module.exports = router;
