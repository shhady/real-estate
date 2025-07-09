'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateAudioFile, extractAudioMetadata } from '../../utils/audioProcessing';

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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <h4 className="font-semibold text-gray-700 mb-2">Intent</h4>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              result.intent === 'buyer' ? 'bg-green-100 text-green-800' :
              result.intent === 'seller' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {result.intent || 'Unknown'}
            </span>
          </div>
          
          {result.location && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Location</h4>
              <p className="text-gray-900">{result.location}</p>
            </div>
          )}
          
          {result.propertyType && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Property Type</h4>
              <p className="text-gray-900 capitalize">{result.propertyType}</p>
            </div>
          )}
          
          {result.rooms && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Rooms</h4>
              <p className="text-gray-900">{result.rooms}</p>
            </div>
          )}
          
          {result.area && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Area</h4>
              <p className="text-gray-900">{result.area} sqm</p>
            </div>
          )}
          
          {result.price && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Price</h4>
              <p className="text-gray-900">{result.price.toLocaleString()} ILS</p>
            </div>
          )}
          
          {result.condition && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Condition</h4>
              <p className="text-gray-900 capitalize">{result.condition}</p>
            </div>
          )}
          
          {result.floor !== null && result.floor !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Floor</h4>
              <p className="text-gray-900">{result.floor}</p>
            </div>
          )}
          
          {result.parking !== null && result.parking !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Parking</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                result.parking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.parking ? 'Yes' : 'No'}
              </span>
            </div>
          )}
          
          {result.balcony !== null && result.balcony !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Balcony</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                result.balcony ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.balcony ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>
        
        {result.propertyNotes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Property Notes</h4>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Analysis</h1>
            <p className="text-lg text-gray-600">Upload a call recording to get AI-powered insights</p>
          </header>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-center py-20">
              <div className="animate-pulse">Loading...</div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Analysis</h1>
          <p className="text-lg text-gray-600">Upload a call recording to get AI-powered insights with automatic language detection</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Name */}
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client's full name"
                    disabled={isLoading}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client's phone number"
                    disabled={isLoading}
                  />
                </div>

                {/* Audio Upload */}
                <div>
                  <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Call Recording (MP3, WAV, M4A) *
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-2 text-sm bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 text-center">
                        <div className="flex justify-center items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {audioFileName || 'Choose Audio File'}
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
                    <div className="mt-2 text-sm text-gray-600">
                      Duration: {audioDuration}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Accepted formats: MP3, WAV, M4A. Maximum file size: 15MB. Automatic language detection included.
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
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
                      Processing Audio...
                    </div>
                  ) : (
                    'Analyze Call'
                  )}
                </button>
              </form>
            ) : (
              /* Results section */
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  ✅ Call analysis completed successfully!
                </div>
                
                <div className="space-y-2 text-gray-900">
                  <p><strong>לקוח:</strong> {clientName}</p>
                  <p><strong>טלפון:</strong> {phoneNumber}</p>
                  {audioDuration && <p><strong>משך שיחה:</strong> {audioDuration}</p>}
                  {result.clientId && (
                    <p><strong>סטטוס לקוח:</strong> 
                      <span className="text-green-600 font-medium">
                        {result.clientName ? ' ✅ נוצר/עודכן אוטומטית' : ' ✅ קושר ללקוח קיים'}
                      </span>
                      <Link 
                        href={`/dashboard/clients/${result.clientId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm mr-2"
                      >
                        (צפה בפרופיל לקוח)
                      </Link>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Analyze Another Call
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-lg shadow-md">
              {/* Tab navigation */}
              <div className="flex border-b border-gray-200">
                {['Transcription', 'Summary', 'Property Details', 'Follow-ups', 'Issues'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'Transcription' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Enhanced Transcription</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {result.transcription}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'Summary' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Call Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{result.summary}</p>
                    </div>
                    
                    {result.positives && result.positives.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-green-700 mb-2">Positive Aspects</h4>
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
                    <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
                    {renderPropertyDetails()}
                  </div>
                )}

                {activeTab === 'Follow-ups' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Follow-ups</h3>
                    {result.followUps && result.followUps.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {result.followUps.map((followUp, index) => (
                          <li key={index} className="bg-blue-50 p-3 rounded-lg">{followUp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No specific follow-ups identified.</p>
                    )}
                  </div>
                )}

                {activeTab === 'Issues' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                    {result.issues && result.issues.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {result.issues.map((issue, index) => (
                          <li key={index} className="bg-red-50 p-3 rounded-lg text-red-800">{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No issues identified.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call History Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Call Analysis</h3>
              
              {loadingCalls ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : calls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No calls analyzed yet. Upload your first recording above!</p>
              ) : (
                <div className="space-y-4">
                  {calls.map((call) => (
                    <div 
                      key={call._id} 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {call.clientId?.clientName || 'Unknown Client'}
                              </h4>
                              {call.clientId && (
                                <button
                                  onClick={() => router.push(`/dashboard/clients/${call.clientId._id}`)}
                                  className="text-blue-600 hover:text-blue-800 text-xs hover:underline"
                                >
                                  👤 View Client
                                </button>
                              )}
                            </div>
                            {call.intent && call.intent !== 'unknown' && (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                call.intent === 'buyer' ? 'bg-green-100 text-green-800' :
                                call.intent === 'seller' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {call.intent}
                              </span>
                            )}
                            {call.location && (
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                📍 {call.location}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {call.clientId?.phoneNumber || 'No phone number'}
                          </p>
                          <p className="text-sm text-gray-700">{truncateText(call.summary)}</p>
                          {call.propertyType && (
                            <div className="mt-2 flex gap-2">
                              <span className="inline-block px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                                {call.propertyType}
                              </span>
                              {call.rooms && (
                                <span className="inline-block px-2 py-1 rounded text-xs bg-green-50 text-green-700">
                                  {call.rooms} rooms
                                </span>
                              )}
                              {call.price && (
                                <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700">
                                  {call.price.toLocaleString()} ILS
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500 flex flex-col gap-2">
                          <div>{formatDate(call.createdAt)}</div>
                          {call.audioDuration && (
                            <div className="text-xs">🎵 {call.audioDuration}</div>
                          )}
                          <button
                            onClick={() => router.push(`/dashboard/call-analysis/${call._id}`)}
                            className="text-blue-600 hover:text-blue-800 text-xs hover:underline"
                          >
                            📞 View Call
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
