'use client';

import { useState, useEffect } from 'react';
import { FaHome, FaUsers, FaPhone, FaMapMarkerAlt, FaExpand, FaDollarSign, FaBed, FaCalendarAlt, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MatchingPage() {
  const [activeTab, setActiveTab] = useState('properties-to-clients');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [expandedDetails, setExpandedDetails] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/matching?type=${activeTab}`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      
      const data = await response.json();
      setMatches(data.matches || []);
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
          onClick={onToggle}
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

  const PropertyCard = ({ property, isExternal = false, matchDetails, clientIndex, propertyIndex }) => {
    // Add null checks
    if (!property || !property.title) {
      return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-gray-500">נכס לא תקין</p>
        </div>
      );
    }

    const detailsKey = `client-${clientIndex}-property-${propertyIndex}`;
    const isExpanded = expandedDetails[detailsKey] || false;

    const toggleDetails = () => {
      setExpandedDetails(prev => ({
        ...prev,
        [detailsKey]: !prev[detailsKey]
      }));
    };

    return (
      <div className={`border rounded-lg p-4 ${isExternal ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-start space-x-4">
          {property.images && property.images.length > 0 && (
            <div className="flex-shrink-0">
              <Image
                src={property.images[0].secure_url}
                alt={property.title}
                width={80}
                height={60}
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h4>
              {isExternal && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <FaExternalLinkAlt className="w-3 h-3 mr-1" />
                  לא של הסוכן שלך
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
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
            
            {matchDetails && (
              <MatchDetailsComponent
                matchDetails={matchDetails}
                isExpanded={isExpanded}
                onToggle={toggleDetails}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const ClientCard = ({ client, score, totalCriteria, matchDetails, propertyIndex, clientIndex }) => {
    // Add null checks
    if (!client || !client.clientName) {
      return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-gray-500">לקוח לא תקין</p>
        </div>
      );
    }

    const detailsKey = `property-${propertyIndex}-client-${clientIndex}`;
    const isExpanded = expandedDetails[detailsKey] || false;

    const toggleDetails = () => {
      setExpandedDetails(prev => ({
        ...prev,
        [detailsKey]: !prev[detailsKey]
      }));
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-semibold text-gray-900">{client.clientName}</h4>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(score, totalCriteria)}`}>
            התאמה: {score}/{totalCriteria}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <FaPhone className="w-4 h-4 mr-1" />
            {client.phoneNumber || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="w-4 h-4 mr-1" />
            {client.preferredLocation || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaHome className="w-4 h-4 mr-1" />
            {client.preferredPropertyType || 'לא צוין'}
          </div>
          <div className="flex items-center">
            <FaDollarSign className="w-4 h-4 mr-1" />
            {client.minPrice || client.maxPrice 
              ? `${formatPrice(client.minPrice)} - ${formatPrice(client.maxPrice)}`
              : 'לא צוין'}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            סטטוס: {client.status === 'prospect' ? 'פוטנציאלי' : 
                     client.status === 'active' ? 'פעיל' : 
                     client.status === 'inactive' ? 'לא פעיל' : client.status}
          </span>
          <Link
            href={`/dashboard/clients/${client._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            צפה בלקוח
          </Link>
        </div>
        
        <MatchDetailsComponent
          matchDetails={matchDetails}
          isExpanded={isExpanded}
          onToggle={toggleDetails}
        />
      </div>
    );
  };

  const CallCard = ({ call, score, totalCriteria }) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-gray-900">
          שיחה - {call.intent === 'buy' ? 'קנייה' : call.intent === 'sell' ? 'מכירה' : 'לא ידוע'}
        </h4>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(score, totalCriteria)}`}>
          התאמה: {score}/{totalCriteria}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <FaCalendarAlt className="w-4 h-4 mr-1" />
          {formatDate(call.createdAt)}
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="w-4 h-4 mr-1" />
          {call.location || 'לא צוין'}
        </div>
        {call.rooms && (
          <div className="flex items-center">
            <FaBed className="w-4 h-4 mr-1" />
            {call.rooms} חדרים
          </div>
        )}
        {call.price && (
          <div className="flex items-center">
            <FaDollarSign className="w-4 h-4 mr-1" />
            {formatPrice(call.price)}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-700 mb-2">
        <strong>סיכום:</strong> {call.summary ? call.summary.substring(0, 100) + '...' : 'לא זמין'}
      </div>
      <div className="flex justify-end">
        <Link
          href={`/dashboard/call-analysis/${call._id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          צפה בשיחה
        </Link>
      </div>
    </div>
  );

  const PropertiesToClientsTab = () => {
    const [properties, setProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(true);

    useEffect(() => {
      fetchProperties();
    }, []);

    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        
        // Fetch user's properties
        const propertiesResponse = await fetch('/api/properties/my-properties');
        const propertiesData = await propertiesResponse.json();
        
        console.log('Properties data:', propertiesData);
        
        // Properties are returned directly as an array
        const userProperties = Array.isArray(propertiesData) ? propertiesData : [];
        
        console.log('User properties:', userProperties);
        
        setProperties(userProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    const handlePropertyClick = (propertyId) => {
      router.push(`/dashboard/matching/property/${propertyId}`);
    };

    if (loadingProperties) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaHome className="w-5 h-5 mr-2 text-blue-600" />
              הנכסים שלי ({properties.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              לחץ על נכס כדי לראות לקוחות ושיחות מתאימים
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    נכס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מיקום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סוג נכס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מחיר
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    חדרים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שטח
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr 
                    key={property._id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handlePropertyClick(property._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaHome className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title || 'לא צוין'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.description ? property.description.substring(0, 50) + '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="h-4 w-4 mr-1 text-gray-400" />
                        {property.location || 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.propertyType || 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaDollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaBed className="h-4 w-4 mr-1 text-gray-400" />
                        {property.bedrooms || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaExpand className="h-4 w-4 mr-1 text-gray-400" />
                        {property.area || 0} מ"ר
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(property._id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        צפה בהתאמות
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <FaHome className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">אין נכסים להצגה</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ClientsToPropertiesTab = () => {
    const [clients, setClients] = useState([]);
    const [calls, setCalls] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    useEffect(() => {
      fetchClientsAndCalls();
    }, []);

    const fetchClientsAndCalls = async () => {
      try {
        setLoadingClients(true);
        
        let clientsData = [];
        let callsData = [];
        
        // Fetch clients with error handling
        try {
          const clientsResponse = await fetch('/api/clients');
          if (clientsResponse.ok) {
            const responseData = await clientsResponse.json();
            clientsData = Array.isArray(responseData) ? responseData : [];
            console.log('Raw clients data:', clientsData);
          } else {
            console.error('Failed to fetch clients:', clientsResponse.status, clientsResponse.statusText);
            const errorData = await clientsResponse.json().catch(() => ({}));
            console.error('Clients API error:', errorData);
          }
        } catch (clientsError) {
          console.error('Error fetching clients:', clientsError);
        }
        
        // Fetch calls with error handling
        try {
          const callsResponse = await fetch('/api/calls');
          if (callsResponse.ok) {
            const responseData = await callsResponse.json();
            callsData = Array.isArray(responseData) ? responseData : [];
            console.log('Raw calls data:', callsData);
          } else {
            console.error('Failed to fetch calls:', callsResponse.status, callsResponse.statusText);
            const errorData = await callsResponse.json().catch(() => ({}));
            console.error('Calls API error:', errorData);
          }
        } catch (callsError) {
          console.error('Error fetching calls:', callsError);
        }
        
        // Filter clients to include only buyers (exclude sellers-only)
        const buyerClients = clientsData.filter(client => {
          if (!client || !client.clientName) return false;
          console.log('Client intent:', client.clientName, client.intent);
          return client.intent === 'buyer' || client.intent === 'both';
        });
        
        // Filter calls to include only those from buyers/sellers (exclude sellers-only)
        const buyerCalls = callsData.filter(call => {
          if (!call || !call.summary) return false;
          console.log('Call intent:', call.summary?.substring(0, 30), call.intent);
          return call.intent === 'buyer' || call.intent === 'both';
        });
        
        console.log('Filtered buyer clients:', buyerClients);
        console.log('Filtered buyer calls:', buyerCalls);
        
        setClients(buyerClients);
        setCalls(buyerCalls);
      } catch (err) {
        console.error('Error fetching clients and calls:', err);
        // Set empty arrays as fallback
        setClients([]);
        setCalls([]);
      } finally {
        setLoadingClients(false);
      }
    };

    const handleClientClick = (clientId) => {
      router.push(`/dashboard/matching/client/${clientId}`);
    };

    const handleCallClick = (callId) => {
      router.push(`/dashboard/matching/call/${callId}`);
    };

    if (loadingClients) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUsers className="w-5 h-5 mr-2 text-blue-600" />
              הלקוחות שלי - קונים ({clients.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              לחץ על לקוח כדי לראות נכסים מתאימים
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם הלקוח
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    טלפון
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מיקום מבוקש
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סוג נכס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תקציב
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr 
                    key={client._id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleClientClick(client._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUsers className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.clientName || 'לא צוין'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaPhone className="h-4 w-4 mr-1 text-gray-400" />
                        {client.phoneNumber || 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="h-4 w-4 mr-1 text-gray-400" />
                        {client.preferredLocation || 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaHome className="h-4 w-4 mr-1 text-gray-400" />
                        {client.preferredPropertyType || 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.maxPrice ? formatPrice(client.maxPrice) : 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client._id);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FaEye className="h-4 w-4 mr-1" />
                        הצג התאמות
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין לקוחות</h3>
              <p className="mt-1 text-sm text-gray-500">
                לא נמצאו לקוחות המעוניינים לקנות נכסים
              </p>
            </div>
          )}
        </div>

        {/* Calls Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaPhone className="w-5 h-5 mr-2 text-green-600" />
              שיחות מלקוחות קונים ({calls.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              לחץ על שיחה כדי לראות נכסים מתאימים
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תקציר שיחה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מיקום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך שיחה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מחיר
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.map((call) => (
                  <tr 
                    key={call._id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCallClick(call._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FaPhone className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {call.summary ? call.summary.substring(0, 50) + '...' : 'לא צוין'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {call.intent === 'both' ? 'קונה ומוכר' : 
                             call.intent === 'buyer' ? 'קונה' :
                             call.intent === 'seller' ? 'מוכר' : 
                             call.intent === 'unknown' ? 'לא ידוע' : 'לא צוין'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="h-4 w-4 mr-1 text-gray-400" />
                        {call.location || 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.date ? formatDate(call.date) : call.createdAt ? formatDate(call.createdAt) : 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.price ? formatPrice(call.price) : 'לא צוין'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallClick(call._id);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FaEye className="h-4 w-4 mr-1" />
                        הצג התאמות
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {calls.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FaPhone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין שיחות</h3>
              <p className="mt-1 text-sm text-gray-500">
                לא נמצאו שיחות מלקוחות המעוניינים לקנות נכסים
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">התאמות חכמות</h1>
          <p className="text-gray-600">מערכת התאמות אוטומטית בין נכסים, לקוחות ושיחות</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties-to-clients')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties-to-clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
               התאמת נכסים 
            </button>
            <button
              onClick={() => setActiveTab('clients-to-properties')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients-to-properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              התאמת לקוחות 
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">טוען התאמות...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">שגיאה: {error}</div>
            <button
              onClick={fetchMatches}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              נסה שוב
            </button>
          </div>
        ) : (
          <div>
            {activeTab === 'properties-to-clients' ? (
              <PropertiesToClientsTab />
            ) : (
              <ClientsToPropertiesTab />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 