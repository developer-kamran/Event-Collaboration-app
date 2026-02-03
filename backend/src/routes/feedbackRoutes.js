import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireCollaborator } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import * as feedbackController from '../controllers/feedbackController.js';

const router = Router();
const v = (req, res, next) => validate(req, res, next);

router.post(
  '/:eventId/:attendeeId',
  param('eventId').isMongoId(),
  param('attendeeId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().trim(),
  v,
  feedbackController.submitFeedback
);

router.use(protect);
router.get('/:eventId', param('eventId').isMongoId(), v, requireCollaborator(), feedbackController.getFeedbackByEvent);
router.get('/:eventId/attendee/:attendeeId', param('eventId').isMongoId(), param('attendeeId').isMongoId(), v, requireCollaborator(), feedbackController.getFeedbackByAttendee);

export default router;
