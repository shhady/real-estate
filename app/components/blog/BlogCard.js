import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const BlogCard = ({ blog }) => {
  const {
    title,
    content,
    slug,
    coverImage,
    author,
    category,
    views,
    createdAt
  } = blog;

  // Strip HTML tags and get first 150 characters for preview
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const contentPreview = typeof content === 'string' 
    ? stripHtml(content).substring(0, 150) + '...'
    : '';

  // Category styles
  const categoryStyles = {
    'market-analysis': 'bg-blue-100 text-blue-800',
    'investment-tips': 'bg-green-100 text-green-800',
    'property-guides': 'bg-purple-100 text-purple-800',
    'news': 'bg-yellow-100 text-yellow-800',
    'trends': 'bg-pink-100 text-pink-800'
  };

  const categoryNames = {
    'market-analysis': 'ניתוח שוק',
    'investment-tips': 'טיפים להשקעה',
    'property-guides': 'מדריכי נכסים',
    'news': 'חדשות',
    'trends': 'מגמות'
  };

  return (
    <Link href={`/blog/${slug}`}>
      <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative h-48 w-full">
          <Image
            src={coverImage?.secure_url || '/placeholder-blog.jpg'}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-5">
          {/* Category */}
          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryStyles[category] || 'bg-gray-100 text-gray-800'}`}>
              {categoryNames[category] || category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>

          {/* Content Preview */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {contentPreview}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              {author?.profileImage ? (
                <Image
                  src={author.profileImage.secure_url}
                  alt={author.fullName || 'Author'}
                  width={24}
                  height={24}
                  className="rounded-full ml-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full ml-2" />
              )}
              <span>{author?.fullName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{views} צפיות</span>
              <span>•</span>
              <time dateTime={createdAt}>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: he,
                })}
              </time>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard; 