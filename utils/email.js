import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail } from '../controllers/emailController.js';

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
          const attachedData = attRes.data.item.attachments;

          /*
            const eData = new Map([
            ['sender', emailData.sender.emailAddress.address],
            ['subject', emailData.subject],
            ['body', emailData.body.content],
            ['attachments', emailData.attachments > 0 ? true : false],
            ['dateReceived', emailData.receivedDateTime],
            ['dateSent', new Date().toLocaleString()],
          ]);

          createEmail(eData);

          smtpSend(emailData, token);
        */

          const attachmentObject = {};

          for (let i = 0; i < attachedData.length; i++) {
            const { name, contentType, contentBytes } = attachedData[i];
            attachmentObject[`attachment${i + 1}`] = {
              name,
              contentType,
              contentBytes,
            };
          }

          console.log('Attachments:');
          //console.log(eData.attachments);

          //createEmail(eData);
          smtpSend(eData);
        } catch (err) {
          console.error(`Failed to get attachment properties: ${err}`);
        }
      } else {
        if (test2 !== subject) {
          console.log(`NOT MATCHING: ${test2} | ${subject}`);
        }
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    throw err;
  }
  return token;
};

export const smtpSend = async (eData) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const attachedData = eData.attachments;

  const attachmentObject = {};

  for (let i = 0; i < attachedData.length; i++) {
    const { name, contentType, contentBytes } = attachedData[i];
    attachmentObject[`attachment${i + 1}`] = {
      name,
      contentType,
      contentBytes,
    };
  }
  try {
    const email = await transporter.sendMail({
      from: eData.sender.emailAddress.address,
      to: 'anthony@fcskc.com',
      subject: eData.subject,
      html: eData.body.content,
      attachments: attachmentObject,
    });
    console.log('Message sent: %s', email.messageId, `Email Data: ${eData}`);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
  } catch (err) {
    console.log('Error while sending email', err);
  }
};
