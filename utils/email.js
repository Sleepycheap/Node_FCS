import { getAccessToken } from './../controllers/authController.js';
import axios from 'axios';

export const getEmail = async (resource) => {
  const token = await getAccessToken();
  try {
    const url = `https://graph.microsoft.com/v1.0/${resource}/attachments`;
    const notification = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = notification.data.value;

    for (const value of data) {
      const contentType = value.contentType;
      const id = value.id;
      if (contentType === 'message/rfc822') {
        console.log(`Guilty Email: ${id},${contentType}`);
        try {
          const attRes = await axios.get(
            `https://graph.microsoft.com/v1.0/${resource}/attachments/${id}/?$expand=microsoft.graph.itemattachment/item`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          // const emailData = attRes.data.item.internetMessageHeaders;
          const emailData = attRes.data.item;
          // console.log(emailData);
          console.log(`Body: ${emailData.body.content}`);
          console.log(`Sender: ${emailData.sender.emailAddress.address}`);
          //return emailData;
          sendEmail(emailData, token);
        } catch (err) {
          console.err(`Failed to get attachment properties: ${err}`);
        }
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    throw err;
  }
  return token;
};

export const sendEmail = async (emailData, token) => {
  try {
    const url = 'https://graph.microsoft.com/v1.0/redirect@fcskc.com/sendMail';
    const email = await axios.post(
      url,
      {
        message: {
          subject: emailData.sender.emailAddress.address,
          body: {
            contentType: emailData.body.contentType,
            content: emailData.body.content,
          },
          toRecipient: [
            {
              emailAddress: {
                address: 'helpdesk@fcskc.com',
              },
            },
          ],
          ccRecipients: [
            {
              emailAddress: {
                address: 'anthony@fcskc.com',
              },
            },
          ],
        },
        saveToSentItems: 'true',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (err) {
    console.log(`Unable to send email!: ${err} `);
    throw err;
  }
};
