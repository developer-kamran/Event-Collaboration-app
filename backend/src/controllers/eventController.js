import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Attendee from '../models/Attendee.js';
import { EVENT_STATUS_LIST } from '../models/Event.js';

export const createEvent = async (req, res, next) => {
  try {
    const body = { ...req.body, createdBy: req.user._id };
    const event = await Event.create(body);
    const populated = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .lean();
    res.status(201).json({ success: true, event: populated });
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { status, my } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (my === 'true' && req.user) {
        filter.$or = [
          { createdBy: req.user._id },
          { 'collaborators.user': req.user._id },
        ];
    }
    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .populate('collaborators.user', 'name email')
      .sort({ date: 1 })
      .lean();
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('collaborators.user', 'name email')
      .lean();
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('collaborators.user', 'name email')
      .lean();
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await Task.deleteMany({ event: event._id });
    await Attendee.deleteMany({ event: event._id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getPublicEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published' })
      .select('title description date endDate locationType location onlineLink maxAttendees coverImage')
      .sort({ date: 1 })
      .lean();
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

/** Public single event (for registration page) - no auth required */
export const getPublicEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('title description date endDate locationType location onlineLink maxAttendees status coverImage')
      .lean();
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'published') return res.status(404).json({ success: false, message: 'Event not available' });
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};
