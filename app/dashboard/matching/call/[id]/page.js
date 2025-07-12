'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaUsers, FaPhone, FaMapMarkerAlt, FaExpand, FaDollarSign, FaBed, FaCalendarAlt, FaExternalLinkAlt, FaEye, FaArrowLeft, FaUser, FaEnvelope, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function CallMatchingPage({ params }) {
  const [call, setCall] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDetails, setExpandedDetails] = useState({});
  const router = useRouter();
  
  // Unwrap params Promise for Next.js 15 compatibility
  const resolvedParams = use(params);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchCallAndMatches();
    }
  }, [resolvedParams.id]);

  const fetchCallAndMatches = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch call details
      const callResponse = await fetch(`/api/calls/${resolvedParams.id}`);
      if (!callResponse.ok) {
        throw new Error('Call not found');
      }
      const callData = await callResponse.json();
      setCall(callData); // API returns call directly, not wrapped in { call: ... }

      // Fetch matching properties for this call
      const matchResponse = await fetch(`/api/matching?type=calls-to-properties&callId=${resolvedParams.id}`);
      if (!matchResponse.ok) {
        throw new Error('Failed to fetch matches');
      }
      const matchData = await matchResponse.json();
      
      // Find matches for this specific call
      const callMatches = matchData.matches?.find(match => match.call._id === resolvedParams.id);
      setMatches(callMatches?.matchedProperties || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'לא צוין';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const getMatchScoreColor = (score, totalCriteria) => {
    const percentage = (score / totalCriteria) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (match) => {
    const isExternal = match.isExternal;
    const isPerfect = match.score === match.totalCriteria;
    
    if (isPerfect && !isExternal) return 'border-green-500 bg-green-50'; // Priority 1
    if (isPerfect && isExternal) return 'border-blue-500 bg-blue-50'; // Priority 2
    if (!isPerfect && !isExternal) return 'border-yellow-500 bg-yellow-50'; // Priority 3
    return 'border-orange-500 bg-orange-50'; // Priority 4
  };

  const MatchDetailsComponent = ({ matchDetails, isExpanded, onToggle }) => {
    if (!matchDetails || matchDetails.length === 0) return null;

    return (
      <div className="mt-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? 'הסתר פרטים' : 'הצג פרטי התאמה'}
        </button>
        
        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-2">פרטי התאמה:</h5>
            <div className="space-y-1">
              {matchDetails.map((detail, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{detail.label}:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{detail.propertyValue}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-gray-600">{detail.clientValue}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      detail.match 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {detail.match ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PropertyCard = ({ property, match, index }) => {
    if (!property || !property.title) {
      return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-gray-500">נכס לא תקין</p>
        </div>
      );
    }

    const detailsKey = `property-${index}`;
    const isExpanded = expandedDetails[detailsKey] || false;

    const toggleDetails = () => {
      setExpandedDetails(prev => ({
        ...prev,
        [detailsKey]: !prev[detailsKey]
      }));
    };

    return (
      <div className={`border-2 rounded-lg p-4 ${getPriorityColor(match)}`}>
        <div className="flex items-start space-x-4">
          {property.images && property.images.length > 0 && (
            <div className="flex-shrink-0">
              <Image
                src={property.images[0].secure_url}
                alt={property.title}
                width={120}
                height={80}
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-gray-900">{property.title}</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getMatchScoreColor(match.score, match.totalCriteria)
                }`}>
                  התאמה: {match.score}/{match.totalCriteria}
                </span>
                {match.isExternal && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <FaExternalLinkAlt className="w-3 h-3 mr-1" />
                    חיצוני
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                {property.location || 'לא צוין'}
              </div>
              <div className="flex items-center">
                <FaDollarSign className="w-4 h-4 mr-1" />
                {formatPrice(property.price)}
              </div>
              <div className="flex items-center">
                <FaBed className="w-4 h-4 mr-1" />
                {property.bedrooms || 0} חדרים
              </div>
              <div className="flex items-center">
                <FaExpand className="w-4 h-4 mr-1" />
                {property.area || 0} מ"ר
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                סוכן: {property.user?.fullName || 'לא ידוע'}
              </span>
              <Link
                href={`/properties/${property._id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                צפה בנכס
              </Link>
            </div>
            
            {match.matchDetails && (
              <MatchDetailsComponent
                matchDetails={match.matchDetails}
                isExpanded={isExpanded}
                onToggle={toggleDetails}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">שגיאה: {error}</div>
        <button
          onClick={fetchCallAndMatches}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">שיחה לא נמצאה</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            חזור לרשימת הלקוחות
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">התאמות עבור שיחה</h1>
          <p className="text-gray-600">נכסים מתאימים לפי סדר עדיפויות</p>
        </div>

        {/* Call Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaPhone className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">שיחה</h3>
              <p className="text-sm text-gray-600">פרטי השיחה</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="w-4 h-4 mr-2" />
              {call.date ? formatDate(call.date) : call.createdAt ? formatDate(call.createdAt) : 'לא צוין'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="w-4 h-4 mr-2" />
              {call.location || 'לא צוין'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaHome className="w-4 h-4 mr-2" />
              {call.intent === 'both' ? 'קונה ומוכר' : call.intent === 'buyer' ? 'קונה' : call.intent === 'seller' ? 'מוכר' : 'לא צוין'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaDollarSign className="w-4 h-4 mr-2" />
              {call.price ? formatPrice(call.price) : 'לא צוין'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaBed className="w-4 h-4 mr-2" />
              {call.rooms || 'לא צוין'} חדרים
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FaExpand className="w-4 h-4 mr-2" />
              {call.area || 'לא צוין'} מ"ר
            </div>
          </div>
          
          {call.summary && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">תקציר השיחה:</h4>
              <p className="text-sm text-gray-700">{call.summary}</p>
            </div>
          )}
        </div>

        {/* Priority Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">מקרא עדיפויות</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">עדיפות 1: 5/5 שלי</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">עדיפות 2: 5/5 חיצוני</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">עדיפות 3: 4/5 שלי</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">עדיפות 4: 4/5 חיצוני</span>
            </div>
          </div>
        </div>

        {/* Matching Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaHome className="w-5 h-5 mr-2" />
            נכסים מתאימים ({matches.length})
          </h3>
          
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <FaHome className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">לא נמצאו נכסים מתאימים עבור השיחה הזו</p>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map((match, index) => (
                <PropertyCard 
                  key={index} 
                  property={match.property} 
                  match={match} 
                  index={index} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 