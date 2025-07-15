const express = require('express');
const router = express.Router();
const apiClient = require('./../controllers/apiController');
const getEmail = require('./../controllers/notificationController');
const { resource } = require('../app');

router.get('/', (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    // console.log('Validation token received:', validationToken);
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
    //res.sendStatus(202);
  } else {
    //const body = req.body.value[0].id;
    const resource = req.body.value[0].resource;
    console.log(`🔔 Received notifications: ${resource}`);
    // console.log(`Resource: ${resource}`);
    //console.log(`Notifications: ${notifications}}`, `Resource: ${resource}`);
    await getEmail(resource);

    // notifications.forEach((notification) => {
    //   console.log({
    //     subscriptionId: notification.subscriptionId,
    //     changeType: notification.changeType,
    //     resource: notification.resource,
    //     resourceData: notification.resourceData,
    //   });

    // try {
    //   const message = getEmail(notifications.resource);
    //   console.log('New email received:');
    // } catch (err) {
    //   console.error('!!! Failed to fetch email:', err.message);
    // }
    //res.sendStatus(202);
  }
  //res.sendStatus(202);
  //}
});

module.exports = router;
