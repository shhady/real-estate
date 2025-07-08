'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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

  // Save call to database
  const saveCall = async (analysisResult) => {
    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName,
          phoneNumber,
          transcription: analysisResult.transcription,
          summary: analysisResult.summary,
          followUps: analysisResult.followUps,
          positives: analysisResult.positives,
          issues: analysisResult.issues,
          audioFileName,
          audioDuration
        }),
      });

      if (response.ok) {
        // Refresh calls list
        fetchCalls();
      }
    } catch (err) {
      console.error('Error saving call:', err);
    }
  };

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
      
      // Save to database
      await saveCall(data);
      
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
          <p className="text-lg text-gray-600">Upload a call recording to get AI-powered insights</p>
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
                  <div className="flex items-center space-x-4">
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
                    Accepted formats: MP3, WAV, M4A. Maximum file size: 15MB.
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Loading modal - only show when processing */}
                {isLoading && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                      <div className="text-center">
                        <svg className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Your Call</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">Please Don't Close This Window</h4>
                          <p className="text-sm text-yellow-700">
                            Call analysis can take several minutes. Closing your browser will interrupt the process.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isLoading}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Analyze Call'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-green-800">Analysis complete!</h3>
                  <p className="text-sm text-green-700">The call has been successfully analyzed and saved.</p>
                </div>

                {/* Tabs */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex bg-gray-100 text-gray-600 text-sm font-medium">
                    {['Transcription', 'Summary', 'Follow-ups', 'Positives', 'Issues'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2 ${activeTab === tab ? 'bg-white text-blue-600' : ''}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-white">
                    {activeTab === 'Transcription' && <pre className="whitespace-pre-wrap text-gray-700">{result.transcription}</pre>}
                    {activeTab === 'Summary' && <p className="text-gray-700">{result.summary}</p>}
                    {activeTab === 'Follow-ups' && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {result.followUps?.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    )}
                    {activeTab === 'Positives' && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {result.positives?.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    )}
                    {activeTab === 'Issues' && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {result.issues?.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Analyze Another Call
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Call History Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Call History</h2>
            
            {loadingCalls ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No calls analyzed yet.</p>
                <p className="text-sm mt-2">Upload your first call recording to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {calls.map((call) => (
                  <div key={call._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{call.clientName}</h3>
                        <p className="text-sm text-gray-600">{call.phoneNumber}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(call.date)}</p>
                      </div>
                      <Link
                        href={`/dashboard/call-analysis/${call._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        {truncateText(call.summary)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Upload a call recording to get AI-powered insights and save them to your database.</p>
          <p className="mt-1">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
