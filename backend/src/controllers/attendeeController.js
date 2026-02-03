import Attendee from '../models/Attendee.js';
import Event from '../models/Event.js';
import { sendRegistrationConfirmation } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';

export const registerAttendee = async (req, res, next) => {
  try {
    const { name, email, phone, metadata } = req.body;
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Event is not open for registration' });
    }

    if (event.maxAttendees > 0) {
      const count = await Attendee.countDocuments({ event: eventId });
      if (count >= event.maxAttendees) {
        return res.status(400).json({ success: false, message: 'Registration limit reached' });
      }
    }

    const existing = await Attendee.findOne({ event: eventId, email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered with this email' });
    }

    const attendee = await Attendee.create({
      event: eventId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      metadata: metadata || {},
    });

    const qrPayload = Attendee.generateQrPayload(eventId, attendee._id);
    await Attendee.findByIdAndUpdate(attendee._id, { qrPayload });

    await sendRegistrationConfirmation(email, event.title, event.date);
    await createNotification(event.createdBy, {
      type: 'event_registration',
      title: 'New registration',
      message: `${name} registered for "${event.title}"`,
      link: `/events/${eventId}/attendees`,
      metadata: { eventId, attendeeId: attendee._id },
    });

    const populated = await Attendee.findById(attendee._id).lean();
    populated.qrPayload = qrPayload;
    res.status(201).json({ success: true, attendee: populated });
  } catch (err) {
    next(err);
  }
};

export const getAttendees = async (req, res, next) => {
  try {
    const attendees = await Attendee.find({ event: req.params.eventId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, attendees });
  } catch (err) {
    next(err);
  }
};

export const checkInByQr = async (req, res, next) => {
  try {
    const { qrPayload } = req.body;
    const eventId = req.params.eventId;

    const decoded = Attendee.verifyQrPayload(qrPayload);
    if (!decoded) {
      return res.status(400).json({ success: false, message: 'Invalid QR code' });
    }
    if (decoded.eventId !== eventId) {
      return res.status(400).json({ success: false, message: 'QR code is for a different event' });
    }

    const attendee = await Attendee.findOne({
      _id: decoded.attendeeId,
      event: eventId,
    });
    if (!attendee) {
      return res.status(404).json({ success: false, message: 'Attendee not found' });
    }
    if (attendee.checkedIn) {
      return res.status(400).json({ success: false, message: 'Already checked in', attendee: await Attendee.findById(attendee._id).lean() });
    }

    attendee.checkedIn = true;
    attendee.checkedInAt = new Date();
    await attendee.save();

    res.json({ success: true, attendee: await Attendee.findById(attendee._id).lean() });
  } catch (err) {
    next(err);
  }
};

export const getAttendeeQr = async (req, res, next) => {
  try {
    const attendee = await Attendee.findOne({
      _id: req.params.attendeeId,
      event: req.params.eventId,
    }).lean();
    if (!attendee) {
      return res.status(404).json({ success: false, message: 'Attendee not found' });
    }
    let payload = attendee.qrPayload;
    if (!payload) {
      payload = Attendee.generateQrPayload(req.params.eventId, attendee._id);
      await Attendee.findByIdAndUpdate(attendee._id, { qrPayload: payload });
    }
    res.json({ success: true, qrPayload: payload });
  } catch (err) {
    next(err);
  }
};
