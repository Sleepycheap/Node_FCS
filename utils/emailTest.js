import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

let executed = false;

export const smtpSend = async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 2525,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  if (!executed) {
    executed = true;
    try {
      const email = await transporter.sendMail({
        from: 'fcsadmin@unlimitedlo',
        to: '<address that will receive email>',
        subject:
          'This is a test using SMTP2GO Verified domain through Nodemailer',
        text: 'This is a test body',
      });
      console.log('Message sent: %s', email.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
    } catch (err) {
      console.log('Error while sending email', err);
    }
  }
};
