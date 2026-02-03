import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import invitationRoutes from './invitationRoutes.js';
import taskRoutes from './taskRoutes.js';
import attendeeRoutes from './attendeeRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/invitations', invitationRoutes);
router.use('/tasks', taskRoutes);
router.use('/attendees', attendeeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);

router.get('/health', (req, res) => res.json({ ok: true }));

export default router;
