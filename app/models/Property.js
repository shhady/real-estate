import mongoose from 'mongoose';
import User from './User';
const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['House', 'Apartment', 'Condo', 'Villa', 'Land'],
  },
  status: {
    type: String,
    required: true,
    enum: ['For Sale', 'For Rent'],
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
  images: [{
    secure_url: String,
    publicId: String,
  }],
  features: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approved: {
    type: Boolean,
    default: true,
  },
  inquiries: {
    whatsapp: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
    calls: { type: Number, default: 0 },
  }
}, {
  timestamps: true,
});

// Add text index for search functionality
propertySchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 'text' 
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property; 