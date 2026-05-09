import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { status, connect, qr, disconnectWA } from '../controllers/whatsappController.js';

const router = express.Router();
router.use(validateJWT);

router.get('/status', status);
router.get('/qr', qr);
router.post('/connect', connect);
router.post('/disconnect', disconnectWA);

export default router;
