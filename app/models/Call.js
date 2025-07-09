import mongoose from 'mongoose';

const CallSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, // Link to client
  audioFileUrl: { type: String, required: true },
  transcription: { type: String, required: true }, // formatted with speaker tags
  summary: { type: String, required: true },
  followUps: [String],
  positives: [String],
  issues: [String],
  
  // Structured property data
  intent: { type: String, enum: ['buyer', 'seller', 'both', 'unknown'], default: 'unknown' },
  location: { type: String },
  rooms: { type: Number },
  area: { type: Number },
  price: { type: Number },
  condition: { type: String },
  floor: { type: Number },
  parking: { type: Boolean },
  balcony: { type: Boolean },
  propertyNotes: { type: String },
  
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for efficient querying
CallSchema.index({ userId: 1, date: -1 });
CallSchema.index({ userId: 1, clientId: 1 });

export default mongoose.models.Call || mongoose.model('Call', CallSchema); 