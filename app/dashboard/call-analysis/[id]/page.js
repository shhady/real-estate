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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Error: {error}
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
            Call not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/dashboard/call-analysis"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
             חזור לניתוח שיחות
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Call Analysis Details</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {call.clientName}</p>
                  <p><span className="font-medium">Phone:</span> {call.phoneNumber}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(call.date)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recording Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">File:</span> {call.audioFileName || 'N/A'}</p>
                  <p><span className="font-medium">Duration:</span> {call.audioDuration || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['Transcription', 'Summary', 'Follow-ups', 'Positives', 'Issues'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'Transcription' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Full Transcription</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
                    {call.transcription}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'Summary' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Call Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{call.summary}</p>
                </div>
              </div>
            )}

            {activeTab === 'Follow-ups' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Follow-up Actions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {call.followUps && call.followUps.length > 0 ? (
                    <ul className="space-y-2">
                      {call.followUps.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No follow-up actions identified</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Positives' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Positive Aspects</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {call.positives && call.positives.length > 0 ? (
                    <ul className="space-y-2">
                      {call.positives.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No positive aspects identified</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Issues' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Issues & Concerns</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {call.issues && call.issues.length > 0 ? (
                    <ul className="space-y-2">
                      {call.issues.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-600 mr-2">⚠</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No issues identified</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 