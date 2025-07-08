'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '../ui/PropertyCard';

export default function PropertyList() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryString = searchParams.toString();
      const res = await fetch(`/api/properties${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data = await res.json();
      setProperties(data.properties);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.total
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-black">טוען נכסים...</div>;
  }

  return (
    <>
      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900">לא נמצאו נכסים</h3>
          <p className="mt-2 text-gray-600">נסה לשנות את מסנני החיפוש שלך</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrentPage = pageNum === pagination.currentPage;
              const newSearchParams = new URLSearchParams(searchParams.toString());
              newSearchParams.set('page', pageNum.toString());
              
              return (
                <a
                  key={pageNum}
                  href={`/properties?${newSearchParams.toString()}`}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                    ${isCurrentPage 
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
} 