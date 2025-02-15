import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Property from './Property';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
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
  socialMedia: {
    instagram: String,
    facebook: String
  },
  analytics: {
    profileViews: {
      total: { type: Number, default: 0 },
      unique: { type: Number, default: 0 }
    },
    interactions: {
      whatsapp: {
        total: { type: Number, default: 0 },
        unique: { type: Number, default: 0 }
      },
      email: {
        total: { type: Number, default: 0 },
        unique: { type: Number, default: 0 }
      },
      phone: {
        total: { type: Number, default: 0 },
        unique: { type: Number, default: 0 }
      }
    }
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  isApproved: {
    type: Boolean,
    default: false,
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