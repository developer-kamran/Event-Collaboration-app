import Event from '../models/Event.js';

/** Role hierarchy: organizer > manager > volunteer > attendee */
const ROLE_LEVEL = { organizer: 4, manager: 3, volunteer: 2, attendee: 1 };

/**
 * Require user to have at least one of the given roles (global or per-event)
 * Usage: requireRoles('organizer', 'manager')
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  };
};

/**
 * Require user to be organizer/manager/volunteer for the event in req.params.eventId
 * Optionally require minimum role level.
 */
export const requireEventRole = (minRole = 'volunteer') => {
  const minLevel = ROLE_LEVEL[minRole] || 0;
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const eventId = req.params.eventId || req.params.id || req.body?.event;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isCreator = event.createdBy.toString() === req.user._id.toString();
    if (isCreator) {
      req.event = event;
      req.eventRole = 'organizer';
      return next();
    }

    const collab = event.collaborators?.find(
      (c) => c.user?.toString() === req.user._id.toString()
    );
    if (!collab) {
      return res.status(403).json({ success: false, message: 'Not a collaborator for this event' });
    }

    if (ROLE_LEVEL[collab.role] < minLevel) {
      return res.status(403).json({ success: false, message: 'Insufficient role for this event' });
    }

    req.event = event;
    req.eventRole = collab.role;
    next();
  };
};

/**
 * Require user to be organizer or manager for the event (assign tasks, manage attendees)
 */
export const requireManagerOrOrganizer = () => requireEventRole('manager');

/**
 * Require user to be organizer (full access: delete event, manage collaborators)
 */
export const requireOrganizer = () => requireEventRole('organizer');

/**
 * Require user to be at least volunteer (view event, update own tasks)
 */
export const requireCollaborator = () => requireEventRole('volunteer');
