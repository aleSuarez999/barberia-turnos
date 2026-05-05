import express from 'express';
import { validateJWT } from '../middlewares/validateJWT.js';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../controllers/activityController.js';

const router = express.Router();
router.use(validateJWT);

router.get('/', getActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
