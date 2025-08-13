import express from 'express';
import { formLifeCycle } from '../controllers/formsController.js';
const router = express.Router();
router.post('/', formLifeCycle);

export default router;
