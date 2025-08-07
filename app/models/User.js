import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Property from './Property';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  slug:{
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  agencyName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  activityArea: {
    type: String,
    required: true,
  },
  calendlyLink:{
    type: String,
  },
  role: {
    type: String,
    enum: ['agent', 'admin'],
    default: 'agent',
  },
  profileImage: {
    secure_url: String,
    publicId: String,
  },
  logo: {
    secure_url: String,
    publicId: String,
    overlayPublicId: String, // For use in Cloudinary overlays (e.g., "l_publicid_here")
  },
  socialMedia: {
    instagram: String,
    facebook: String
  },
    interactions: {
      whatsapp: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      phone: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 }
    },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  isApproved: {
    type: Boolean,
    default: false,
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 