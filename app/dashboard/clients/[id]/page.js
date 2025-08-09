'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEdit, FaTrash, FaPhone, FaEnvelope, FaWhatsapp, FaPlus, FaEye } from 'react-icons/fa';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          throw new Error('Failed to fetch client');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClient();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('האם אתה בטוח שאתה רוצה למחוק את הלקוח? פעולה זו לא ניתנת לביטול.')) return;

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/clients');
      } else {
        throw new Error('Failed to delete client');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      prospect: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800'
    };
    const labels = {
      active: 'פעיל',
      prospect: 'פרוספקט',
      inactive: 'לא פעיל',
      closed: 'סגור'
    };
    return { color: colors[status] || colors.prospect, label: labels[status] || status };
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    const labels = {
      high: 'גבוהה',
      medium: 'בינונית', 
      low: 'נמוכה'
    };
    return { color: colors[priority] || colors.medium, label: labels[priority] || priority };
  };

  // Get intent badge
  const getIntentBadge = (intent) => {
    const colors = {
      buyer: 'bg-green-100 text-green-800',
      seller: 'bg-blue-100 text-blue-800',
      renter: 'bg-purple-100 text-purple-800',
      landlord: 'bg-orange-100 text-orange-800',
      both: 'bg-purple-100 text-purple-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      buyer: 'קונה',
      seller: 'מוכר',
      renter: 'שוכר',
      landlord: 'משכיר',
      both: 'קונה ומוכר',
      unknown: 'לא ידוע'
    };
    return { color: colors[intent] || colors.unknown, label: labels[intent] || intent };
  };

  // Translate property type to Hebrew
  const translatePropertyType = (type) => {
    const translations = {
      apartment: 'דירה',
      house: 'בית',
      villa: 'וילה',
      penthouse: 'פנטהאוז',
      duplex: 'דופלקס',
      triplex: 'טריפלקס',
      studio: 'סטודיו',
      loft: 'לופט',
      cottage: 'צימר',
      townhouse: 'בית עירוני',
      land: 'קרקע',
      commercial: 'מסחרי',
      office: 'משרד',
      warehouse: 'מחסן',
      garage: 'חניה/מוסך',
      basement: 'מרתף',
      roof: 'גג',
      garden: 'גינה',
      balcony: 'מרפסת',
      terrace: 'טרסה'
    };
    return translations[type] || type;
  };

  // Translate property condition to Hebrew
  const translatePropertyCondition = (condition) => {
    const translations = {
      'new': 'חדש',
      'excellent': 'מצוין',
      'good': 'טוב',
      'fair': 'בסדר',
      'needs renovation': 'זקוק לשיפוץ',
      'under construction': 'בבנייה',
      'old': 'ישן',
      'renovated': 'משופץ',
      'partially renovated': 'משופץ חלקית'
    };
    return translations[condition] || condition;
  };

  // Format price range
  const formatPriceRange = (maxPrice) => {
    if (maxPrice) {
      return `מקסימום ${formatCurrency(maxPrice)}`;
    }
    return 'לא צוין';
  };

  // Format area range
  const formatAreaRange = (minArea) => {
    if (minArea) {
      return `${minArea} מ"ר`;
    } else if (minArea) {
      return `מינימום ${minArea} מ"ר`;
    }
    return 'לא צוין';
  };

  // Format rooms range
  const formatRoomsRange = (minRooms) => {
    if (minRooms) {
      return `מינימום ${minRooms} חדרים`;
    }
    return 'לא צוין';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Client not found'}
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(client.status);
  const priorityBadge = getPriorityBadge(client.priority);
  const intentBadge = getIntentBadge(client.intent);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/clients"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                 חזור לרשימת הלקוחות
              </Link>
              <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{client.clientName}</h1>
              {client.preApproval && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">יש אישור עקרוני </span>
                        )}
                        </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                  דחיפות {priorityBadge.label}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${intentBadge.color}`}>
                  {intentBadge.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/clients/${client._id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit className="w-4 h-4" />
                עריכה
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTrash className="w-4 h-4" />
                מחיקה
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">פרטי קשר</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaPhone className="w-4 h-4 text-gray-400 ml-3" />
                  <span className="text-gray-900">{client.phoneNumber}</span>
                </div>
                {client.email && (
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 text-gray-400 ml-3" />
                    <span className="text-gray-900">{client.email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 ml-3">אמצעי קשר מועדף:</span>
                  <span className="text-gray-900">
                    {client.preferredContact === 'phone' ? 'טלפון' :
                     client.preferredContact === 'whatsapp' ? 'וואטסאפ' : 'אימייל'}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Preferences */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">העדפות נכס</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.preferredLocation && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">איזור מועדף:</span>
                    <p className="text-gray-900">{client.preferredLocation}</p>
                  </div>
                )}
                {client.preferredPropertyType && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">סוג נכס:</span>
                    <p className="text-gray-900">{translatePropertyType(client.preferredPropertyType)}</p>
                  </div>
                )}
                {client.minRooms && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">מספר חדרים:</span>
                    <p className="text-gray-900">{formatRoomsRange(client.minRooms)}</p>
                  </div>
                )}
                {client.minArea && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">שטח מינימום:</span>
                    <p className="text-gray-900">{formatAreaRange(client.minArea)}</p>
                  </div>
                )}
                  {client.maxPrice && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">תקציב מקסימום:</span>
                    <p className="text-gray-900">{formatPriceRange(client.maxPrice)}</p>
                  </div>
                )}
                {client.preferredCondition && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">מצב נכס:</span>
                    <p className="text-gray-900">{translatePropertyCondition(client.preferredCondition)}</p>
                  </div>
                )}
                {(client.needsParking || client.needsBalcony || !client.preApproval) && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-500">דרישות נוספות:</span>
                    <div className="flex gap-4 mt-1">
                      {client.needsParking && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">חניה</span>
                      )}
                      {client.needsBalcony && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">מרפסת</span>
                      )}
                      {!client.preApproval && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">צריך אישור עקרוני</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">הערות</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

 {/* Related Calls */}
 <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">שיחות קשורות</h3>
                <Link
                  href="/dashboard/call-analysis"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  הוסף שיחה חדשה
                </Link>
              </div>
              
              {client.calls && client.calls.length > 0 ? (
                <div className="space-y-3">
                  {client.calls.slice(0, 5).map((call) => (
                    <Link 
                      key={call._id} 
                      href={`/dashboard/call-analysis/${call._id}`}
                      className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              📞 {formatDate(call.createdAt)}
                            </p>
                            {call.intent && call.intent !== 'unknown' && (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                call.intent === 'buyer' ? 'bg-green-100 text-green-800' :
                                call.intent === 'seller' ? 'bg-blue-100 text-blue-800' :
                                call.intent === 'both' ? 'bg-purple-100 text-purple-800' :
                                call.intent === 'renter' ? 'bg-purple-100 text-purple-800' :
                                call.intent === 'landlord' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {call.intent === 'buyer' ? 'קונה' :
                                 call.intent === 'seller' ? 'מוכר' :
                                 call.intent === 'both' ? 'קונה ומוכר' :
                                 call.intent === 'renter' ? 'שוכר' :
                                 call.intent === 'landlord' ? 'משכיר' : call.intent}
                              </span>
                            )}
                          </div>
                          {call.summary && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {call.summary.length > 200 ? `${call.summary.substring(0, 200)}...` : call.summary}
                            </p>
                          )}
                          {call.location && (
                            <p className="text-xs text-gray-500 mt-1">📍 {call.location}</p>
                          )}
                          {call.price && (
                            <p className="text-xs text-gray-500 mt-1">💰 {formatCurrency(call.price)}</p>
                          )}
                        </div>
                        <div className="text-right ml-3">
                          <FaEye className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {client.calls.length > 5 && (
                    <Link
                      href="/dashboard/call-analysis"
                      className="block text-center text-blue-600 hover:text-blue-800 text-sm mt-3"
                    >
                      צפה בכל השיחות ({client.calls.length})
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">אין שיחות מתועדות עדיין</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">סטטיסטיקות</h3>
              <div className="space-y-3 text-gray-900">
                <div className="flex justify-between">
                  <span className="text-gray-500">שיחות:</span>
                  <span className="font-medium">{client.calls?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">נוצר:</span>
                  <span className="font-medium">{formatDate(client.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">עדכון אחרון:</span>
                  <span className="font-medium">{formatDate(client.updatedAt)}</span>
                </div>
                {client.lastCallDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">שיחה אחרונה:</span>
                    <span className="font-medium">{formatDate(client.lastCallDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">מקור הליד:</span>
                  <span className="font-medium">
                    {client.source === 'call' ? 'שיחה' :
                     client.source === 'website' ? 'אתר' :
                     client.source === 'referral' ? 'הפניה' :
                     client.source === 'advertising' ? 'פרסום' :
                     client.source === 'social_media' ? 'רשתות חברתיות' : 'אחר'}
                  </span>
                </div>
              </div>
            </div>

           

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">תגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 