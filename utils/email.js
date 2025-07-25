import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail } from '../controllers/emailController.js';
import fs from 'fs';

export const getEmail = async (resource) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = notification.data.value;

    for (const value of data) {
      const contentType = value.contentType;
      const id = value.id;
      if (contentType === 'message/rfc822') {
        console.log(`Guilty Email: ${id},${contentType}`);
        try {
          const attRes = await axios.get(
            `https://graph.microsoft.com/v1.0/${resource}/attachments/${id}/?$expand=microsoft.graph.itemattachment/item`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const emailData = attRes.data.item;

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
        } catch (err) {
          console.err(`Failed to get attachment properties: ${err}`);
        }
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    throw err;
  }
  return token;
};

export const smtpSend = async (emailData, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const email = await transporter.sendMail({
      from: emailData.sender.emailAddress.address,
      to: process.env.SMTP_TO_ADDRESS,
      subject: emailData.subject,
      //text: emailData.body.content,
      html: emailData.body.content,
      attachments: [
        {
          filename: emailData.attachments[2].name,
          content: Buffer.from(emailData.attachments[2].contentBytes, 'base64'),
          contentType: emailData.attachments[2].contentType,
        },
      ],
    });
    console.log(
      'Message sent: %s',
      email.messageId,
      `Email Data: ${emailData}`,
    );
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
  } catch (err) {
    console.log('Error while sending email', err);
  }
};
