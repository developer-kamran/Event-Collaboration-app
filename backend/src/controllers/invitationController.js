import Invitation from '../models/Invitation.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { generateInvitationToken, getInvitationExpiry } from '../utils/invitationToken.js';
import { sendEventInvitation } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';

export const inviteCollaborator = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const eventId = req.params.eventId;
    const event = req.event;

    const existing = await Invitation.findOne({ event: eventId, email, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Invitation already sent to this email' });
    }

    const invitedUserById = await User.findOne({ email }).select('_id').lean();
    const isAlreadyCollab = invitedUserById && event.collaborators?.some(
      (c) => c.user?.toString() === invitedUserById._id.toString()
    );
    if (isAlreadyCollab) {
      return res.status(400).json({ success: false, message: 'User is already a collaborator' });
    }

    const token = generateInvitationToken();
    const expiresAt = getInvitationExpiry(7);
    const invite = await Invitation.create({
      event: eventId,
      email,
      role: role || 'volunteer',
      invitedBy: req.user._id,
      token,
      expiresAt,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/invitations/${token}`;
    await sendEventInvitation(email, event.title, inviteLink, req.user.name);

    if (invitedUserById) {
      await createNotification(invitedUserById._id, {
        type: 'event_invitation',
        title: 'Event invitation',
        message: `You're invited to collaborate on "${event.title}"`,
        link: `/invitations/${token}`,
        metadata: { eventId, invitationId: invite._id },
      });
    }

    const populated = await Invitation.findById(invite._id)
      .populate('invitedBy', 'name email')
      .lean();
    res.status(201).json({ success: true, invitation: populated });
  } catch (err) {
    next(err);
  }
};

export const getInvitationsByEvent = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({ event: req.params.eventId })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, invitations });
  } catch (err) {
    next(err);
  }
};

export const getInvitationByToken = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('event', 'title date')
      .populate('invitedBy', 'name email')
      .lean();
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation already used' });
    }
    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Invitation expired' });
    }
    res.json({ success: true, invitation });
  } catch (err) {
    next(err);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: 'pending',
    }).populate('event');
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found or already used' });
    }
    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Invitation expired' });
    }
    const invitedEmail = (invitation.email || '').toLowerCase().trim();
    const currentEmail = (req.user.email || '').toLowerCase().trim();
    if (invitedEmail !== currentEmail) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email. Log out and sign in with the invited email to accept.',
        invitedEmail: invitation.email,
        currentEmail: req.user.email,
      });
    }

    const event = await Event.findById(invitation.event._id);
    const alreadyCollab = event.collaborators?.some(
      (c) => c.user?.toString() === req.user._id.toString()
    );
    if (alreadyCollab) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted', acceptedBy: req.user._id });
      return res.json({ success: true, event: await Event.findById(event._id).populate('collaborators.user', 'name email').lean() });
    }

    event.collaborators.push({ user: req.user._id, role: invitation.role });
    await event.save();
    await Invitation.findByIdAndUpdate(invitation._id, {
      status: 'accepted',
      acceptedBy: req.user._id,
    });

    await createNotification(event.createdBy, {
      type: 'invitation_accepted',
      title: 'Invitation accepted',
      message: `${req.user.name} accepted your invitation to "${event.title}"`,
      link: `/events/${event._id}`,
      metadata: { eventId: event._id },
    });

    const updated = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('collaborators.user', 'name email')
      .lean();
    res.json({ success: true, event: updated });
  } catch (err) {
    next(err);
  }
};

export const rejectInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token, status: 'pending' });
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found or already used' });
    }
    const invitedEmail = (invitation.email || '').toLowerCase().trim();
    const currentEmail = (req.user.email || '').toLowerCase().trim();
    if (invitedEmail !== currentEmail) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email. Log out and sign in with the invited email.',
        invitedEmail: invitation.email,
        currentEmail: req.user.email,
      });
    }
    await Invitation.findByIdAndUpdate(invitation._id, { status: 'rejected' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
