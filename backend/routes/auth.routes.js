import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { login, registerClient, createAdmin, getAdmins, deleteAdmin, updateAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register-client', registerClient);

router.post('/create-admin', validateJWT, createAdmin);
router.get('/admins', validateJWT, getAdmins);
router.put('/admins/:id', validateJWT, updateAdmin);
router.delete('/admins/:id', validateJWT, deleteAdmin);

export default router;
