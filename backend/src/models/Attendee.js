import mongoose from 'mongoose';
import crypto from 'crypto';

const attendeeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: '' },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    qrPayload: { type: String, unique: true, sparse: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

attendeeSchema.index({ event: 1, email: 1 }, { unique: true });
attendeeSchema.index({ qrPayload: 1 });

attendeeSchema.statics.generateQrPayload = function (eventId, attendeeId) {
  const secret = process.env.QR_SECRET || 'default-qr-secret';
  const payload = `${eventId}:${attendeeId}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return Buffer.from(
    JSON.stringify({
      e: eventId.toString(),
      a: attendeeId.toString(),
      s: signature,
    }),
  ).toString('base64url');
};

attendeeSchema.statics.verifyQrPayload = function (qrPayload) {
  try {
    const secret = process.env.QR_SECRET || 'default-qr-secret';
    const decoded = JSON.parse(Buffer.from(qrPayload, 'base64url').toString());
    const payload = `${decoded.e}:${decoded.a}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    if (expected !== decoded.s) return null;
    return { eventId: decoded.e, attendeeId: decoded.a };
  } catch {
    return null;
  }
};

export default mongoose.model('Attendee', attendeeSchema);
