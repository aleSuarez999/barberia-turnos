import express from 'express';
import { sendOtp, verifyAndBook, bookExisting } from '../controllers/otpController.js';

const router = express.Router();

router.post('/send', sendOtp);
router.post('/verify-and-book', verifyAndBook);
router.post('/book', bookExisting);

export default router;
