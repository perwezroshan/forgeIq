'use client';

import { useEffect, useState } from 'react';

export default function TestDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser(payload);
      } catch (err) {
        setError('Failed to decode token');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Dashboard</h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
            <p><strong>Has Token:</strong> {token ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
          </div>

          {user && (
            <div>
              <h2 className="text-xl font-semibold mb-2">User Data</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-x-4">
            <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Go to Real Dashboard
            </a>
            <a href="/signin" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
