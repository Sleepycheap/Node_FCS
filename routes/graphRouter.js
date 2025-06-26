const express = require('express');
const authController = require('./../controllers/authController');
const graphController = require('./notificationRouter');
const { getAccessToken } = require('./../controllers/authController');
const axios = require('axios');
const apiClient = require('./../controllers/apiController');
const catchAsync = require('./../utils/catchAsync');

const router = express.Router();

router.get('/token', async (req, res) => {
  try {
    const tokenGet = await getAccessToken();
    const token = res.json({ access_token: tokenGet });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to retrieve access token' });
  }
});

router.get('/users', async (req, res, tokenGet) => {
  try {
    // const token = await getAccessToken();
    // console.log(token);
    const users = await apiClient.get('/users');

    res.json(users.data);
  } catch (err) {
    console.error('Error calling graph!', err);
  }
});

module.exports = router;
