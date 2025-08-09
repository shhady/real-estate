'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateAudioFile, extractAudioMetadata } from '../../utils/audioProcessing';

// Display helpers (Hebrew labels only for UI)
const getIntentLabel = (intent) => {
  switch (intent) {
    case 'buyer':
      return 'קונה';
    case 'seller':
      return 'מוכר';
    case 'both':
      return 'קונה/מוכר';
    case 'unknown':
    default:
      return 'לא ידוע';
  }
};

const TAB_LABELS = {
  Transcription: 'תמלול',
  Summary: 'סיכום',
  'Property Details': 'פרטי הנכס',
  'Follow-ups': 'מעקבים',
  Issues: 'בעיות',
};

export default function CallAnalysisPage() {
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioDuration, setAudioDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('Transcription');
  const [isMounted, setIsMounted] = useState(false);
  const [calls, setCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Fix for hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    fetchCalls();
  }, []);

  // Fetch user's call history
  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/calls');
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      }
    } catch (err) {
      console.error('Error fetching calls:', err);
    } finally {
      setLoadingCalls(false);
    }
  };

  // Note: Call saving is now handled automatically in the /api/call-analysis route
  // This function is kept for potential future use but is no longer called

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.success) {
      setError(validation.error);
      setAudioFile(null);
      setAudioFileName('');
      setAudioDuration(null);
      return;
    }

    setAudioFile(file);
    setAudioFileName(file.name);
    setError(null);

    try {
      const metadata = await extractAudioMetadata(file);
      setAudioDuration(metadata.formattedDuration);
    } catch (err) {
      console.error('Metadata extraction error:', err);
      setAudioDuration(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !phoneNumber.trim() || !audioFile) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('clientName', clientName);
      formData.append('phoneNumber', phoneNumber);
      formData.append('audioFile', audioFile);

      const response = await fetch('/api/call-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze call.');
      }

      const data = await response.json();
      setResult(data);
      
      // Show client management success message if client was created/linked
      if (data.clientId) {
        console.log(`✅ Client automatically ${data.clientName ? 'created/updated' : 'linked'}: ${data.clientName || phoneNumber}`);
      }
      
      // Call is now automatically saved in the analysis route
      // Refresh calls list to show the new call
      fetchCalls();
      
    } catch (err) {
      console.error('Call analysis error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setClientName('');
    setPhoneNumber('');
    setAudioFile(null);
    setAudioFileName('');
    setAudioDuration(null);
    setError(null);
    setResult(null);
    setActiveTab('Transcription');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate summary for display
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Render property details section
  const renderPropertyDetails = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">כוונה</h4>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                result.intent === 'buyer'
                  ? 'bg-green-100 text-green-800'
                  : result.intent === 'seller'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {getIntentLabel(result.intent)}
            </span>
          </div>

          {result.location && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מיקום</h4>
              <p className="text-gray-900">{result.location}</p>
            </div>
          )}

          {result.propertyType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">סוג נכס</h4>
              <p className="text-gray-900 capitalize">{result.propertyType}</p>
            </div>
          )}

          {result.rooms && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">חדרים</h4>
              <p className="text-gray-900">{result.rooms}</p>
            </div>
          )}

          {result.area && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">שטח</h4>
              <p className="text-gray-900">{result.area} מ"ר</p>
            </div>
          )}

          {result.price && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מחיר</h4>
              <p className="text-gray-900">₪ {result.price.toLocaleString('he-IL')}</p>
            </div>
          )}

          {result.condition && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מצב</h4>
              <p className="text-gray-900 capitalize">{result.condition}</p>
            </div>
          )}

          {result.floor !== null && result.floor !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">קומה</h4>
              <p className="text-gray-900">{result.floor}</p>
            </div>
          )}

          {result.parking !== null && result.parking !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">חניה</h4>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  result.parking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.parking ? 'כן' : 'לא'}
              </span>
            </div>
          )}

          {result.balcony !== null && result.balcony !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">מרפסת</h4>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  result.balcony ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.balcony ? 'כן' : 'לא'}
              </span>
            </div>
          )}
        </div>

        {result.propertyNotes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">הערות על הנכס</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{result.propertyNotes}</p>
          </div>
        )}
      </div>
    );
  };

  // If not mounted yet, show a simplified loading state to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ניתוח שיחה</h1>
            <p className="text-lg text-gray-600">העלה הקלטת שיחה לקבלת ניתוח חכם</p>
          </header>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-center py-20">
              <div className="animate-pulse">טוען...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניתוח שיחה</h1>
          <p className="text-lg text-gray-600">העלה הקלטת שיחה לקבלת תובנות חכמות עם זיהוי שפה אוטומטי</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Name */}
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                    שם לקוח מלא *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="הכנס את שם הלקוח"
                    disabled={isLoading}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    מספר טלפון *
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="הכנס את מספר הטלפון של הלקוח"
                    disabled={isLoading}
                  />
                </div>

                {/* Audio Upload */}
                <div>
                  <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-1">
                    הקלטת שיחה (MP3, WAV, M4A) *
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-2 text-sm bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 text-center">
                        <div className="flex justify-center items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {audioFileName || 'בחר קובץ אודיו'}
                        </div>
                      </div>
                      <input
                        type="file"
                        id="audioFile"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="audio/mpeg,audio/wav,audio/mp4,audio/m4a,audio/x-m4a"
                        ref={fileInputRef}
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                  {audioDuration && (
                    <div className="mt-2 text-sm text-gray-600">משך: {audioDuration}</div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    פורמטים נתמכים: MP3, WAV, M4A. גודל קובץ מקסימלי: 15MB. כולל זיהוי שפה אוטומטי.
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !clientName.trim() || !phoneNumber.trim() || !audioFile}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      מעבד את האודיו...
                    </div>
                  ) : (
                    'נתח שיחה'
                  )}
                </button>
              </form>
            ) : (
              /* Results section */
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  ✅ ניתוח השיחה הושלם בהצלחה!
                </div>

                <div className="space-y-2 text-gray-900">
                  <p>
                    <strong>לקוח:</strong> {clientName}
                  </p>
                  <p>
                    <strong>טלפון:</strong> {phoneNumber}
                  </p>
                  {audioDuration && (
                    <p>
                      <strong>משך שיחה:</strong> {audioDuration}
                    </p>
                  )}
                  {result.clientId && (
                    <p>
                      <strong>סטטוס לקוח:</strong>
                      <span className="text-green-600 font-medium">
                        {result.clientName ? ' ✅ נוצר/עודכן אוטומטית' : ' ✅ קושר ללקוח קיים'}
                      </span>
                      <Link href={`/dashboard/clients/${result.clientId}`} className="text-blue-600 hover:text-blue-800 text-sm mr-2">
                        (צפה בפרופיל לקוח)
                      </Link>
                    </p>
                  )}
                </div>

                <button onClick={handleReset} className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  נתח שיחה נוספת
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-lg shadow-md">
              {/* Tab navigation */}
              <div className="flex border-b border-gray-200">
                {Object.keys(TAB_LABELS).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'Transcription' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">תמלול משופר</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{result.transcription}</pre>
                    </div>
                  </div>
                )}

                {activeTab === 'Summary' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">סיכום השיחה</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{result.summary}</p>
                    </div>

                    {result.positives && result.positives.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-green-700 mb-2">נקודות חיוביות</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {result.positives.map((positive, index) => (
                            <li key={index}>{positive}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Property Details' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">מידע על הנכס</h3>
                    {renderPropertyDetails()}
                  </div>
                )}

                {activeTab === 'Follow-ups' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">המלצות למעקב</h3>
                    {result.followUps && result.followUps.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {result.followUps.map((followUp, index) => (
                          <li key={index} className="bg-blue-50 p-3 rounded-lg">
                            {followUp}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">לא זוהו המלצות מעקב ספציפיות.</p>
                    )}
                  </div>
                )}

                {activeTab === 'Issues' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">תחומים לשיפור</h3>
                    {result.issues && result.issues.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {result.issues.map((issue, index) => (
                          <li key={index} className="bg-red-50 p-3 rounded-lg text-red-800">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">לא זוהו בעיות.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call History Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ניתוחי שיחות אחרונים</h3>

              {loadingCalls ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : calls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין עדיין ניתוחי שיחות. העלה את ההקלטה הראשונה שלך למעלה!</p>
              ) : (
                <>
                  {/* Mobile layout */}
                  <div className="md:hidden space-y-4">
                    {calls.map((call) => (
                      <div key={call._id} className="p-4 border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 text-base">{call.clientId?.clientName || 'לקוח לא ידוע'}</h4>
                              {call.intent && call.intent !== 'unknown' && (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  call.intent === 'buyer'
                                    ? 'bg-green-100 text-green-800'
                                    : call.intent === 'seller'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {getIntentLabel(call.intent)}
                                </span>
                              )}
                            </div>
                            {call.location && (
                              <div className="mt-1 text-xs text-gray-600">📍 {call.location}</div>
                            )}
                          </div>
                          <div className="text-left text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(call.createdAt)}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">{call.clientId?.phoneNumber || 'אין מספר טלפון'}</div>
                        {call.summary && (
                          <p className="mt-2 text-sm text-gray-800">{truncateText(call.summary, 140)}</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {call.propertyType && (
                            <span className="inline-block px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">{call.propertyType}</span>
                          )}
                          {call.rooms && (
                            <span className="inline-block px-2 py-1 rounded text-xs bg-green-50 text-green-700">{call.rooms} חדרים</span>
                          )}
                          {call.price && (
                            <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700">₪ {call.price.toLocaleString('he-IL')}</span>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {call.clientId && (
                            <button
                              onClick={() => router.push(`/dashboard/clients/${call.clientId._id}`)}
                              className="w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              👤 פרטי לקוח
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/dashboard/call-analysis/${call._id}`)}
                            className="w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            📞 כנס  לשיחה
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop layout (improved) */}
                  <div className="hidden md:block">
                    <div className="space-y-4">
                      {calls.map((call) => (
                        <div
                          key={call._id}
                          className="p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-6">
                            {/* Left content */}
                            <div className="flex-1">
                              {/* Title row */}
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {call.clientId?.clientName || 'לקוח לא ידוע'}
                                </h4>
                                {call.intent && call.intent !== 'unknown' && (
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      call.intent === 'buyer'
                                        ? 'bg-green-100 text-green-800'
                                        : call.intent === 'seller'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {getIntentLabel(call.intent)}
                                  </span>
                                )}
                                {call.location && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    📍 {call.location}
                                  </span>
                                )}
                              </div>

                              {/* Sub meta */}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span>{call.clientId?.phoneNumber || 'אין מספר טלפון'}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{formatDate(call.createdAt)}</span>
                                {call.audioDuration && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">🎵 {call.audioDuration}</span>
                                  </>
                                )}
                              </div>

                              {/* Summary */}
                              {call.summary && (
                                <p className="text-sm text-gray-800 mb-2">
                                  {truncateText(call.summary, 180)}
                                </p>
                              )}

                              {/* Badges row */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                {call.propertyType && (
                                  <span className="inline-block px-2.5 py-1 rounded text-xs bg-blue-50 text-blue-700">
                                    {call.propertyType}
                                  </span>
                                )}
                                {call.rooms && (
                                  <span className="inline-block px-2.5 py-1 rounded text-xs bg-green-50 text-green-700">
                                    {call.rooms} חדרים
                                  </span>
                                )}
                                {call.price && (
                                  <span className="inline-block px-2.5 py-1 rounded text-xs bg-yellow-50 text-yellow-700">
                                    ₪ {call.price.toLocaleString('he-IL')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-2">
                              {call.clientId && (
                                <button
                                  onClick={() => router.push(`/dashboard/clients/${call.clientId._id}`)}
                                  className="px-3 py-2 rounded-md text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                  👤 צפה בלקוח
                                </button>
                              )}
                              <button
                                onClick={() => router.push(`/dashboard/call-analysis/${call._id}`)}
                                className="px-3 py-2 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                              >
                                📞 כנס לשיחה
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
