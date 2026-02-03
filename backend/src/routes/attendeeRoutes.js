import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';
import { requireManagerOrOrganizer, requireCollaborator } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import * as attendeeController from '../controllers/attendeeController.js';

const router = Router();
const v = (req, res, next) => validate(req, res, next);

router.post(
  '/:eventId/register',
  param('eventId').isMongoId(),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().trim(),
  v,
  optionalAuth,
  attendeeController.registerAttendee
);

router.use(protect);

router.get('/:eventId', param('eventId').isMongoId(), v, requireCollaborator(), attendeeController.getAttendees);
router.post('/:eventId/check-in', param('eventId').isMongoId(), body('qrPayload').notEmpty(), v, requireManagerOrOrganizer(), attendeeController.checkInByQr);
router.get('/:eventId/:attendeeId/qr', param('eventId').isMongoId(), param('attendeeId').isMongoId(), v, requireCollaborator(), attendeeController.getAttendeeQr);

export default router;
