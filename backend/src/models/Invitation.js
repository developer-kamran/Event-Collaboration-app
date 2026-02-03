import mongoose from 'mongoose';

const INVITATION_STATUS = ['pending', 'accepted', 'rejected'];

const invitationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['manager', 'volunteer'], default: 'volunteer' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: INVITATION_STATUS, default: 'pending' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

invitationSchema.index({ event: 1, email: 1 }, { unique: true });
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, status: 1 });

export const INVITATION_STATUS_LIST = INVITATION_STATUS;
export default mongoose.model('Invitation', invitationSchema);
