const axios = require('axios');
const { getAccessToken } = require('./authController');
const catchAsync = require('./../utils/catchAsync');
const apiClient = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0/',
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

module.exports = apiClient;

// apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`
