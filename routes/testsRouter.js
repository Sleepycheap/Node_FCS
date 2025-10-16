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
router.get('/eml', getEml);
router.get('/', getNotifications);

router.post('/', postNotifications);

export default router;
