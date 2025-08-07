import mongoose from 'mongoose';
import User from './User';
import Client from './Client';
const CallSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, // Link to client
  audioFileUrl: { type: String, required: true },
  transcription: { type: String, required: true }, // formatted with speaker tags
  summary: { type: String, required: true },
  followUps: [String],
  positives: [String],
  negatives: [String], // NEW: What wasn't good in the call
  improvementPoints: [String], // NEW: Points to improve the call
  issues: [String],
  
  // Structured property data
  intent: { type: String, enum: ['buyer', 'seller', 'both', 'unknown'], default: 'unknown' },
  location: { type: String },
  rooms: { type: Number },
  bathrooms: { type: Number }, // NEW: Number of bathrooms
  area: { type: Number },
  price: { type: Number },
  condition: { type: String },
  floor: { type: Number },
  parking: { type: Boolean },
  balcony: { type: Boolean },
  propertyNotes: { type: String },
  preApproval: { type: Boolean }, // NEW: If client has אישור עקרוני/אישור משכנתה
  ambiguousFields: [String], // NEW: Fields that were ambiguous during extraction
  agentTips: [String], // NEW: Training advice based on call weaknesses
  
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for efficient querying
CallSchema.index({ userId: 1, date: -1 });
CallSchema.index({ userId: 1, clientId: 1 });

export default mongoose.models.Call || mongoose.model('Call', CallSchema); 