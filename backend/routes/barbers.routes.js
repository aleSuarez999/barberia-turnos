import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { getBarbers, createBarber, updateBarber, deleteBarber } from '../controllers/barberController.js';

const router = express.Router();
router.use(validateJWT);

router.get('/', getBarbers);
router.post('/', createBarber);
router.put('/:id', updateBarber);
router.delete('/:id', deleteBarber);

export default router;
