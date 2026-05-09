import express from 'express';
import { sendOtp, verifyAndBook, bookExisting, sendRegisterOtp, verifyRegisterOtp } from '../controllers/otpController.js';

const router = express.Router();

// Registro de cliente con OTP
router.post('/register/send', sendRegisterOtp);
router.post('/register/verify', verifyRegisterOtp);

// Booking (flujo existente)
router.post('/send', sendOtp);
router.post('/verify-and-book', verifyAndBook);
router.post('/book', bookExisting);

export default router;
