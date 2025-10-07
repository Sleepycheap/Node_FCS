import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail, getSubject } from '../controllers/emailController.js';
import jsdom from 'jsdom';
import {
  sendConfirm,
  sendDenial,
} from '../controllers/confirmationController.js';
const { JSDOM } = jsdom;

// Gets the email forwarded to Redirect
export const getEmail = async (resource, sender, sub, parser) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const subject = await getSubject(resource);
    console.log(`TEST: Subject: ${subject}`);
    const data = notification.data.value[0];
    const id = data.id;
    console.log(`TEST id: ${id}`);
    const attName1 = data.name.replace(/^fw:\s|re:\s/gim, '');
    const attName = attName1.startsWith('[EXT')
      ? attName1.split('[EXT]')[1]
      : attName1;
    const emlName = attName.endsWith('.eml') ? attName.split('.')[0] : attName;

    console.log(`Outgoing subject: ${emlName}`);

    if (emlName === subject && subject !== 'undefined') {
      console.log('Match!');
      try {
        console.log(`Attempting to get attachment info`);
        const attRes = await axios.get(
          `https://graph.microsoft.com/v1.0/${resource}/attachments/${id}/?$expand=microsoft.graph.itemattachment/item`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const eData = attRes;
        const data = eData.data.item;
        console.log(`data: ${data}`);

        //// STRIPS INKY BANNER FROM EMAIL BODY, LEAVES ALL HTML
        // Everying before Inky banner
        console.log(`Body: ${data.body.content}`);
        const preBody = data.body.content.split('</head>')[1];
        const preBody2 = preBody.split('<!-- BEGIN:IPW -->')[0];

        // Everything After Inky banner
        const postBody = data.body.content.split('<!-- END:IPW -->')[1];
        const postBody2 = postBody.split('</html>')[0];
        const body = preBody2 + postBody2;
        console.log(`body: ${body}`);

        const processedEmail = {
          sender: data.sender.emailAddress.address,
          subject: data.subject,
          parser: parser,
          body: body,
          attachments: data.attachments,
          dateReceived: data.receivedDataTime,
          dateSent: data.sentDateTime,
        };

        // SAVES EMAIL TO DATABASE
        await smtpSend(processedEmail, sender, sub, parser);
      } catch (err) {
        console.error(`Failed to get attachment properties: ${err}`);
        await sendDenial(sender, sub, err);
      }
    } else if (subject === 'undefined') {
      console.log(`Check incoming email! Subject: ${subject}`);
      await sendDenial(sender, sub);
    } else {
      console.log(`NOT MATCH: ${emlName} || ${subject}`);
      await sendDenial(sender, sub);
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    await sendDenial(sender, sub, err);
  }
  return token;
};

export const smtpSend = async (processedEmail, sender, sub, parser) => {
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
      to: process.env.TEST_EMAIL,
      subject: processedEmail.subject,
      text: parser,
      html: processedEmail.body,
      attachments: processedAttachments,
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
