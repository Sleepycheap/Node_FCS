import express from 'express';
import { lifecycle } from '../controllers/lifeCyclecontroller.js';
const router = express.Router();

router.post('/', lifecycle);

export default router;
