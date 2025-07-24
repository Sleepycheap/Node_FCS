import express from 'express';
import { getToken, getUsers } from './../controllers/graphController.js';

const router = express.Router();

router.get('/token', getToken);

router.get('/users', getUsers);

export default router;
