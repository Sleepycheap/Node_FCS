import { smtpSend } from '../utils/emailTest.js';
import express from 'express';
import { createEmail, getEmails } from '../controllers/testsController.js';
import { printHTML } from '../controllers/testsController.js';

const router = express.Router();

router.post('/email', createEmail);
router.get('/email', getEmails);
router.get('/html', printHTML);

export default router;
