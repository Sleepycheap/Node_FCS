import { Email } from './../models/emailModel.js';
import { APIFeatures } from './../utils/apiFeatures.js';
import axios from 'axios';
import { getAccessToken } from './authController.js';
import { smtpSend } from '../utils/email.js';
import { sendDenial } from './confirmationController.js';

// Gets subject line to compare against attachment. If subject and attachment match, script proceeds
export const getSubject = async (resource) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}`;
    const r = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = r.data;
    const sub = r.data.subject;
    ///^(FW|Fw|RE|Re):\s/
    const subject1 = sub.replace(/^fw:\s|re:\s/gim, '');
    console.log(`Incoming subject: ${subject1}`);
    const subject = subject1.startsWith('[EXT')
      ? subject1.split('[EXT]')[1]
      : subject1;
    //console.log(`Data: ${data}`);
    console.log(`Subject: ${subject}`);
    return subject;
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

// Saves email to database
export const createEmail = async (processedEmail, sender, sub, parser) => {
  try {
    const newEmail = await Email.create([
      {
        sender: processedEmail.sender,
        subject: processedEmail.subject,
        parser: parser,
        body: processedEmail.body,
        attachments: processedEmail.attachments,
        dateReceived: processedEmail.dateReceived,
        dateSent: processedEmail.dateSent,
      },
    ]);
    // Sends email if not already saved to database
    await smtpSend(processedEmail, sender, sub, parser);
  } catch (err) {
    console.log(`Err: ${err}`);
    let errMsg = '';
    const error = err;
    const msg = error.split(':')[0];
    console.log(`msg: ${msg}`);
    if (msg === 'MongoServerError') {
      errMsg = 'Duplicate! This email has already been sent!';
    } else {
      errMsg = err;
    }
    console.log(`Send error: ${errMsg}`);
    await sendDenial(processedEmail, sub, errMsg);
    return;
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
