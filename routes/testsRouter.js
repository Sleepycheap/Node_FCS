import { smtpSend } from '../utils/emailTest.js';
import express from 'express';
import {
  createEmail,
  getEmails,
  printHTML,
  getNotifications,
  postNotifications,
  lifecycle,
} from '../controllers/testsController.js';
//import { printHTML } from '../controllers/testsController.js';
// import {
//   getNotifications,
//   postNotifications,
// } from './../controllers/notificationController.js';

const router = express.Router();

router.post('/email', createEmail);
router.get('/email', getEmails);
router.get('/html', printHTML);
router.post('/renew', lifecycle);

router.get('/notifications', getNotifications);

router.post('/notifications', postNotifications);

export default router;
