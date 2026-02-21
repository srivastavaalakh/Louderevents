import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dateTime: { type: Date, required: true },
    venueName: { type: String, default: '' },
    venueAddress: { type: String, default: '' },
    city: { type: String, default: 'Sydney' },
    description: { type: String, default: '' },
    category: [{ type: String }],
    imageUrl: { type: String, default: '' },
    sourceWebsite: { type: String, required: true },
   sourceUrl: {
  type: String,
  required: true,
},
    sourceId: { type: String }, // unique per source for dedup/update
    lastScrapedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['new', 'updated', 'inactive', 'imported'],
      default: 'new',
    },
    importedAt: { type: Date },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    importNotes: { type: String },
  },
  { timestamps: true }
);

eventSchema.index({ city: 1, dateTime: 1 });
eventSchema.index({ sourceWebsite: 1, sourceId: 1 }, { unique: true, sparse: true });
eventSchema.index({ status: 1 });

export default mongoose.model('Event', eventSchema);
