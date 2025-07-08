'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import MediaUploader from '../../../components/MediaUploader';

export default function UploadPage() {
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [cloudinaryStatus, setCloudinaryStatus] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleUploadComplete = (data) => {
    setUploadSuccess(data);
  };

  useEffect(() => {
    // Check Cloudinary connection status
    const checkCloudinaryStatus = async () => {
      try {
        const response = await axios.get('/api/cloudinary/test');
        setCloudinaryStatus(response.data);
      } catch (error) {
        console.error('Error checking Cloudinary status:', error);
        setCloudinaryStatus({ 
          success: false, 
          error: error.response?.data?.error || error.message 
        });
      }
    };

    checkCloudinaryStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Social Media Upload
          </h1>
          <p className="mt-2 text-gray-600">
            Upload images and videos for your social media content
          </p>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            {showDebug ? 'Hide' : 'Show'} Connection Info
          </button>
        </header>

        {showDebug && cloudinaryStatus && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono overflow-auto">
            <h3 className="text-black text-sm font-medium mb-2">Cloudinary Connection Status</h3>
            <pre className="text-black">{JSON.stringify(cloudinaryStatus, null, 2)}</pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-md font-medium text-blue-800 mb-2">About Logo Overlay</h3>
            <p className="text-sm text-blue-700 mb-2">
              The logo overlay feature is configured to use your golden logo with the public ID "no-bg-golden-removebg-preview_l3tbtr" 
              from your Cloudinary account. When you check the logo overlay option, this logo will be applied to the bottom-right corner 
              of your uploads with enhanced size for better visibility.
            </p>
            <p className="text-xs text-blue-600">
              <strong>Note:</strong> The logo transformation must be included in the signature. If you're experiencing 401 errors, 
              please check the connection information to verify that your Cloudinary credentials are correct and the logo exists.
            </p>
          </div>
          
          <MediaUploader onUploadComplete={handleUploadComplete} />
        </div>
      </div>
    </div>
  );
} 