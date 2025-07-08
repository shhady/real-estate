import mongoose from 'mongoose';

const CallSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transcription: { type: String, required: true },
  summary: { type: String, required: true },
  followUps: [String],
  positives: [String],
  issues: [String],
  audioFileName: String,
  audioDuration: String,
}, {
  timestamps: true
});

export default mongoose.models.Call || mongoose.model('Call', CallSchema); 