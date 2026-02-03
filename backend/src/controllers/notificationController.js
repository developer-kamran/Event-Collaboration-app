import {
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { limit, unreadOnly } = req.query;
    const notifications = await getNotificationsForUser(req.user._id, {
      limit: limit ? Number(limit) : 20,
      unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.user._id, req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await markAllAsRead(req.user._id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
