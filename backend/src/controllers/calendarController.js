import Event from '../models/Event.js';
import Task from '../models/Task.js';

/**
 * Returns events + tasks for FullCalendar (user's events and task deadlines)
 */
export const getCalendarData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const start = req.query.start ? new Date(req.query.start) : new Date();
    const end = req.query.end ? new Date(req.query.end) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const events = await Event.find({
      $or: [
        { createdBy: userId },
        { 'collaborators.user': userId },
      ],
      status: { $in: ['draft', 'published', 'completed'] },
      date: { $gte: start, $lte: end },
    })
      .select('title description date endDate locationType location status')
      .lean();

    const eventIds = events.map((e) => e._id);
    const tasks = await Task.find({
      event: { $in: eventIds },
      dueDate: { $gte: start, $lte: end, $ne: null },
    })
      .populate('event', 'title')
      .populate('assignedTo', 'name')
      .lean();

    const calendarEvents = [
      ...events.map((e) => ({
        id: e._id,
        title: e.title,
        start: e.date,
        end: e.endDate || e.date,
        allDay: false,
        type: 'event',
        extendedProps: { status: e.status, locationType: e.locationType },
      })),
      ...tasks.map((t) => ({
        id: `task-${t._id}`,
        title: `[Task] ${t.title}`,
        start: t.dueDate,
        allDay: true,
        type: 'task',
        extendedProps: { taskId: t._id, eventId: t.event._id, status: t.status },
      })),
    ];

    res.json({ success: true, events: calendarEvents });
  } catch (err) {
    next(err);
  }
};
