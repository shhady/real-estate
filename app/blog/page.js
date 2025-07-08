import { Suspense } from 'react';
import BlogList from '../../components/blog/BlogList';
import BlogFilters from '../../components/blog/BlogFilters';

export const metadata = {
  title: 'בלוג נדל"ן | מאמרים ועדכונים',
  description: 'קרא את המאמרים האחרונים שלנו בנושאי נדל"ן, השקעות, וטיפים לקנייה ומכירת נכסים.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">בלוג נדל"ן</h1>
          <p className="mt-4 text-xl text-gray-600">
            מאמרים, טיפים ותובנות בנושאי נדל"ן
          </p>
        </div>

        <Suspense fallback={<div>טוען פילטרים...</div>}>
          <BlogFilters />
        </Suspense>

        <Suspense fallback={<div className="text-center py-8">טוען מאמרים...</div>}>
          <BlogList />
        </Suspense>
      </div>
    </div>
  );
} 