import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createEmail, getSubject } from '../controllers/emailController.js';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

// Gets the email forwarded to Redirect
export const getEmail = async (resource) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    //console.log(`URL: ${url}`);
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const subject = await getSubject(resource);

    //
    const data = notification.data.value;

    // FILTERS FOR FORWARDED EMAIL

    for (const value of data) {
      const contentType = value.contentType;
      const id = value.id;
      let n_subject = value.name.split(': ', -1);
      const sbjt = (n_subject[0] = 'RE,'
        ? 'FW:' + ' ' + n_subject[1]
        : 'FW:' + ' ' + n_subject);
      console.log(`TEST: ${sbjt}`);
      // const test = n_subject[1];
      // console.log(`TEST: ${test}`);
      //const sub = n_subject.split(',');
      //console.log(`SUB: ${sub}`);
      // if (n_subject.includes('RE,')) {
      //   const split = n_subject.split(',');
      //   const sub = split[1];
      //   let sbjt = `FW:` + ' ' + sub;
      //   console.log(`RE: ${sbjt}`);
      // } else {
      //   let sbjt = `FW:` + ' ' + n_subject;
      //   console.log(`NO RE: ${sbjt}`);
      // }

      if (sbjt === subject) {
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
          await createEmail(processedEmail);
        } catch (err) {
          console.error(`Failed to get attachment properties: ${err}`);
        }
      } else {
        console.log(`NOT MATCH: ${sbjt} || ${subject}`);
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    throw err;
  }
  return token;
};

export const smtpSend = async (processedEmail) => {
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
      to: 'anthony@fcskc.com', //process.env.SMTP_TO_ADDRESS
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
  } catch (err) {
    console.log('Error while sending email', err);
  }
  return;
};
