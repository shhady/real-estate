import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  
  // Property preferences and history
  intent: { type: String, enum: ['buyer', 'seller', 'both', 'unknown'], default: 'unknown' },
  preferredLocation: { type: String },
  preferredPropertyType: { type: String },
  minRooms: { type: Number },
  maxRooms: { type: Number },
  minArea: { type: Number },
  maxArea: { type: Number },
  minPrice: { type: Number },
  maxPrice: { type: Number },
  preferredCondition: { type: String },
  needsParking: { type: Boolean },
  needsBalcony: { type: Boolean },
  preApproval: { type: Boolean }, // NEW: אישור עקרוני/אישור משכנתא
  
  // Client information
  notes: { type: String }, // General notes about the client
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'closed', 'prospect'], 
    default: 'prospect' 
  },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium' 
  },
  
  // Communication preferences
  preferredContact: { 
    type: String, 
    enum: ['phone', 'whatsapp', 'email'], 
    default: 'phone' 
  },
  
  // Optional call data (when created from call analysis)
  transcription: { type: String }, // Optional - only if created from call
  lastCallSummary: { type: String },
  lastCallDate: { type: Date },
  
  // Reference to related calls
  calls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Call' }],
  
  // Tags for organization
  tags: [String],
  
  // Lead source
  source: { 
    type: String, 
    enum: ['call', 'website', 'referral', 'advertising', 'social_media', 'other'], 
    default: 'other' 
  }
}, { timestamps: true });

// Index for efficient querying
ClientSchema.index({ userId: 1, clientName: 1 });
ClientSchema.index({ userId: 1, phoneNumber: 1 });
ClientSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Client || mongoose.model('Client', ClientSchema); 