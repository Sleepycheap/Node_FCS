const apiClient = require('./apiController');
const { getAccessToken } = require('./authController');
const catchAsync = require('./../utils/catchAsync');

const getEmail = catchAsync(async (url, next) => {
  const message = await apiClient.get(`/${url}`);
  res.json(message.data);
  next();
});

module.exports = getEmail;
