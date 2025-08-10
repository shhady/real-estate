'use client';

import { useState, useEffect } from 'react';
import { FaHome, FaUsers, FaPhone, FaMapMarkerAlt, FaExpand, FaDollarSign, FaBed, FaCalendarAlt, FaExternalLinkAlt, FaEye, FaSearch, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MatchingPage() {
  const [activeTab, setActiveTab] = useState('properties-to-clients');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const togglePropertyCollaboration = async (propertyId, currentStatus, onLocalUpdate) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboration: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update collaboration');
      if (onLocalUpdate) onLocalUpdate(newStatus);
      return newStatus;
    } catch (e) {
      console.error('Collaboration toggle failed:', e);
      alert('עדכון סטטוס שיתוף פעולה נכשל');
      return currentStatus;
    }
  };

  // Property type mapping and formatters (Hebrew + array support)
  const hebrewTypeMap = {
    apartment: 'דירה',
    house: 'בית פרטי',
    condo: 'דירת גן',
    villa: 'וילה',
    cottage: "קוטג'",
    duplex: 'דופלקס',
    land: 'קרקע',
    commercial: 'מסחרי',
    office: 'משרד',
    warehouse: 'מחסן',
    penthouse: 'פנטהאוז',
    triplex: 'טריפלקס',
    studio: 'סטודיו',
    loft: 'לופט',
    townhouse: 'בית עירוני',
    garage: 'חניה/מוסך',
    basement: 'מרתף',
    roof: 'גג',
    garden: 'גינה',
    balcony: 'מרפסת',
    terrace: 'טרסה',
    other: 'אחר'
  };
  const toHebrewType = (val) => {
    if (!val || typeof val !== 'string') return val || '';
    const key = val.toLowerCase();
    return hebrewTypeMap[key] || val;
  };
  const formatTypeValue = (val) => {
    if (Array.isArray(val)) {
      return val.map((v) => toHebrewType(v)).join(', ');
    }
    return toHebrewType(val);
  };

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
            סטטוס: { 
                     client.status === 'active' ? 'פעיל' : 
                     client.status === 'inactive' ? 'לא פעיל' : 'סגור'}
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

  const PropertiesToClientsTab = ({ searchTerm }) => {
    const [properties, setProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(true);
    const [propertyMatchCounts, setPropertyMatchCounts] = useState({}); // propertyId -> number
    const [showAgentsModal, setShowAgentsModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [matchingAgents, setMatchingAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState({});
    const [agentsLoading, setAgentsLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    useEffect(() => {
      fetchProperties();
    }, []);

    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        
        // Fetch user's properties
        const propertiesResponse = await fetch('/api/properties/my-properties');
        const propertiesData = await propertiesResponse.json();
        
        const userProperties = Array.isArray(propertiesData) ? propertiesData : [];
        setProperties(userProperties);

        // Fetch fast counts for properties
        try {
          const countsRes = await fetch('/api/matching?type=properties-to-clients&summary=1');
          if (countsRes.ok) {
            const countsData = await countsRes.json();
            setPropertyMatchCounts(countsData?.counts || {});
          }
        } catch {}
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    const fetchMatchingAgents = async (property) => {
      try {
        setAgentsLoading(true);
        const res = await fetch(`/api/collaboration-matches?propertyId=${property._id}&minMatch=5`);
        if (!res.ok) throw new Error('Failed to fetch matching agents');
        const data = await res.json();
        const agents = data.agents || [];
        setMatchingAgents(agents);
        const defaultSelection = {};
        agents.forEach((a) => { defaultSelection[a._id] = true; });
        setSelectedAgents(defaultSelection);
      } catch (err) {
        console.error('Error fetching matching agents:', err);
        setMatchingAgents([]);
        setSelectedAgents({});
        setLocalError('שגיאה בטעינת סוכנים מתאימים');
      } finally {
        setAgentsLoading(false);
      }
    };

    const AgentsModal = () => {
      if (!showAgentsModal || !selectedProperty) return null;
      const sendEmails = async () => {
        const selectedAgentIds = Object.keys(selectedAgents).filter((id) => selectedAgents[id]);
        if (selectedAgentIds.length === 0) {
          setLocalError('אנא בחר לפחות סוכן אחד לשליחת מייל');
          return;
        }
        setAgentsLoading(true);
        try {
          const response = await fetch('/api/send-collaboration-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId: selectedProperty._id, selectedAgentIds })
          });
          const data = await response.json();
          if (data.success) {
            alert(`מיילים נשלחו בהצלחה ל-${selectedAgentIds.length} סוכנים!`);
            setShowAgentsModal(false);
          } else {
            setLocalError('שגיאה בשליחת המיילים');
          }
        } catch (e) {
          console.error(e);
          setLocalError('שגיאה בשליחת המיילים');
        } finally {
          setAgentsLoading(false);
        }
      };

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-4" dir="rtl">
            <div className="relative p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">סוכנים עם לקוחות מתאימים - {selectedProperty.title}</h2>
              <button onClick={() => setShowAgentsModal(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
                <FaTimes className="h-6 w-6" />
              </button>
              {localError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{localError}</div>
              )}
              {agentsLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-3 text-gray-600">מחפש סוכנים מתאימים...</p>
                </div>
              ) : matchingAgents.length === 0 ? (
                <div className="text-center py-10 text-gray-500">לא נמצאו סוכנים עם לקוחות מתאימים (מינימום 5/6 התאמה)</div>
              ) : (
                <>
                  <div className="mb-4 text-gray-900">נמצאו {matchingAgents.length} סוכנים עם לקוחות מתאימים</div>
                  <div className="space-y-3 mb-6">
                    {matchingAgents.map((agent) => (
                      <label key={agent._id} className="flex items-start gap-3 p-3 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedAgents[agent._id] || false}
                          onChange={() => setSelectedAgents((prev) => ({ ...prev, [agent._id]: !prev[agent._id] }))}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{agent.fullName}</div>
                          <div className="text-sm text-gray-600">{agent.agencyName}</div>
                          <div className="text-xs text-gray-500">{agent.email} • {agent.phone}</div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{agent.matchingClients.length} לקוחות מתאימים</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <button onClick={() => setShowAgentsModal(false)} className="w-full sm:w-auto px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">סגור</button>
                    <button onClick={sendEmails} disabled={agentsLoading || Object.values(selectedAgents).filter(Boolean).length===0} className="w-full sm:w-auto px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">שלח מייל ל-{Object.values(selectedAgents).filter(Boolean).length} סוכנים</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
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

    const filteredProperties = (properties || []).filter((p) =>
      (p?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
      <div className="space-y-8">
        {/* Properties Mobile Cards (mobile only) */}
        <div className="md:hidden space-y-4">
          {filteredProperties.map((property) => (
            <div key={property._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FaHome className="w-4 h-4 text-blue-600" />
                    <h4 className="text-base font-semibold text-gray-900 truncate">{property.title || 'לא צוין'}</h4>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="w-3.5 h-3.5 mr-1" />
                      {property.location || 'לא צוין'}
                    </div>
                    <div className="flex items-center">
                      <FaHome className="w-3.5 h-3.5 mr-1" />
                      {toHebrewType(property.propertyType) || 'לא צוין'}
                    </div>
                    <div className="flex items-center">
                      <FaDollarSign className="w-3.5 h-3.5 mr-1" />
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex items-center">
                      <FaBed className="w-3.5 h-3.5 mr-1" />
                      {property.bedrooms || 0} חדרים
                    </div>
                  </div>
                </div>
                {/* Collaboration toggle */}
                <button
                  onClick={async () => {
                    const ns = await togglePropertyCollaboration(property._id, property.collaboration, (newStatus)=>{
                      setProperties(prev=>prev.map(p=>p._id===property._id?{...p, collaboration: newStatus}:p));
                    });
                    if (ns) {
                      setSelectedProperty(property);
                      await fetchMatchingAgents(property);
                      setShowAgentsModal(true);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${property.collaboration ? 'bg-green-600' : 'bg-gray-200'}`}
                  title="מוכן לשיתוף פעולה"
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${property.collaboration ? 'translate-x-0' : '-translate-x-5'}`} />
                </button>
              </div>
              <button
                onClick={() => handlePropertyClick(property._id)}
                className="mt-3 w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                צפה בהתאמות {typeof propertyMatchCounts[property._id] === 'number' ? `(${propertyMatchCounts[property._id]})` : ''}
              </button>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="text-center py-12">
              <FaHome className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">אין נכסים להצגה</p>
            </div>
          )}
        </div>

        {/* Properties Table (desktop only) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaHome className="w-5 h-5 mr-2 text-blue-600" />
              הנכסים שלי ({properties.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">לחץ על נכס כדי לראות לקוחות ושיחות מתאימים</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">נכס</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מיקום</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סוג נכס</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מחיר</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">חדרים</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שטח</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שיתוף פעולה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{property.title || 'לא צוין'}</div>
                      <div className="text-sm text-gray-500">{property.description ? property.description.substring(0, 50) + '...' : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center"><FaMapMarkerAlt className="h-4 w-4 mx-1 text-gray-400" />{property.location || 'לא צוין'}</div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{toHebrewType(property.propertyType) || 'לא צוין'}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 flex items-center"><FaDollarSign className="h-4 w-4 mr-1 text-gray-400" />{formatPrice(property.price)}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 flex items-center"><FaBed className="h-4 w-4 mx-1 text-gray-400" />{property.bedrooms || 0}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 flex items-center"><FaExpand className="h-4 w-4 mx-1 text-gray-400" />{property.area || 0} מ"ר</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={async () => {
                          const ns = await togglePropertyCollaboration(property._id, property.collaboration, (newStatus)=>{
                            setProperties(prev=>prev.map(p=>p._id===property._id?{...p, collaboration: newStatus}:p));
                          });
                          if (ns) {
                            setSelectedProperty(property);
                            await fetchMatchingAgents(property);
                            setShowAgentsModal(true);
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${property.collaboration ? 'bg-green-600' : 'bg-gray-200'}`}
                        title="מוכן לשיתוף פעולה"
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${property.collaboration ? 'translate-x-0' : '-translate-x-5'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handlePropertyClick(property._id)} className="text-blue-600 hover:text-blue-900">צפה בהתאמות {typeof propertyMatchCounts[property._id] === 'number' ? `(${propertyMatchCounts[property._id]})` : ''}</button>
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

        {/* Agents Modal */}
        <AgentsModal />
      </div>
    );
  };

  const ClientsToPropertiesTab = ({ searchTerm }) => {
    const [clients, setClients] = useState([]);
    const [calls, setCalls] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [matchCounts, setMatchCounts] = useState({}); // clientId -> number

    useEffect(() => {
      fetchClientsAndCalls();
    }, []);

    // Removed per-client fetch; we'll use a single bulk request for counts

    const fetchClientsAndCalls = async () => {
      try {
        setLoadingClients(true);
        
        let clientsData = [];
        let callsData = [];
        
        // Fetch clients
        try {
          const clientsResponse = await fetch('/api/clients');
          if (clientsResponse.ok) {
            const responseData = await clientsResponse.json();
            clientsData = Array.isArray(responseData) ? responseData : [];
          }
        } catch {}
        
        // Fetch calls
        try {
          const callsResponse = await fetch('/api/calls');
          if (callsResponse.ok) {
            const responseData = await callsResponse.json();
            callsData = Array.isArray(responseData) ? responseData : [];
          }
        } catch {}
        
        const buyerClients = clientsData.filter(c => c && c.clientName && (c.intent === 'buyer' || c.intent === 'renter' || c.intent === 'both'));
        const buyerCalls = callsData.filter(call => call && call.summary && (call.intent === 'buyer' || call.intent === 'renter' || call.intent === 'both'));

        // Fast summary counts request
        let countsMap = {};
        try {
          const matchesRes = await fetch('/api/matching?type=clients-to-properties&summary=1');
          if (matchesRes.ok) {
            const data = await matchesRes.json();
            countsMap = data?.counts || {};
          }
        } catch {}

        const finalizedCounts = buyerClients.reduce((acc, c) => {
          acc[c._id] = typeof countsMap[c._id] === 'number' ? countsMap[c._id] : 0;
          return acc;
        }, {});

        setClients(buyerClients);
        setCalls(buyerCalls);
        setMatchCounts(finalizedCounts);
      } catch (err) {
        setClients([]);
        setCalls([]);
        setMatchCounts({});
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

    const filteredClients = (clients || []).filter((c) =>
      (c?.clientName || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    if (loadingClients) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Clients Mobile Cards (mobile only) */}
        <div className="md:hidden space-y-4">
          {filteredClients.map((client) => (
            <div key={client._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate">{client.clientName || 'לא צוין'}</h4>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center"><FaPhone className="w-3.5 h-3.5 mr-1" />{client.phoneNumber || 'לא צוין'}</div>
                    <div className="flex items-center"><FaMapMarkerAlt className="w-3.5 h-3.5 mr-1" />{client.preferredLocation || 'לא צוין'}</div>
                    <div className="flex items-center"><FaHome className="w-3.5 h-3.5 mr-1" />{formatTypeValue(client.preferredPropertyType) || 'לא צוין'}</div>
                    <div className="flex items-center">{client.maxPrice ? formatPrice(client.maxPrice) : 'לא צוין'}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleClientClick(client._id)}
                className="mt-3 w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                הצג התאמות {typeof matchCounts[client._id] === 'number' ? `(${matchCounts[client._id]})` : ''}
              </button>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין לקוחות</h3>
              <p className="mt-1 text-sm text-gray-500">לא נמצאו לקוחות המעוניינים לקנות נכסים</p>
            </div>
          )}
        </div>

        {/* Clients Table (desktop only) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaUsers className="w-5 h-5 mr-2 text-blue-600" /> הלקוחות שלי - קונים ושוכרים ({clients.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">לחץ על לקוח כדי לראות נכסים מתאימים</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם הלקוח</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">טלפון</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מיקום מבוקש</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סוג נכס</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תקציב</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleClientClick(client._id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUsers className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{client.clientName || 'לא צוין'}</div>
                          <div className="text-sm text-gray-500">{client.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center"><FaPhone className="h-4 w-4 mx-1 text-gray-400" />{client.phoneNumber || 'לא צוין'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center"><FaMapMarkerAlt className="h-4 w-4 mx-1 text-gray-400" />{client.preferredLocation || 'לא צוין'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center"><FaHome className="h-4 w-4 mx-1 text-gray-400" />{formatTypeValue(client.preferredPropertyType) || 'לא צוין'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.maxPrice ? formatPrice(client.maxPrice) : 'לא צוין'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={(e) => { e.stopPropagation(); handleClientClick(client._id); }} className="text-blue-600 hover:text-blue-900 flex items-center gap-2">
                        <FaEye className="h-4 w-4 mr-1" />
                        הצג התאמות {typeof matchCounts[client._id] === 'number' ? `(${matchCounts[client._id]})` : ''}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">אין לקוחות</h3>
              <p className="mt-1 text-sm text-gray-500">לא נמצאו לקוחות המעוניינים לקנות נכסים</p>
            </div>
          )}
        </div>

        {/* Calls Table */}
        {/* <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaPhone className="w-5 h-5 mr-2 text-green-600" />
              שיחות מלקוחות קונים ושוכרים ({calls.length})
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
                לא נמצאו שיחות מלקוחות המעוניינים לקנות או לשכור נכסים
              </p>
            </div>
          )}
        </div> */}
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

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'clients-to-properties' ? 'חפש לפי שם לקוח...' : 'חפש לפי שם נכס...'}
              className="w-full rounded-lg border border-gray-300 pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-2">
          <div className="inline-flex w-full md:w-auto bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('properties-to-clients')}
              aria-selected={activeTab === 'properties-to-clients'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'properties-to-clients'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaHome className={`w-4 h-4 ${activeTab === 'properties-to-clients' ? 'text-blue-600' : 'text-gray-400'}`} />
              התאמת נכסים
            </button>
            <button
              onClick={() => setActiveTab('clients-to-properties')}
              aria-selected={activeTab === 'clients-to-properties'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'clients-to-properties'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaUsers className={`w-4 h-4 ${activeTab === 'clients-to-properties' ? 'text-blue-600' : 'text-gray-400'}`} />
              התאמת לקוחות
            </button>
          </div>
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
              <PropertiesToClientsTab searchTerm={searchTerm} />
            ) : (
              <ClientsToPropertiesTab searchTerm={searchTerm} />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 