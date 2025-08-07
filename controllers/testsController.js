import { Email } from '../models/emailModel.js';

export const createEmail = async (req, res) => {
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
      message: err,
    });
  }
};
