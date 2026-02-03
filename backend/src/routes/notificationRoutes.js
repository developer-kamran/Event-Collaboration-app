import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();
const v = (req, res, next) => validate(req, res, next);

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', param('id').isMongoId(), v, notificationController.markNotificationRead);
router.patch('/read-all', notificationController.markAllNotificationsRead);

export default router;
