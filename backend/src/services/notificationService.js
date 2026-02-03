import Notification from '../models/Notification.js';

export const createNotification = async (userId, { type, title, message, link, metadata = {} }) => {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    metadata,
  });
};

export const getNotificationsForUser = async (userId, { limit = 20, unreadOnly = false } = {}) => {
  const query = { user: userId };
  if (unreadOnly) query.read = false;
  return Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
};

export const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany({ user: userId }, { read: true });
};
