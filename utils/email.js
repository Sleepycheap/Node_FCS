import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail, getSubject } from '../controllers/emailController.js';
import jsdom from 'jsdom';
import {
  sendConfirm,
  sendDenial,
} from '../controllers/confirmationController.js';
import { simpleParser } from 'mailparser';
const { JSDOM } = jsdom;
import fs from 'fs';
import path from 'path';
import EmlParser from 'eml-parser';

// Gets the email forwarded to Redirect
export const getEmail = async (resource, sender, sub) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const subject = await getSubject(resource);
    const data = notification.data.value[0];
    const id = data.id;
    const attName1 = data.name.replace(/^fw:\s|re:\s/gim, '');
    const attName = attName1.startsWith('[EXT')
      ? attName1.split('[EXT]')[1]
      : attName1;
    const emlName = attName.endsWith('.eml') ? attName.split('.')[0] : attName;

    console.log(`Outgoing subject: ${emlName}`);

    if (emlName === subject && subject !== 'undefined') {
      console.log('Match!');
      try {
        const attRes = await axios.get(
          `https://graph.microsoft.com/v1.0/${resource}/attachments/${id}/$value`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const content = attRes.data;
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

          // Gets attachments of ReDirected email
          const attachments = await parser.getEmailAttachments();
          const processedAttachments = attachments.map((att) => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            contentType: att.contentType,
          }));

          // Get CCs and creates array if present
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
            cc: ccAddress,
          };

          const sub = processedEmail.subject;
          const sender = processedEmail.sender;

          // SAVES EMAIL TO DATABASE
          await createEmail(processedEmail, sender, sub);
        } catch (err) {
          console.error(`Failed to get attachment properties: ${err}`);
          await sendDenial(sender, sub, err);
        }
      } catch (err) {
        console.error('failed to get attachment details', err);
      }
    } else if (subject === 'undefined') {
      console.log(`Check incoming email! Subject: ${subject}`);
      await sendDenial(sender, sub);
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    await sendDenial(sender, sub, err);
  }
  return token;
};

export const smtpSend = async (processedEmail, sender, sub) => {
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
      to: process.env.SMTP_TO_ADDRESS,
      cc: processedEmail.cc,
      subject: processedEmail.subject,
      html: processedEmail.body,
      attachments: processedEmail.attachments,
    });
    console.log(
      'Message sent: %s',
      email.messageId,
      `Email Data: ${processedEmail.subject}`,
    );
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(email));
    await sendConfirm(sender, sub);
  } catch (err) {
    console.log('Error while sending email', err);
    await sendDenial(sender, sub, err);
  }
  return;
};
