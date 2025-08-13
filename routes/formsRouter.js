import express from 'express';
import { sendForm, getNotifications } from '../controllers/formsController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', sendForm);

export default router;
