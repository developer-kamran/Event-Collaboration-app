import mongoose from 'mongoose';

const TASK_STATUS = ['pending', 'in_progress', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: TASK_STATUS, default: 'pending' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

taskSchema.index({ event: 1, status: 1 });

export const TASK_STATUS_LIST = TASK_STATUS;
export default mongoose.model('Task', taskSchema);
