import { Email } from './../models/emailModel.js';
import { APIFeatures } from './../utils/apiFeatures.js';

export const createEmail = async (req, res, next, eData) => {
  //const email = await Email.create(eData);
  //const email = await Email.save(req.body);
  const email = new Email();

  email.save(err) => {
    if(err)
      throw err;
    console.log(req.body);
    res.json();
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: email,
    },
  });
};

export const getEmails = async (req, res, next) => {
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
