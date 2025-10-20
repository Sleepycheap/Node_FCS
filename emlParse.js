import { getAccessToken } from './controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail, getSubject } from './controllers/emailController.js';
import {
  sendConfirm,
  sendDenial,
} from './controllers/confirmationController.js';
import fs from 'fs';
import EmlParser from 'eml-parser';
import path from 'path';
import { smtpSend } from './utils/email.js';

export const parseEml = async () => {
  const token = await getAccessToken();
  try {
    const url = await axios.get(
      'https://graph.microsoft.com/v1.0/users/redirect@fcskc.com/mailFolders/AQMkADgwNzM0ZDllLTVhYmIALTQ1NmQtYjBiOC0xYjkwMjlkNjQzZTkALgAAA_EOr3VJIrhAjD0K7AVcVzQBAGYay0L1WcZBjJQK7WQjAnYAAAIBDAAAAA==/messages/AAMkADgwNzM0ZDllLTVhYmItNDU2ZC1iMGI4LTFiOTAyOWQ2NDNlOQBGAAAAAADhDq91SSK4QIw9CuwFXFc0BwBmGstC9VnGQYyUCu1kIwJ2AAAAAAEMAABmGstC9VnGQYyUCu1kIwJ2AABM3JaPAAA=/attachments/AAMkADgwNzM0ZDllLTVhYmItNDU2ZC1iMGI4LTFiOTAyOWQ2NDNlOQBGAAAAAADhDq91SSK4QIw9CuwFXFc0BwBmGstC9VnGQYyUCu1kIwJ2AAAAAAEMAABmGstC9VnGQYyUCu1kIwJ2AABM3JaPAAABEgAQAGJ6k4vmrMtHpPlexQJvhS8=/$value',
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const content = url.data;

    const filePath = 'email.eml';

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('Error saving eml file', err);
      } else {
        console.log(`Eml saved successfully`);
      }
    });

    try {
      const emlFilePath = path.resolve('email.eml');
      const stream = fs.createReadStream(emlFilePath);
      const parser = new EmlParser(stream);
      const result = await parser.parseEml();
      // console.log('result', result);

      const attachments = await parser.getEmailAttachments();

      const processedAttachments = attachments.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      }));

      let ccAddress = [];
      let cc = false;
      const getCC = () => {};
      if (result.cc) {
        let cc = result.cc.value;
        const len = Object.keys(cc).length;
        let c = 0;
        for (const a of cc) {
          let address = cc[c].address;
          ccAddress.push(address);
          c++;
        }
        console.log('cc', cc);
      } else {
        let cc = false;
        console.log(`cc`, cc);
      }
      getCC();

      const processedEmail = {
        sender: result.from.value[0].address,
        subject: result.subject,
        body: result.html,
        attachments: processedAttachments,
        dateReceived: result.date.toLocaleString(),
        cc: (cc = false ? '' : ccAddress),
      };

      const sub = processedEmail.subject;
      const sender = processedEmail.sender;

      smtpTest(processedEmail, sender, sub);
    } catch (err) {
      console.error('Unable to parse EML file', err);
    }
  } catch (err) {
    console.error('unable to get mime content', err);
  }
};

export const smtpTest = async (processedEmail, sender, sub) => {
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

  try {
    // Creates email and sends to helpdesk
    const email = await transporter.sendMail({
      from: processedEmail.sender,
      to: 'anthony@fcskc.com',
      cc: processedEmail.cc,
      subject: processedEmail.subject,
      html: processedEmail.body,
      attachments: processedEmail.attachments,
    });
    console.log(
      'Message sent: %s',
      email.messageId,
      `Email Data: ${processedEmail}`,
    );
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
    await sendConfirm(sender, sub);
  } catch (err) {
    console.log('Error while sending email', err);
    await sendDenial(sender, sub, err);
  }
  return;
};
