const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const url =
  'https://login.microsoftonline.com/e5f81c16-7ed3-48ef-98dc-02b2d0ea9a35/oauth2/v2.0/token';

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', process.env.GRANT_TYPE);
  params.append('client_id', process.env.CLIENT_ID);
  params.append('client_secret', process.env.CLIENT_SECRET);
  params.append('scope', process.env.SCOPE);

  try {
    const res = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return res.data.access_token;
  } catch (err) {
    console.error(`Cant get access token! ${err}`);
    throw err;
  }
}

module.exports = { getAccessToken };
