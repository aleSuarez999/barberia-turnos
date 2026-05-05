import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';

const router = express.Router();
router.use(validateJWT);

router.get('/', getSchedules);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
