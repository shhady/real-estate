import mongoose from 'mongoose';
import User from './User';

// Clear any existing models to prevent schema conflicts
if (mongoose.models.Property) {
  delete mongoose.models.Property;
}

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false, // Made optional since we have separate descriptions
  },
  // Generated descriptions in both languages
  descriptions: {
    hebrew: {
      type: String,
      default: ''
    },
    arabic: {
      type: String,
      default: ''
    }
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
    enum: ['house', 'apartment', 'condo', 'villa', 'land', 'commercial', 'cottage','duplex'],
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
    required: false, // Made optional as requested
  },
  area: {
    type: Number,
    required: true,
  },
  // New fields from upload wizard
  floor: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  agencyName: {
    type: String,
    required: false,
  },
  // Content type to distinguish between single image, carousel, video
  contentType: {
    type: String,
    enum: ['single-image', 'carousel', 'video', 'video-from-images'],
    default: 'single-image'
  },
  // Enhanced media handling
  images: [{
    secure_url: String,
    publicId: String,
  }],
  // Video content
  video: {
    secure_url: { type: String, required: false },
    publicId: { type: String, required: false, default: '' },
    type: { type: String, required: false } // 'uploaded' or 'generated'
  },
  // Media URLs from upload (for backward compatibility and external integrations)
  mediaUrls: [String],
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
  },
  // Additional metadata
  languageChoice: {
    type: String,
    enum: ['hebrew', 'arabic', 'both'],
    default: 'both'
  },
  // External listing ID for integrations
  externalListingId: String,
  listingUrl: String
}, {
  timestamps: true,
});

// Add text index for search functionality
propertySchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 'text',
  'descriptions.hebrew': 'text',
  'descriptions.arabic': 'text'
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property; 