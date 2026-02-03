import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireManagerOrOrganizer, requireCollaborator } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import * as invitationController from '../controllers/invitationController.js';

const router = Router();
const v = (req, res, next) => validate(req, res, next);

router.get('/token/:token', invitationController.getInvitationByToken);

router.use(protect);

router.post(
  '/:eventId/invite',
  param('eventId').isMongoId(),
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['manager', 'volunteer']),
  v,
  requireManagerOrOrganizer(),
  invitationController.inviteCollaborator
);

router.get(
  '/:eventId',
  param('eventId').isMongoId(),
  v,
  requireCollaborator(),
  invitationController.getInvitationsByEvent
);

router.post('/token/:token/accept', invitationController.acceptInvitation);
router.post('/token/:token/reject', invitationController.rejectInvitation);

export default router;
