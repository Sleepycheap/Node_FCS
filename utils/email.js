import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail } from '../controllers/emailController.js';
import jsdom from 'jsdom';
import { createPublicKey } from 'crypto';
const { JSDOM } = jsdom;

// import { unique } from '../models/emailModel.js';

// Gets the email forwarded to Redirect
export const getEmail = async (resource, subject) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // CREATES JSON OBJECT OF ATTACHMENTS
    const data = notification.data.value;

    // FILTERS FOR FORWARDED EMAIL
    for (const value of data) {
      const contentType = value.contentType;
      const id = value.id;
      const n_subject = value.name.split(': ', -1);

      const test2 = `FW:` + ' ' + n_subject;
      console.log(`${test2} || ${subject}`);

      if (test2 === subject) {
        console.log(`Guilty Email: ${id},${contentType}`);
        try {
          const attRes = await axios.get(
            `https://graph.microsoft.com/v1.0/${resource}/attachments/${id}/?$expand=microsoft.graph.itemattachment/item`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const eData = attRes.data.item;
          //console.log(`eData: ${eData.body.content}`);
          const preBody = eData.body.content.split('</head>')[1];
          const preBody2 = preBody.split('<!-- BEGIN:IPW -->')[0];
          const postBody = eData.body.content.split('<!-- END:IPW -->')[1];
          const postBody2 = postBody.split('</html>')[0];
          const body = preBody2 + postBody2;

          const processedEmail = {
            sender: eData.sender.emailAddress.address,
            subject: eData.subject,
            body: body,
            attachments: eData.attachments,
            dateReceived: eData.receivedDataTime,
            dateSent: eData.sentDateTime,
          };

          //console.log(`Processed Email: ${processedEmail.sender}`);

          // SAVES EMAIL TO DATABASE
          createEmail(processedEmail);

          // SENDS EMAIL TO HELPDESK
          //smtpSend(processedEmail);
        } catch (err) {
          console.error(`Failed to get attachment properties: ${err}`);
        }
      } else {
        console.log(`NOT MATCH: ${test2} || ${subject}`);
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    throw err;
  }
  return token;
};

export const smtpSend = async (processedEmail, unique) => {
  //'console.log(`Unique: ${unique}`);
  //if (unique === true) {
  console.log('SENDING EMAIL');
  // NODEMAILER USES STMP2GO TO SEND EMAIL
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // CREATES ATTACHMENTS ARRAY
  const attachedData = processedEmail.attachments;
  const processedAttachments = attachedData.map((att) => ({
    filename: att.name,
    content: Buffer.from(att.contentBytes, 'base64'),
    contentType: att.contentType,
  }));

  try {
    // Creates email and sends to helpdesk
    const email = await transporter.sendMail({
      from: processedEmail.sender,
      to: 'anthony@fcskc.com', //process.env.SMTP_TO_ADDRESS
      subject: processedEmail.subject,
      html: processedEmail.body,
      attachments: processedAttachments,
    });
    console.log(
      'Message sent: %s',
      email.messageId,
      `Email Data: ${processedEmail}`,
    );
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
  } catch (err) {
    console.log('Error while sending email', err);
  }
  return;
};
// else {
//   console.log('Duplicate email, aborting...');
//   return;
// };
//};
