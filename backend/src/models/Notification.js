import mongoose from 'mongoose';

const NOTIFICATION_TYPES = [
  'event_invitation',
  'event_registration',
  'event_reminder',
  'task_assigned',
  'invitation_accepted',
  'feedback_received',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });

export const NOTIFICATION_TYPES_LIST = NOTIFICATION_TYPES;
export default mongoose.model('Notification', notificationSchema);
