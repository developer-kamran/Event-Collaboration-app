import Task from '../models/Task.js';
import { createNotification } from '../services/notificationService.js';

export const createTask = async (req, res, next) => {
  try {
    const body = { ...req.body, event: req.params.eventId };
    const task = await Task.create(body);
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('event', 'title')
      .lean();
    if (task.assignedTo) {
      await createNotification(task.assignedTo, {
        type: 'task_assigned',
        title: 'Task assigned',
        message: `You were assigned to "${task.title}"`,
        link: `/events/${req.params.eventId}/tasks`,
        metadata: { taskId: task._id, eventId: req.params.eventId },
      });
    }
    res.status(201).json({ success: true, task: populated });
  } catch (err) {
    next(err);
  }
};

export const getTasksByEvent = async (req, res, next) => {
  try {
    const tasks = await Task.find({ event: req.params.eventId })
      .populate('assignedTo', 'name email')
      .sort({ order: 1, dueDate: 1 })
      .lean();
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, event: req.params.eventId })
      .populate('assignedTo', 'name email')
      .populate('event', 'title date')
      .lean();
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, event: req.params.eventId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('event', 'title')
      .lean();
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      event: req.params.eventId,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
