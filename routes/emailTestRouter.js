import { smtpSend } from '../utils/emailTest.js';
import express from 'express';
import { createEmail } from './../controllers/emailController.js';

const router = express.Router();

router.post('/', createEmail);

export default router;
