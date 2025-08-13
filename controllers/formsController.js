import nodemailer from 'nodemailer';
import axios from 'axios';
import { getAccessToken } from './authController.js';

export const getNotifications = (req, res) => {
  const validationToken = req.query.validationToken;
  if (validationToken) {
    res.status(200).type('text/plain').send(validationToken);
  } else {
    res.status(400).send('Missing Validation Token');
  }
};

export const sendForm = async (req, res) => {
  const validationToken = req.query.validationToken;
  res.status(202).type('text/plain').send(validationToken);
  const resource = req.body.value[0].resource;
  console.log('📜 New Form Received!');
  try {
    const token = await getAccessToken();
    const url = `https://graph.microsoft.com/v1.0/${resource}`;
    const email = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = email.data.body.content;

    const preBody = data.split('</head>')[1];
    // console.log(`🔔💥PB: ${preBody}`);
    const preBody2 = preBody.split('class="ipw"');
    // console.log(`💥🔔PB2: ${preBody2}`);

    // const postBody = data.split('<!-- END:IPW -->')[1];
    // console.log(`💩💩POST: ${postBody}`);
    // const postBody2 = postBody.split('</html>')[0];
    // console.log(`💥🔔Post2: ${postBody2}`);
    // const body = preBody2 + postBody2;
    console.log(`Data: ${preBody2}`);
    //console.log(`Body: ${body}`);
  } catch (err) {
    console.log(`Err: ${err}`);
  }
};
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT || 2525,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// const body = req.body.split('mailto:')[1];
// console.log(`Body: ${body}`);
// const email = body.split('"')[0];
// console.log(email);

// try {
//   const formEmail = await transporter.sendMail({
//     from: `${req.body}
//   })
// }

export const formLifeCycle = async (req, res) => {
  if (req.query.validationToken) {
    const validationToken = req.query.validationToken;
    res.status(202).type('text/plain').send(validationToken);
  } else {
    const id = req.body.value[0].subscriptionId;
    console.log(`ID: ${id}`);
    const token = await getAccessToken();
    console.log(`Token: ${token}`);
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const renewDate = date.toISOString();
    try {
      const subRenew = await axios.patch(
        `https://graph.microsoft.com/v1.0/subscriptions/${id}`,
        { expirationDateTime: renewDate },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      res.status(202).type('text/plain').send('Renewing subscription');
    } catch (err) {
      console.log(`Failed to renew Subscription: ${err}`, res.textContent);
      res.status(`${res.statusCode}`).send(err);
    }
  }
};
