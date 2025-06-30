'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found in localStorage');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setTokenInfo({
        token: token.substring(0, 50) + '...',
        payload: payload,
        fullToken: token
      });
    } catch (err) {
      setError('Failed to decode token: ' + err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Authentication</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {tokenInfo && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Token Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Token (truncated):</h3>
                <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  {tokenInfo.token}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Decoded Payload:</h3>
                <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(tokenInfo.payload, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">User Info:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>ID:</strong> {tokenInfo.payload.id || tokenInfo.payload.userId || 'Not found'}</li>
                  <li><strong>Username:</strong> {tokenInfo.payload.username || 'Not found'}</li>
                  <li><strong>Email:</strong> {tokenInfo.payload.email || 'Not found'}</li>
                  <li><strong>Role:</strong> {tokenInfo.payload.role || 'Not found'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-x-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/signin';
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Clear Token & Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
