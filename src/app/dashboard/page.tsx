'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      console.log('Dashboard: Checking authentication...'); // Debug log
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('Dashboard: No token found, redirecting to signin'); // Debug log
        setIsLoading(false);
        router.push('/signin');
        return;
      }

      console.log('Dashboard: Token found, decoding...'); // Debug log

      // In a real app, you'd verify the token with your backend
      // For now, we'll just decode it client-side (not secure for production)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Dashboard: Token payload:', payload); // Debug log

        const userData = {
          id: payload.id || payload.userId,
          username: payload.username || payload.email?.split('@')[0] || 'User',
          email: payload.email,
          role: payload.role
        };

        console.log('Dashboard: Setting user data:', userData); // Debug log
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard: Token decode error:', error); // Debug log
        localStorage.removeItem('token');
        setIsLoading(false);
        router.push('/signin');
      }
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Participant Dashboard'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {user.role === 'ADMIN' ? 'Quizzes Created' : 'Quizzes Taken'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {user.role === 'ADMIN' ? 'Total Participants' : 'Average Score'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.role === 'ADMIN' ? '0' : 'N/A'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {user.role === 'ADMIN' ? 'Active Quizzes' : 'Time Spent'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.role === 'ADMIN' ? '0' : '0 min'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific content */}
          {user.role === 'ADMIN' ? (
            <AdminDashboard />
          ) : (
            <ParticipantDashboard />
          )}
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/admin/quiz-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Admin Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin/create-quiz'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Quiz</span>
            </button>
            <button
              onClick={() => window.location.href = '/admin/my-quizzes'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>My Quizzes</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Quiz Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Quiz Activity
          </h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
            </div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quiz activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first quiz to see analytics here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.slice(0, 5).map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{quiz.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{quiz.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        <span>{quiz.participantCount} participants</span>
                        <span>{quiz.questionCount} questions</span>
                        {quiz.participantCount > 0 && (
                          <span>Avg: {quiz.averagePercentage}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </div>
                      {quiz.inviteCode && (
                        <button
                          onClick={() => window.location.href = `/admin/quiz/${quiz.inviteCode}`}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Manage
                        </button>
                      )}
                    </div>
                  </div>

                  {quiz.recentSubmissions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-2">Recent Submissions:</p>
                      <div className="space-y-1">
                        {quiz.recentSubmissions.slice(0, 3).map((submission: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-gray-600">
                            <span>{submission.participantName}</span>
                            <span>{submission.score}/{submission.totalMarks} ({submission.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Participant Dashboard Component
function ParticipantDashboard() {
  const [quizLink, setQuizLink] = useState('');
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/participant/quiz-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizHistory(data.quizHistory);
      }
    } catch (err) {
      console.error('Failed to fetch quiz history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quizLink.trim()) {
      setError('Please enter a quiz link');
      return;
    }

    // Extract invite code from various link formats
    let inviteCode = '';

    try {
      // Handle full URLs like http://localhost:3000/quiz/ABC123
      if (quizLink.includes('/quiz/')) {
        inviteCode = quizLink.split('/quiz/')[1].split('?')[0].split('#')[0];
      }
      // Handle direct invite codes like ABC123
      else if (quizLink.match(/^[A-Za-z0-9]{6,12}$/)) {
        inviteCode = quizLink.trim();
      }
      else {
        setError('Invalid quiz link format. Please enter a valid quiz link or invite code.');
        return;
      }

      if (inviteCode) {
        router.push(`/quiz/${inviteCode}`);
      } else {
        setError('Could not extract invite code from the link.');
      }
    } catch (err) {
      setError('Invalid quiz link format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Quiz Link Input */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Join a Quiz
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter a quiz link or invite code to access a quiz
          </p>
          <form onSubmit={handleQuizLinkSubmit} className="space-y-4">
            <div>
              <label htmlFor="quizLink" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Link or Invite Code
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="quizLink"
                  value={quizLink}
                  onChange={(e) => setQuizLink(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ABC123 or http://localhost:3000/quiz/ABC123"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Join Quiz
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> You can paste the full quiz URL or just the invite code (e.g., ABC123)
            </p>
          </div>
        </div>
      </div>

      {/* Recent Quiz Results */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Quiz Results
          </h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading your quiz history...</p>
            </div>
          ) : quizHistory.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quiz results yet</h3>
              <p className="mt-1 text-sm text-gray-500">Take your first quiz to see results here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizHistory.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{result.quiz.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{result.quiz.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Created by: {result.quiz.creator}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {result.score}/{result.totalMarks}
                      </div>
                      <div className={`text-sm font-medium ${
                        result.percentage >= 80 ? 'text-green-600' :
                        result.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {result.percentage}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          result.percentage >= 80 ? 'bg-green-500' :
                          result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={() => router.push(`/quiz/${result.inviteCode}`)}
                      className="ml-4 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      View Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
