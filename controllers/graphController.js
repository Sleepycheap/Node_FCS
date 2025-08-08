import express from 'express';
import axios from 'axios';
import { getAccessToken } from './../controllers/authController.js';

export const getToken = async (req, res) => {
  try {
    const tokenGet = await getAccessToken();
    const token = res.json({ access_token: tokenGet });
  } catch (err) {
    console.log(err);
    res.status(500).send(`error: ${err} 'Unable to retrieve access token' `);
  }
};

export const getUsers = async (req, res) => {
  try {
    const token = await getAccessToken();
    const users = await axios.get('https://graph.microsoft.com/v1.0/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(users.data);
  } catch (err) {
    console.error('Error calling graph!', err);
  }
};
