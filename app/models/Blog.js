import mongoose from 'mongoose';
import User from './User';
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
  },
  coverImage: {
    secure_url: String,
    publicId: String,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add text index for search functionality
blogSchema.index({ 
  title: 'text', 
  content: 'text',
  tags: 'text'
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog; 