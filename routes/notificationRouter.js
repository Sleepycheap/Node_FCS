import { Router } from 'express';
import { getEmail } from './../utils/getEmail.js';
import { getNotification } from '../controllers/notificationController.js';
import { postNotification } from '../controllers/notificationController.js';

export const notificationRouter = Router();

notificationRouter.get('/', getNotification);

notificationRouter.post('/', postNotification);
