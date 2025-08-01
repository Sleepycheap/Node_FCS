import { Email } from '../models/emailModel.js';
import { APIFeatures } from './../utils/apiFeatures.js';

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
