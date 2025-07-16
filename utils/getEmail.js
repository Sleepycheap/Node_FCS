const apiClient = require('./apiController');
const { getAccessToken } = require('./authController');
const catchAsync = require('./../utils/catchAsync');
const axios = require('axios');

// const tokenEndpoint =
//   'https://login.microsoftonline.com/e5f81c16-7ed3-48ef-98dc-02b2d0ea9a35/oauth2/v2.0/token';
// const params = new URLSearchParams();
// params.append('grant_type', process.env.GRANT_TYPE);
// params.append('client_id', process.env.CLIENT_ID);
// params.append('client_secret', process.env.CLIENT_SECRET);
// params.append('scope', process.env.SCOPE);
// const config = {
//   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
// };

const getEmail = async (resource) => {
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

          const headers = attRes.data.item.internetMessageHeaders;
          console.log(headers);
        } catch (err) {
          console.err(`Failed to get attachment properties: ${err}`);
        }
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    throw err;
  }
};

module.exports = getEmail;
