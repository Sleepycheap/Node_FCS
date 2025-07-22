import { Router } from 'express';
// const authController = require('./../controllers/authController');
// const graphController = require('./notificationRouter');
import { getAccessToken } from './../controllers/authController.js';
// const axios = require('axios');
import { apiClient } from './../controllers/apiController.js';
// const catchAsync = require('./../utils/catchAsync');

export const graphRouter = Router();

graphRouter.get('/token', async (req, res) => {
  try {
    const tokenGet = await getAccessToken();
    const token = res.json({ access_token: tokenGet });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Unable to retrieve access token' });
  }
});

graphRouter.get('/users', async (req, res, tokenGet) => {
  try {
    // const token = await getAccessToken();
    // console.log(token);
    const users = await apiClient.get('/users');

    res.json(users.data);
  } catch (err) {
    console.error('Error calling graph!', err);
  }
});
