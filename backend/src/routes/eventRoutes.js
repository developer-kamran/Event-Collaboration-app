import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireEventRole, requireManagerOrOrganizer, requireOrganizer, requireCollaborator } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import * as eventController from '../controllers/eventController.js';
import * as calendarController from '../controllers/calendarController.js';
import { EVENT_STATUS_LIST, LOCATION_TYPE_LIST } from '../models/Event.js';

const router = Router();
const v = (req, res, next) => validate(req, res, next);

const eventValid = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('date').isISO8601().withMessage('Valid date required'),
  body('endDate').optional().isISO8601(),
  body('locationType').optional().isIn(LOCATION_TYPE_LIST),
  body('location').optional().trim(),
  body('onlineLink').optional().trim(),
  body('maxAttendees').optional().isInt({ min: 0 }),
  body('status').optional().isIn(EVENT_STATUS_LIST),
];

router.get('/public', eventController.getPublicEvents);
router.get('/public/:id', param('id').isMongoId(), v, eventController.getPublicEventById);

router.use(protect);

router.get('/', eventController.getEvents);
router.get('/calendar', calendarController.getCalendarData);

router.post('/', eventValid, v, eventController.createEvent);
router.get('/:id', param('id').isMongoId(), v, eventController.getEventById);
router.put('/:id', param('id').isMongoId(), requireOrganizer(), eventValid, v, eventController.updateEvent);
router.delete('/:id', param('id').isMongoId(), requireOrganizer(), v, eventController.deleteEvent);

export default router;
