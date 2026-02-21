import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String },
    displayName: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
