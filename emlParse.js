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
      'https://graph.microsoft.com/v1.0/users/redirect@fcskc.com/mailFolders/AQMkADgwNzM0ZDllLTVhYmIALTQ1NmQtYjBiOC0xYjkwMjlkNjQzZTkALgAAA_EOr3VJIrhAjD0K7AVcVzQBAGYay0L1WcZBjJQK7WQjAnYAAAIBDAAAAA==/messages/AAMkADgwNzM0ZDllLTVhYmItNDU2ZC1iMGI4LTFiOTAyOWQ2NDNlOQBGAAAAAADhDq91SSK4QIw9CuwFXFc0BwBmGstC9VnGQYyUCu1kIwJ2AAAAAAEMAABmGstC9VnGQYyUCu1kIwJ2AABJAyPpAAA=/attachments/AAMkADgwNzM0ZDllLTVhYmItNDU2ZC1iMGI4LTFiOTAyOWQ2NDNlOQBGAAAAAADhDq91SSK4QIw9CuwFXFc0BwBmGstC9VnGQYyUCu1kIwJ2AAAAAAEMAABmGstC9VnGQYyUCu1kIwJ2AABJAyPpAAABEgAQALHDaWce9l5JkThmzWxwj5s=/$value',
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
      const attachments = await parser.getEmailAttachments();
      //const attach = attObject.attachments;
      console.log(`Attachments: ${attachments}`);

      const html = parsedEmail.html;

      function getSender() {
        const rawSender = parsedEmail.from.text;
        const s1 = rawSender.split('<')[1];
        const s2 = s1.replace('>', '');
        console.log(s2);
        return s2;
      }

      const rawCC = parsedEmail.cc.html;
      // console.log(`Raw: ${rawCC}`);
      const test = rawCC.split(',');

      let ccUsers = [];
      for (const i of test) {
        const split = i.split(':')[1];
        const split2 = split.split('"')[0];
        console.log(`Split2: ${split2}`);

        ccUsers.push(split2);
      }

      console.log(`ccUsers: ${ccUsers}`);
      console.log(`User: ${ccUsers[0]}`);

      //const test2 = test.split('"');
      // console.log(`test: ${test}`);
      // console.log(typeof test);
      // console.log(`A: ${a}`);
      // console.log(Object.entries(object));
      // console.log(`finalCC: ${split}`);
      // console.log(ccAddresses);
      // [
      //   [
      //     '0',
      //     ' <span class="mp_address_group"><a href="mailto:dani@summithomeskc.com" class="mp_address_email">dani@summithomeskc.com</a></span>',
      //   ],
      // ];
      // console.log(`CC: ${processedCC}`);

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
      //smtpSend(processedEmail, sender, sub);
    } catch (err) {
      console.error('Unable to parse EML file', err);
    }
  } catch (err) {
    console.error('unable to get mime content', err);
  }
};
