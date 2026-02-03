import Feedback from '../models/Feedback.js';
import Attendee from '../models/Attendee.js';
import Event from '../models/Event.js';
import { createNotification } from '../services/notificationService.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { eventId, attendeeId } = req.params;

    const attendee = await Attendee.findOne({ _id: attendeeId, event: eventId });
    if (!attendee) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after event is completed' });
    }

    const existing = await Feedback.findOne({ event: eventId, attendee: attendeeId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback' });
    }

    const feedback = await Feedback.create({
      event: eventId,
      attendee: attendeeId,
      rating,
      comment: comment || '',
    });

    await createNotification(event.createdBy, {
      type: 'feedback_received',
      title: 'New feedback',
      message: `New ${rating}-star feedback for "${event.title}"`,
      link: `/events/${eventId}/feedback`,
      metadata: { eventId, feedbackId: feedback._id },
    });

    const populated = await Feedback.findById(feedback._id)
      .populate('attendee', 'name email')
      .lean();
    res.status(201).json({ success: true, feedback: populated });
  } catch (err) {
    next(err);
  }
};

export const getFeedbackByEvent = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('attendee', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const stats = await Feedback.aggregate([
      { $match: { event: req.params.eventId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      feedbacks,
      stats: stats[0] ? { avgRating: stats[0].avgRating, count: stats[0].count } : { avgRating: 0, count: 0 },
    });
  } catch (err) {
    next(err);
  }
};

export const getFeedbackByAttendee = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({
      event: req.params.eventId,
      attendee: req.params.attendeeId,
    })
      .populate('attendee', 'name email')
      .lean();
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    res.json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};
