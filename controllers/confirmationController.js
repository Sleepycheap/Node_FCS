import axios from 'axios';
import nodemailer from 'nodemailer';

export const sendConfirm = async (sender, sub) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let recipient = '';

  if (sub.includes('[SUPPORT]')) {
    recipient = process.env.SUPPORT_ADDRESS;
  } else {
    recipient = sender;
  }

  try {
    // Creates email and sends to helpdesk
    const email = await transporter.sendMail({
      from: process.env.LOG_ADDRESS,
      to: recipient,
      subject: `${sub} has been forwarded to Helpdesk`,
      text: `${sender} has forwarded ${sub} to helpdesk`,
    });
  } catch (err) {
    console.log('Failed to send email to forwarder', err);
  }
};

export const sendDenial = async (sender, sub, err) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let recipient = sender;

  // if (sub.includes('[SUPPORT]')) {
  //   recipient = process.env.SUPPORT_ADDRESS;
  // } else {
  //   recipient = sender;
  // }

  try {
    // Creates email and sends to helpdesk
    const email = await transporter.sendMail({
      from: process.env.LOG_ADDRESS,
      to: recipient, //process.env.SMTP_TO_ADDRESS
      subject: `${sub} was not forwarded`,
      text: `Error: ${err} || ${sender} tried to forward ${sub} but it failed. Please check logs`,
    });
  } catch (err) {
    console.log('Failed to send email to forwarder', err);
  }
};
