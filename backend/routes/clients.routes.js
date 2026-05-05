import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/clientController.js';

const router = express.Router();
router.use(validateJWT);

router.get('/', getClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
