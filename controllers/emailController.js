import { Email } from './../models/emailModel.js';
import { APIFeatures } from './../utils/apiFeatures.js';
import axios from 'axios';
import { getAccessToken } from './authController.js';

export const getSubject = async (resource) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}`;
    const r = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = r.data;
    const subject = r.data.subject;
    console.log(`Data: ${data}`);
    console.log(`Subject: ${subject}`);
    return subject;
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

// Saves email to database
export const createEmail = async (req, res, eData) => {
  try {
    const newEmail = await Email.create(eData);

    res.status(201).json({
      status: 'success',
      data: {
        data: newEmail,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

// Retrieves email from database
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
