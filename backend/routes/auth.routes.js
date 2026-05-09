import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { login, clientLogin, createAdmin, getAdmins, deleteAdmin, updateAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/client-login', clientLogin);

router.post('/create-admin', validateJWT, createAdmin);
router.get('/admins', validateJWT, getAdmins);
router.put('/admins/:id', validateJWT, updateAdmin);
router.delete('/admins/:id', validateJWT, deleteAdmin);

export default router;
