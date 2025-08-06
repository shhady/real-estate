'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEdit, FaTrash, FaPlus, FaUsers, FaTimes, FaEye } from 'react-icons/fa';
import Button from '../../components/ui/Button';

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [matchingAgents, setMatchingAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/properties/my-properties', {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק נכס זה?')) return;

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete property');
      
      // Remove property from state
      setProperties(prev => prev.filter(property => property._id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('Failed to delete property. Please try again.');
    }
  };

  const handleCollaborationToggle = async (propertyId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      // Update property collaboration status
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collaboration: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update collaboration status');
      
      // Update local state
      setProperties(prev => prev.map(prop => 
        prop._id === propertyId ? { ...prop, collaboration: newStatus } : prop
      ));

      // If enabling collaboration, show matching agents
      if (newStatus) {
        const property = properties.find(p => p._id === propertyId);
        setSelectedProperty(property);
        await fetchMatchingAgents(property);
        setShowAgentsModal(true);
      }
    } catch (error) {
      console.error('Error updating collaboration status:', error);
      setError('Failed to update collaboration status. Please try again.');
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
      
      // Set all agents as selected by default
      const defaultSelection = {};
      agents.forEach(agent => {
        defaultSelection[agent._id] = true;
      });
      setSelectedAgents(defaultSelection);
    } catch (error) {
      console.error('Error fetching matching agents:', error);
      setMatchingAgents([]);
      setSelectedAgents({});
    } finally {
      setAgentsLoading(false);
    }
  };

  const AgentsModal = () => {
    if (!showAgentsModal || !selectedProperty) return null;

    const sendEmails = async () => {
      const selectedAgentIds = Object.keys(selectedAgents).filter(id => selectedAgents[id]);
      
      if (selectedAgentIds.length === 0) {
        setError('אנא בחר לפחות סוכן אחד לשליחת מייל');
        return;
      }

      setAgentsLoading(true);
      try {
        const response = await fetch('/api/send-collaboration-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyId: selectedProperty._id,
            selectedAgentIds: selectedAgentIds
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          alert(`מיילים נשלחו בהצלחה ל-${selectedAgentIds.length} סוכנים!`);
          setShowAgentsModal(false);
        } else {
          setError('שגיאה בשליחת המיילים');
        }
      } catch (error) {
        console.error('Error sending emails:', error);
        setError('שגיאה בשליחת המיילים');
      } finally {
        setAgentsLoading(false);
      }
    };

    const toggleAllAgents = (selectAll) => {
      const newSelection = {};
      matchingAgents.forEach(agent => {
        newSelection[agent._id] = selectAll;
      });
      setSelectedAgents(newSelection);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4" dir="rtl">
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                סוכנים עם לקוחות מתאימים - {selectedProperty.title}
              </h2>
              <button
                onClick={() => setShowAgentsModal(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-black">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">פרטי הנכס:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">סטטוס:</span>
                  <span className="font-medium">{selectedProperty.status === 'For Sale' ? 'למכירה' : 'להשכרה'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">מחיר:</span>
                  <span className="font-medium">₪{selectedProperty.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">מיקום:</span>
                  <span className="font-medium">{selectedProperty.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">חדרים:</span>
                  <span className="font-medium">{selectedProperty.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">שטח:</span>
                  <span className="font-medium">{selectedProperty.area} מ"ר</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">סוג:</span>
                  <span className="font-medium">
                    {selectedProperty.propertyType === 'house' && 'בית פרטי'}
                    {selectedProperty.propertyType === 'apartment' && 'דירה'}
                    {selectedProperty.propertyType === 'condo' && 'קונדו'}
                    {selectedProperty.propertyType === 'villa' && 'וילה'}
                    {selectedProperty.propertyType === 'land' && 'קרקע'}
                    {selectedProperty.propertyType === 'commercial' && 'מסחרי'}
                    {selectedProperty.propertyType === 'office' && 'משרד'}
                    {selectedProperty.propertyType === 'warehouse' && 'מחסן'}
                    {selectedProperty.propertyType === 'other' && 'אחר'}
                    {selectedProperty.propertyType === 'cottage' && 'קוטג׳'}
                    {selectedProperty.propertyType === 'duplex' && 'דופלקס'}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {agentsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 text-lg">מחפש סוכנים מתאימים...</p>
              </div>
            ) : matchingAgents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">לא נמצאו סוכנים עם לקוחות מתאימים (מינימום 5/6 התאמה)</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    נמצאו {matchingAgents.length} סוכנים עם לקוחות מתאימים
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAllAgents(true)}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      בחר הכל
                    </button>
                    <button
                      onClick={() => toggleAllAgents(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      בטל הכל
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {matchingAgents.map((agent) => (
                    <div key={agent._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`agent-${agent._id}`}
                          checked={selectedAgents[agent._id] || false}
                          onChange={() => {
                            setSelectedAgents(prev => ({
                              ...prev,
                              [agent._id]: !prev[agent._id]
                            }));
                          }}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ml-4"
                        />
                        <label htmlFor={`agent-${agent._id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-1">{agent.fullName}</h4>
                              <p className="text-gray-600 mb-1">{agent.agencyName}</p>
                              <p className="text-sm text-gray-500 mb-1">{agent.email} • {agent.phone}</p>
                            </div>
                            <div className="ml-4">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {agent.matchingClients.length} לקוחות מתאימים
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAgentsModal(false)}
                    className="w-full sm:w-auto"
                  >
                    סגור
                  </Button>
                  
                  <button
                    onClick={sendEmails}
                    disabled={agentsLoading || Object.values(selectedAgents).filter(Boolean).length === 0}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {agentsLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        שולח...
                      </div>
                    ) : (
                      `שלח מייל ל-${Object.values(selectedAgents).filter(Boolean).length} סוכנים`
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">ניהול נכסים</h1>
        <Link href="/dashboard/properties/upload">
          <Button variant="primary">
            <FaPlus className="ml-2" />
            הוסף נכס חדש
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">טוען נכסים...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">לא נמצאו נכסים</p>
          <Link href="/dashboard/properties/upload">
            <Button variant="primary" className="mt-4">
              הוסף נכס חדש
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תמונה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      כותרת
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מחיר
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מיקום
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מוכן לשיתוף פעולה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עריכה / מחיקה
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative h-16 w-16">
                          <Image
                            src={property.images[0]?.secure_url || '/placeholder-property.jpg'}
                            alt={property.title}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₪{property.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.status === 'For Sale' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {property.status === 'For Sale' ? 'למכירה' : 'להשכרה'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCollaborationToggle(property._id, property.collaboration)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            property.collaboration ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              property.collaboration ? 'translate-x-0' : '-translate-x-5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-4 space-x-3">
                          <Link
                            href={`/properties/${property._id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaEye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/dashboard/properties/${property._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={property.images[0]?.secure_url || '/placeholder-property.jpg'}
                      alt={property.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {property.location}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          ₪{property.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.status === 'For Sale' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {property.status === 'For Sale' ? 'למכירה' : 'להשכרה'}
                        </span>
                        <button
                          onClick={() => handleCollaborationToggle(property._id, property.collaboration)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            property.collaboration ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              property.collaboration ? 'translate-x-0' : '-translate-x-5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end items-center space-x-4 space-x-reverse mt-4">
                      <Link
                        href={`/properties/${property._id}`}
                        className="text-green-600 hover:text-green-900 p-2"
                      >
                        <FaEye className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/dashboard/properties/${property._id}/edit`}
                        className="text-blue-600 hover:text-blue-900 p-2"
                      >
                        <FaEdit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="text-red-600 hover:text-red-900 p-2"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <AgentsModal />
    </div>
  );
} 