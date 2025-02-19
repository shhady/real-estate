import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import connectDB from '@/app/lib/mongodb';
import Blog from '@/app/models/Blog';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug }).lean();
    
    if (!blog) {
      return {
        title: 'מאמר לא נמצא',
        description: 'המאמר המבוקש לא נמצא.',
      };
    }

    return {
      title: `${blog.title} | בלוג נדל"ן`,
      description: blog.content.substring(0, 160),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'בלוג נדל"ן',
      description: 'מאמרי נדל"ן מקצועיים',
    };
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const blog = await Blog.findOne({ slug })
      .populate('author', 'fullName email profileImage')
      .lean();

    if (!blog) {
      notFound();
    }
    console.log(blog)
    return (
      <article className="min-h-screen bg-white py-8 text-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.coverImage.secure_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Title and Meta */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            <div className="flex items-center text-gray-600 gap-4">
              {blog.author && (
                <div className="flex items-center">
                  {blog.author.profileImage ? (
                    <Image
                      src={blog.author.profileImage.secure_url}
                      alt={blog.author.fullName}
                      width={40}
                      height={40}
                      className="rounded-full w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                  <span className="mr-2 font-medium">{blog.author.fullName}</span>
                </div>
              )}
              <span>•</span>
              <time dateTime={blog.createdAt} className="text-gray-500">
                {formatDistanceToNow(new Date(blog.createdAt), {
                  addSuffix: true,
                  locale: he,
                })}
              </time>
              <span>•</span>
              <span className="text-gray-500">{blog.views} צפיות</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none rtl">
            <div 
              dangerouslySetInnerHTML={{ __html: blog.content }} 
              className="text-gray-800 leading-relaxed"
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
} 