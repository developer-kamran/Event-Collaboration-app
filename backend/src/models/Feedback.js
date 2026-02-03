import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ event: 1 });
feedbackSchema.index({ event: 1, attendee: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);
