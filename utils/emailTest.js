import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export const smtpSend = async () => {
  const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const email = await transporter.sendMail({
      from: '"Ferguson Admin" <fcsadmin@unlimitedlogistics.com>',
      to: 'helpdesk@fcskc.com',
      subject:
        'This is a test using SMTP2GO Verified domain through Nodemailer',
      text: 'This is a test body',
    });
    console.log('Message sent: %s', email.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
  } catch (err) {
    console.log('Error while sending email', err);
  }
};
