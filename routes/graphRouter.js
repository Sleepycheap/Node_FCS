import express from 'express';
import { getToken, getUsers } from './../controllers/graphController.js';
//import authController from './../controllers/authController';
//import graphController from './notificationRouter';
//import { getAccessToken } from './../controllers/authController';
//import axios from 'axios';
//import catchAsync from './../utils/catchAsync';

const router = express.Router();

router.get('/token', getToken);

router.get('/users', getUsers);

export default router;
