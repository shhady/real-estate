'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEdit, FaTrash, FaPlus, FaUsers, FaTimes } from 'react-icons/fa';
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
      setMatchingAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching matching agents:', error);
      setMatchingAgents([]);
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
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-4" dir="rtl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              סוכנים עם לקוחות מתאימים - {selectedProperty.title}
            </h2>
            <button
              onClick={() => setShowAgentsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">פרטי הנכס:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>סטטוס: {selectedProperty.status === 'For Sale' ? 'למכירה' : 'להשכרה'}</div>
              <div>מחיר: ₪{selectedProperty.price.toLocaleString()}</div>
              <div>מיקום: {selectedProperty.location}</div>
              <div>חדרים: {selectedProperty.bedrooms}</div>
              <div>שטח: {selectedProperty.area} מ"ר</div>
              <div>סוג: {selectedProperty.propertyType}</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {agentsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">מחפש סוכנים מתאימים...</p>
            </div>
          ) : matchingAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              לא נמצאו סוכנים עם לקוחות מתאימים (מינימום 5/6 התאמה)
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  נמצאו {matchingAgents.length} סוכנים עם לקוחות מתאימים
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllAgents(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    בחר הכל
                  </button>
                  <button
                    onClick={() => toggleAllAgents(false)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    בטל הכל
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {matchingAgents.map((agent) => (
                  <div key={agent._id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-3"
                      />
                      <label htmlFor={`agent-${agent._id}`} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{agent.fullName}</h4>
                            <p className="text-gray-600">{agent.agencyName}</p>
                            <p className="text-sm text-gray-500">{agent.email} • {agent.phone}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {agent.matchingClients.length} לקוחות מתאימים
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={sendEmails}
                  disabled={agentsLoading || Object.values(selectedAgents).filter(Boolean).length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {agentsLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      שולח...
                    </div>
                  ) : (
                    `שלח מייל ל-${Object.values(selectedAgents).filter(Boolean).length} סוכנים`
                  )}
                </button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowAgentsModal(false)}
                >
                  סגור
                </Button>
              </div>
            </>
          )}
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          property.collaboration ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            property.collaboration ? 'translate-x-0' : 'translate-x-5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-4 space-x-3">
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
      )}
      <AgentsModal />
    </div>
  );
} 