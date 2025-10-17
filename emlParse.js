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
      'https://graph.microsoft.com/v1.0/users/redirect@fcskc.com/mailFolders/AQMkADgwNzM0ZDllLTVhYmIALTQ1NmQtYjBiOC0xYjkwMjlkNjQzZTkALgAAA_EOr3VJIrhAjD0K7AVcVzQBAGYay0L1WcZBjJQK7WQjAnYAAAIBDAAAAA==/messages/AAMkADgwNzM0ZDllLTVhYmItNDU2ZC1iMGI4LTFiOTAyOWQ2NDNlOQBGAAAAAADhDq91SSK4QIw9CuwFXFc0BwBmGstC9VnGQYyUCu1kIwJ2AAAAAAEMAABmGstC9VnGQYyUCu1kIwJ2AABJAyPgAAA=/attachments/AAMkADgwNzM0ZDllLTVhYmItNDU2ZC1iMGI4LTFiOTAyOWQ2NDNlOQBGAAAAAADhDq91SSK4QIw9CuwFXFc0BwBmGstC9VnGQYyUCu1kIwJ2AAAAAAEMAABmGstC9VnGQYyUCu1kIwJ2AABJAyPgAAABEgAQAJfDCQ6nQplPhwNqiLLlIZ4=/$value',
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const content = url.data;
    console.log(`content: ${content.data}`);

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
      const parsedEmail = await parser.parseEml();

      //console.log(`Parsed email sender: ${parsedEmail.from.text}`);
      // console.log(`subject: ${parsedEmail.subject}`);
      // console.log(`html: ${parsedEmail.html}`);
      // console.log(`text: ${parsedEmail.text}`);
      // console.log(`text: ${text}`);

      // const preBody = text.split('</head>')[1];
      // console.log(`prebody: ${preBody}`);
      // const preBody2 = preBody.split('<!-- BEGIN:IPW -->')[0];

      // const postBody = text.split('<!-- END:IPW -->')[1];
      // const postBody2 = postBody.split('</html>')[0];
      // const body = preBody2 + postBody2;

      const html = parsedEmail.html;

      function getSender() {
        const rawSender = parsedEmail.from.text;
        const s1 = rawSender.split('<')[1];
        const s2 = s1.replace('>', '');
        console.log(s2);
        return s2;
      }

      const processedEmail = {
        sender: getSender(),
        subject: parsedEmail.subject,
        body: html,
        attachments: parsedEmail.attachments,
        dateReceived: parsedEmail.date,
      };

      const sub = processedEmail.subject;
      const sender = processedEmail.sender;
      // console.log(`Processed Email Sender: ${processedEmail.sender}`);
      // console.log(`Processed Email Body: ${processedEmail.body}`);
      smtpSend(processedEmail, sender, sub);
    } catch (err) {
      console.error('Unable to parse EML file', err);
    }
  } catch (err) {
    console.error('unable to get mime content', err);
  }
};
