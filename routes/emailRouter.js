import express from 'express';
import { Email } from './../models/emailModel.js';
import { createEmail, getEmails } from './../controllers/emailController.js';

const router = express.Router();

//router.get('/', getEmails);
router.post('/', createEmail);

export default router;
