import { smtpSend } from '../utils/emailTest.js';
import express from 'express';
import {
  createEmail,
  getEmails,
  printHTML,
  renewSubscription,
} from '../controllers/testsController.js';
//import { printHTML } from '../controllers/testsController.js';

const router = express.Router();

router.post('/email', createEmail);
router.get('/email', getEmails);
router.get('/html', printHTML);
router.post('/renew', renewSubscription);

export default router;
