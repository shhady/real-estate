'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaTimes, FaMagic } from 'react-icons/fa';
import Image from 'next/image';

const categories = [
  { id: 'market-analysis', name: 'ניתוח שוק' },
  { id: 'investment-tips', name: 'טיפים להשקעה' },
  { id: 'property-guides', name: 'מדריכי נכסים' },
  { id: 'news', name: 'חדשות' },
  { id: 'trends', name: 'מגמות' }
];

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    coverImage: null
  });
  const [enhancedContent, setEnhancedContent] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'real-estate');

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!res.ok) throw new Error('Error uploading image');
        const data = await res.json();

        setFormData(prev => ({
          ...prev,
          coverImage: {
            secure_url: data.secure_url,
            publicId: data.public_id
          }
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('שגיאה בהעלאת התמונה');
      }
    }
  };

  const removeImage = async () => {
    if (formData.coverImage?.publicId) {
      try {
        const res = await fetch('/api/upload/cloudinary', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            publicId: formData.coverImage.publicId
          })
        });

        if (!res.ok) throw new Error('Failed to delete image');
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Failed to delete image');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
  };

  const handleEnhanceContent = async () => {
    if (!formData.content) {
      alert('יש להזין תוכן לפני שיפור');
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch('/api/openai/refactor-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          category: formData.category,
          tags: formData.tags
        })
      });

      if (!res.ok) throw new Error('Enhancement failed');

      const data = await res.json();
      setEnhancedContent(data.content);
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert('Failed to enhance content');
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancedContent = () => {
    setFormData(prev => ({
      ...prev,
      content: enhancedContent
    }));
    setEnhancedContent('');
  };

  const cancelEnhancedContent = () => {
    setEnhancedContent('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.content || !formData.category) {
        throw new Error('יש למלא את כל השדות החובה');
      }

      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      // Prepare the blog data
      const blogData = {
        ...formData,
        tags: tagsArray
      };

      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blogData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create blog post');
      }

      // Redirect to the blog management page
      router.push('/dashboard/blog');
      router.refresh();
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert(error.message || 'שגיאה ביצירת הפוסט');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">יצירת פוסט חדש</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              כותרת
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div className="text-black">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              קטגוריה
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר קטגוריה</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="text-black">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תגיות (מופרדות בפסיקים)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="נדל״ן, השקעות, טיפים"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תמונת כותרת
            </label>
            {formData.coverImage ? (
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={formData.coverImage.secure_url}
                  alt="Cover"
                  fill
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>העלה תמונה</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-black">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תוכן
            </label>
            <div className="mt-1">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="הזן את תוכן הפוסט כאן..."
                dir="rtl"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleEnhanceContent}
                disabled={isEnhancing || !formData.content}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <FaMagic className="ml-2" />
                {isEnhancing ? 'משפר...' : 'שפר עם AI'}
              </button>
            </div>
          </div>

          {/* Enhanced Content Preview */}
          {enhancedContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-black">
              <h4 className="text-sm font-medium text-gray-900 mb-2">תוכן משופר:</h4>
              <div 
                className="prose prose-sm max-w-none mb-4" 
                dangerouslySetInnerHTML={{ __html: enhancedContent }}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEnhancedContent}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  בטל
                </button>
                <button
                  type="button"
                  onClick={applyEnhancedContent}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  החל שינויים
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'פרסם פוסט'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 