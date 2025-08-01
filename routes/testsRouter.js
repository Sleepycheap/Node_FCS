import { smtpSend } from '../utils/emailTest.js';
import express from 'express';
import { createEmail, getEmails } from '../controllers/testsController.js';

const router = express.Router();

router.post('/email', createEmail);
router.get('/email', getEmails);

export default router;
