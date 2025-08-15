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
export const getEmail = async (resource, sender, sub) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    //console.log(`URL: ${url}`);
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const subject = await getSubject(resource);
    let lower = '';
    if (subject.includes('Fw:')) {
      lower = true;
    } else {
      lower = false;
    }

    console.log(`Lower: ${lower}`);

    const data = notification.data.value;

    for (const value of data) {
      const contentType = value.contentType;
      const id = value.id;
      // let n_subject = value.name.split(': ', -1);
      let n_subject = value.name;

      let re = '';

      if (n_subject.includes('Re:')) {
        re = true;
      } else {
        re = false;
      }

      const attSubject = (re = true ? 'RE:' + ' ' + subject : subject);

      const sbjt = (lower = true
        ? 'Fw:' + ' ' + n_subject
        : 'FW:' + ' ' + n_subject);

      if (sbjt === attSubject) {
        // Checks to find attached email. Attachment name should match subject of sent email
        console.log(`INCOMING EMAIL: ${subject}`);
        try {
          const attRes = await axios.get(
            `https://graph.microsoft.com/v1.0/${resource}/attachments/${id}/?$expand=microsoft.graph.itemattachment/item`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const eData = attRes.data.item;

          //////////////////////
          // STRIPS INKY BANNER FROM EMAIL BODY, LEAVES ALL HTML

          // Everying before Inky banner
          const preBody = eData.body.content.split('</head>')[1];
          const preBody2 = preBody.split('<!-- BEGIN:IPW -->')[0];

          // Everything After Inky banner
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

          // SAVES EMAIL TO DATABASE
          await createEmail(processedEmail, sender, sub);
        } catch (err) {
          console.error(
            `GETEMAIL: 90 Failed to get attachment properties: ${err}`,
          );
          await sendDenial(sender, sub, err);
        }
      } else {
        console.log(`NOT MATCH: ${sbjt} || ${attSubject}`);
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    await sendDenial(sender, sub, err);
    throw err;
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
      to: process.env.SMTP_TO_ADDRESS,
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
    await sendConfirm(sender, sub);
  } catch (err) {
    console.log('Error while sending email', err);
    await sendDenial(sender, sub, err);
  }
  return;
};

export const captureResource = async (req, res) => {
  const resource = req.body.value[0].resource;
  console.log(`RES: ${resource}`);
  const token = await getAccessToken();
  const call = await axios.get(`https://graph.microsoft.com/v1/${resource}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Call: ${call}`);
  console.log(`Data: ${call.data}`);
};
