import { smtpSend } from '../utils/emailTest.js';
import express from 'express';

const router = express.Router();

router.get('/', smtpSend);

export default router;
