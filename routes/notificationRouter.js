import {
  getNotifications,
  postNotifications,
} from './../controllers/notificationController.js';
import express from 'express';
const router = express.Router();

router.get('/', getNotifications);

router.post('/', postNotifications);

export default router;
