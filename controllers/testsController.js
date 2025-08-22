import { Email } from '../models/emailModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import jsdom from 'jsdom';
import { getAccessToken } from './authController.js';
import axios from 'axios';
import path from 'path';
const { JSDOM } = jsdom;

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

export const printHTML = (res, res) => {
  res.sendFile(path.resolve('public/test.html'));
};

export const renewSubscription = async (req, res) => {
  //res.status(202).type('text/plain').send('Renewing subscription');
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
    res.status(202).type('text/plain').send('Renewing subscription');
  } catch (err) {
    console.log(`Failed to renew Subscription: ${err}`, res.textContent);
    res.status(`${res.statusCode}`).send(err);
  }
};
