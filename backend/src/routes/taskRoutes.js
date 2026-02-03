import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireManagerOrOrganizer, requireCollaborator } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import * as taskController from '../controllers/taskController.js';
import { TASK_STATUS_LIST } from '../models/Task.js';

const router = Router();
const v = (req, res, next) => validate(req, res, next);

const taskValid = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('assignedTo').optional().isMongoId(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(TASK_STATUS_LIST),
  body('order').optional().isInt({ min: 0 }),
];

// Update allows partial body (e.g. only status) – no required fields
const taskUpdateValid = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('assignedTo').optional().isMongoId(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(TASK_STATUS_LIST),
  body('order').optional().isInt({ min: 0 }),
];

router.use(protect);

router.get('/:eventId', param('eventId').isMongoId(), v, requireCollaborator(), taskController.getTasksByEvent);
router.post('/:eventId', param('eventId').isMongoId(), taskValid, v, requireManagerOrOrganizer(), taskController.createTask);
router.get('/:eventId/:taskId', param('eventId').isMongoId(), param('taskId').isMongoId(), v, requireCollaborator(), taskController.getTaskById);
router.put('/:eventId/:taskId', param('eventId').isMongoId(), param('taskId').isMongoId(), taskUpdateValid, v, requireCollaborator(), taskController.updateTask);
router.delete('/:eventId/:taskId', param('eventId').isMongoId(), param('taskId').isMongoId(), v, requireManagerOrOrganizer(), taskController.deleteTask);

export default router;
