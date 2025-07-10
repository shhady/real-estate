'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CallDetailPage({ params }) {
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Transcription');
  const router = useRouter();
  
  // Unwrap params Promise
  const { id } = use(params);

  useEffect(() => {
    fetchCall();
  }, [id]);

  const fetchCall = async () => {
    try {
      const response = await fetch(`/api/calls/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch call');
      }
      const data = await response.json();
      setCall(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render property details section
  const renderPropertyDetails = () => {
    if (!call) return null;

    const hasPropertyData = call.intent || call.location || call.propertyType || 
                           call.rooms || call.area || call.price || call.condition ||
                           call.floor !== null || call.parking !== null || 
                           call.balcony !== null || call.propertyNotes || call.preApproval !== null;

    if (!hasPropertyData) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>לא נמצא מידע על נכס בשיחה זו.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {call.intent && call.intent !== 'unknown' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">כוונה</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                call.intent === 'buyer' ? 'bg-green-100 text-green-800' :
                call.intent === 'seller' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {call.intent === 'buyer' ? 'קונה' :
                 call.intent === 'seller' ? 'מוכר' :
                 call.intent === 'both' ? 'קונה ומוכר' : call.intent}
              </span>
            </div>
          )}
          
          {call.location && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מיקום</h4>
              <p className="text-gray-900">{call.location}</p>
            </div>
          )}
          
          {call.propertyType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">סוג נכס</h4>
              <p className="text-gray-900 capitalize">{call.propertyType}</p>
            </div>
          )}
          
          {call.rooms && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">חדרים</h4>
              <p className="text-gray-900">{call.rooms}</p>
            </div>
          )}
          
          {call.area && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">שטח</h4>
              <p className="text-gray-900">{call.area} מ"ר</p>
            </div>
          )}
          
          {call.price && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מחיר</h4>
              <p className="text-gray-900">{call.price.toLocaleString()} ₪</p>
            </div>
          )}
          
          {call.condition && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מצב</h4>
              <p className="text-gray-900 capitalize">{call.condition}</p>
            </div>
          )}
          
          {call.floor !== null && call.floor !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">קומה</h4>
              <p className="text-gray-900">{call.floor}</p>
            </div>
          )}
          
          {call.parking !== null && call.parking !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">חניה</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                call.parking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {call.parking ? 'כן' : 'לא'}
              </span>
            </div>
          )}
          
          {call.balcony !== null && call.balcony !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מרפסת</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                call.balcony ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {call.balcony ? 'כן' : 'לא'}
              </span>
            </div>
          )}

          {call.preApproval !== null && call.preApproval !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">אישור עקרוני</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                call.preApproval ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {call.preApproval ? 'יש אישור עקרוני' : 'אין אישור עקרוני'}
              </span>
            </div>
          )}
        </div>
        
        {call.propertyNotes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">הערות נכס</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{call.propertyNotes}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            שגיאה: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            שיחה לא נמצאה.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
              <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{call.clientName}</h1>
                {call.intent && call.intent !== 'unknown' && (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    call.intent === 'buyer' ? 'bg-green-100 text-green-800' :
                    call.intent === 'seller' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {call.intent === 'buyer' ? 'קונה' :
                     call.intent === 'seller' ? 'מוכר' :
                     call.intent === 'both' ? 'קונה ומוכר' : call.intent}
                  </span>
                )}
                {call.location && (
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    📍 {call.location}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📞 {call.phoneNumber}</span>
                <span>📅 {formatDate(call.createdAt)}</span>
                {call.audioDuration && <span>⏱️ {call.audioDuration}</span>}
                {call.audioFileName && <span>🎵 {call.audioFileName}</span>}
              </div>
            </div>
            <Link
              href="/dashboard/clients"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              ← חזור לדף לקוחות
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { key: 'Transcription', label: 'תמליל' },
              { key: 'Summary', label: 'סיכום' },
              { key: 'Property Details', label: 'פרטי נכס' },
              { key: 'Follow-ups', label: 'מעקבים' },
              { key: 'Positives', label: 'נקודות חיוביות' },
              { key: 'Negatives', label: 'נקודות שליליות' },
              { key: 'Improvement Points', label: 'נקודות לשיפור' },
              { key: 'Issues', label: 'בעיות' }
            ].map((tab) => (
                <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 py-3 px-6 text-sm font-medium text-center border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                {tab.label}
                </button>
              ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'Transcription' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">תמליל שיחה</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {call.transcription}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'Summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">סיכום שיחה</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{call.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Property Details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">מידע נכס</h3>
                {renderPropertyDetails()}
              </div>
            )}

            {activeTab === 'Follow-ups' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">מעקבים מומלצים</h3>
                {call.followUps && call.followUps.length > 0 ? (
                  <div className="space-y-3">
                    {call.followUps.map((followUp, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <p className="text-blue-800">{followUp}</p>
                      </div>
                      ))}
                  </div>
                  ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>לא זוהו מעקבים ספציפיים לשיחה זו.</p>
                </div>
                )}
              </div>
            )}

            {activeTab === 'Positives' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">נקודות חיוביות</h3>
                {call.positives && call.positives.length > 0 ? (
                  <div className="space-y-3">
                    {call.positives.map((positive, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <p className="text-green-800">{positive}</p>
                      </div>
                      ))}
                  </div>
                  ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>לא זוהו נקודות חיוביות לשיחה זו.</p>
                </div>
                )}
              </div>
            )}

            {activeTab === 'Negatives' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">נקודות שליליות</h3>
                {call.negatives && call.negatives.length > 0 ? (
                  <div className="space-y-3">
                    {call.negatives.map((negative, index) => (
                      <div key={index} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                        <p className="text-red-800">{negative}</p>
                      </div>
                      ))}
                  </div>
                  ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>לא זוהו נקודות שליליות לשיחה זו.</p>
                </div>
                )}
              </div>
            )}

            {activeTab === 'Improvement Points' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">נקודות לשיפור</h3>
                {call.improvementPoints && call.improvementPoints.length > 0 ? (
                  <div className="space-y-3">
                    {call.improvementPoints.map((point, index) => (
                      <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">{point}</p>
                      </div>
                      ))}
                  </div>
                  ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>לא זוהו נקודות לשיפור לשיחה זו.</p>
                </div>
                )}
              </div>
            )}

            {activeTab === 'Issues' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">תחומים לשיפור</h3>
                  {call.issues && call.issues.length > 0 ? (
                  <div className="space-y-3">
                    {call.issues.map((issue, index) => (
                      <div key={index} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                        <p className="text-red-800">{issue}</p>
                      </div>
                      ))}
                  </div>
                  ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>לא זוהו בעיות בשיחה זו.</p>
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 