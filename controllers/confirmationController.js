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

  try {
    // Creates email and sends to helpdesk
    const email = await transporter.sendMail({
      from: 'nodelogs@fcskc.com',
      to: sender, //process.env.SMTP_TO_ADDRESS
      subject: `${sub} has been forwarded to Helpdesk`,
      text: `${sub} has been forwarded to helpdesk successfully`,
    });
  } catch (err) {
    console.log('Failed to send email to forwarder', err);
  }
};

export const sendDenial = async (req, res) => {};
