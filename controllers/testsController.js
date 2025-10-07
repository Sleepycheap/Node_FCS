import { Email } from '../models/emailModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import jsdom from 'jsdom';
import { getAccessToken } from './authController.js';
import axios from 'axios';
import path from 'path';
import { getEmail } from '../utils/email.js';
import { getSubject } from './emailController.js';
import { sendDenial } from './confirmationController.js';
import logger from '../logger.js';
import { renewSubscription } from './../controllers/subscriptionController.js';

export const createEmail = async (req, res, next) => {
  try {
    const newEmail = await Email.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newEmail,
      },
    });
  } catch (err) {
    logger.error(err);
    res.status(400).json({
      status: 'fail',
      message: `Error: ${err}`,
    });
  }
};

export const getEmails = async (req, res) => {
  let filter = {};

  const features = new APIFeatures(Email.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // const doc = await features.query.explain();
  const doc = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  });
};

export const printHTML = (req, res) => {
  res.sendFile(path.resolve('public/test.html'));
};

// export const renewSubscription = async (req, res) => {
//   //res.status(202).type('text/plain').send('Renewing subscription');
//   const id = req.body.value[0].subscriptionId;
//   const token = await getAccessToken();
//   const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
//   const renewDate = date.toISOString();
//   try {
//     const subRenew = await axios.patch(
//       `https://graph.microsoft.com/v1.0/subscriptions/${id}`,
//       { expirationDateTime: renewDate },
//       { header: { Authorization: `Bearer ${token}` } },
//     );
//     res.status(202).type('text/plain').send('Renewing subscription');
//   } catch (err) {
//     logger.error(err);
//     res.status(`${res.statusCode}`).send(err);
//   }
// };

export const getNotifications = async (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(200).type('text/plain').send(validationToken);
  } else {
    logger.error('GET /notification failed');
    res.status(400).send('Missing Validation Token');
  }
};

export const postNotifications = async (req, res) => {
  if (req.query.validationToken) {
    // RESPONDS TO GRAPH API TO CREATE CHANGE NOTIFICATION
    const validationToken = req.query.validationToken;
    console.log(validationToken);
    res.status(200).type('text/plain').send(validationToken);
  } else {
    try {
      // This is triggered when new email comes in
      res.status(202).send('Sending 202');
      const resource = req.body.value[0].resource;
      console.log(`TEST: 🔔 Received notifications: ${resource}`);
      const token = await getAccessToken();
      const call = await axios.get(
        `https://graph.microsoft.com/v1.0/${resource}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const sender = call.data.sender.emailAddress.address;
      const sub = call.data.subject;
      //const parser = call.data.bodyPreview;
      //console.log(`Parser: ${parser}`);
      await getEmail(resource, sender, sub, parser);
      // return { parser, sender, sub };
    } catch (err) {
      logger.error(err);
      await sendDenial(sender, sub, err);
      res.status(503).send();
    }
  }
};

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
