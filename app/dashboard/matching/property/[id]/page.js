'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaUsers, FaPhone, FaMapMarkerAlt, FaExpand, FaDollarSign, FaBed, FaCalendarAlt, FaArrowLeft, FaUser, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function PropertyMatchingPage({ params }) {
  const [property, setProperty] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDetails, setExpandedDetails] = useState({});
  const router = useRouter();
  
  // Unwrap params Promise for Next.js 15 compatibility
  const resolvedParams = use(params);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchPropertyAndMatches();
    }
  }, [resolvedParams.id]);

  const fetchPropertyAndMatches = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch property details
      const propertyResponse = await fetch(`/api/properties/${resolvedParams.id}`);
      if (!propertyResponse.ok) {
        throw new Error('Property not found');
      }
      const propertyData = await propertyResponse.json();
      setProperty(propertyData);

      // Fetch matching clients and calls for this property
      const matchResponse = await fetch(`/api/matching?type=properties-to-clients&propertyId=${resolvedParams.id}`);
      if (!matchResponse.ok) {
        throw new Error('Failed to fetch matches');
      }
      const matchData = await matchResponse.json();
      
      // Find matches for this specific property
      const propertyMatches = matchData.matches?.find(match => match.property._id === resolvedParams.id);
      setMatches(propertyMatches || { matchedClients: [], matchedCalls: [] });
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

  const MatchDetailsComponent = ({ matchDetails, isExpanded, onToggle }) => {
    if (!matchDetails || matchDetails.length === 0) return null;

    return (
      <div className="mt-3">
        <button
          onClick={(e) => {
            e.preventDefault();
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

  const ClientCard = ({ client, match, index }) => {
    if (!client || !client.clientName) {
      return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-gray-500">לקוח לא תקין</p>
        </div>
      );
    }

    const detailsKey = `client-${index}`;
    const isExpanded = expandedDetails[detailsKey] || false;

    const toggleDetails = () => {
      setExpandedDetails(prev => ({
        ...prev,
        [detailsKey]: !prev[detailsKey]
      }));
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold text-gray-900">{client.clientName}</h4>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            getMatchScoreColor(match.score, match.totalCriteria)
          }`}>
            התאמה: {match.score}/{match.totalCriteria}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <FaPhone className="w-4 h-4 mr-1" />
            {client.phoneNumber || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaEnvelope className="w-4 h-4 mr-1" />
            {client.email || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="w-4 h-4 mr-1" />
            {client.preferredLocation || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaHome className="w-4 h-4 mr-1" />
            {client.preferredPropertyType || 'לא צוין'}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <FaDollarSign className="w-4 h-4 mr-1" />
            תקציב: {formatPrice(client.minPrice)} - {formatPrice(client.maxPrice)}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            סטטוס: {client.status === 'active' ? 'פעיל' : 
                     client.status === 'inactive' ? 'לא פעיל' : 
                     client.status === 'closed' ? 'סגור' : 'פרוספקט'}
          </span>
          <Link
            href={`/dashboard/clients/${client._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            צפה בלקוח
          </Link>
        </div>
        
        <MatchDetailsComponent
          matchDetails={match.matchDetails}
          isExpanded={isExpanded}
          onToggle={toggleDetails}
        />
      </div>
    );
  };

  const CallCard = ({ call, match, index }) => {
    if (!call || !call.summary) {
      return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-gray-500">שיחה לא תקינה</p>
        </div>
      );
    }

    const detailsKey = `call-${index}`;
    const isExpanded = expandedDetails[detailsKey] || false;

    const toggleDetails = () => {
      setExpandedDetails(prev => ({
        ...prev,
        [detailsKey]: !prev[detailsKey]
      }));
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold text-gray-900">
            {call.summary ? call.summary.substring(0, 50) + '...' : 'שיחה ללא תיאור'}
          </h4>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            getMatchScoreColor(match.score, match.totalCriteria)
          }`}>
            התאמה: {match.score}/{match.totalCriteria}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <FaPhone className="w-4 h-4 mr-1" />
            {call.phoneNumber || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="w-4 h-4 mr-1" />
            {formatDate(call.createdAt)}
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="w-4 h-4 mr-1" />
            {call.location || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaDollarSign className="w-4 h-4 mr-1" />
            {formatPrice(call.price)}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            כוונה: {call.intent === 'buyer' ? 'קונה' : 
                    call.intent === 'seller' ? 'מוכר' : 
                    call.intent === 'both' ? 'קונה ומוכר' : 'לא ידוע'}
          </span>
          <Link
            href={`/dashboard/call-analysis/${call._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            צפה בשיחה
          </Link>
        </div>
        
        <MatchDetailsComponent
          matchDetails={match.matchDetails}
          isExpanded={isExpanded}
          onToggle={toggleDetails}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <FaHome className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">שגיאה</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                חזור
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHome className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">נכס לא נמצא</h3>
          <p className="mt-1 text-sm text-gray-500">הנכס המבוקש לא נמצא או שאינך מורשה לצפות בו</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                חזור להתאמות
              </button>
              <h1 className="text-3xl font-bold text-gray-900">התאמות עבור {property.title}</h1>
              <p className="text-gray-600 mt-2">לקוחות ושיחות מתאימים לפי סדר התאמה</p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">פרטי הנכס</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start space-x-6">
              {property.images && property.images.length > 0 && (
                <div className="flex-shrink-0">
                  <Image
                    src={property.images[0].secure_url}
                    alt={property.title}
                    width={200}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{property.phoneNumber || 'לא צוין'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{property.email || 'לא צוין'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{property.location || 'לא צוין'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaHome className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{property.propertyType || 'לא צוין'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaBed className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{property.bedrooms || 0} חדרים</span>
                  </div>
                  <div className="flex items-center">
                    <FaExpand className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{property.area || 0} מ"ר</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matching Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Matched Clients */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaUsers className="w-5 h-5 mr-2 text-blue-600" />
                לקוחות מתאימים ({matches.matchedClients?.length || 0})
              </h3>
            </div>
            <div className="p-6">
              {matches.matchedClients?.length > 0 ? (
                <div className="space-y-4">
                  {matches.matchedClients.map((match, index) => (
                    <ClientCard
                      key={index}
                      client={match.client}
                      match={match}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUsers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">לא נמצאו לקוחות מתאימים לנכס זה</p>
                </div>
              )}
            </div>
          </div>

          {/* Matched Calls */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaPhone className="w-5 h-5 mr-2 text-green-600" />
                שיחות מתאימות ({matches.matchedCalls?.length || 0})
              </h3>
            </div>
            <div className="p-6">
              {matches.matchedCalls?.length > 0 ? (
                <div className="space-y-4">
                  {matches.matchedCalls.map((match, index) => (
                    <CallCard
                      key={index}
                      call={match.call}
                      match={match}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaPhone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">לא נמצאו שיחות מתאימות לנכס זה</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 