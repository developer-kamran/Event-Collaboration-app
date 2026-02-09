import mongoose from 'mongoose';

const EVENT_STATUS = ['draft', 'published', 'completed'];
const LOCATION_TYPE = ['online', 'offline'];

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date, default: null },
    locationType: { type: String, enum: LOCATION_TYPE, default: 'offline' },
    location: { type: String, default: '' },
    onlineLink: { type: String, default: '' },
    maxAttendees: { type: Number, default: 0 },
    status: { type: String, enum: EVENT_STATUS, default: 'draft' },
    coverImage: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['organizer', 'manager', 'volunteer'],
          default: 'volunteer',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

eventSchema.index({ createdBy: 1, status: 1 });
eventSchema.index({ date: 1, status: 1 });

export const EVENT_STATUS_LIST = EVENT_STATUS;
export const LOCATION_TYPE_LIST = LOCATION_TYPE;
export default mongoose.model('Event', eventSchema);
