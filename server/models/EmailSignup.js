import mongoose from 'mongoose';

const emailSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    consent: { type: Boolean, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { timestamps: true }
);

emailSignupSchema.index({ email: 1, event: 1 }, { unique: true });

export default mongoose.model('EmailSignup', emailSignupSchema);
