import express from 'express';
//import { emailSend } from './../controllers/emailSendController.js';

const router = express.Router();

router.post('/', emailSend);

export default router;
