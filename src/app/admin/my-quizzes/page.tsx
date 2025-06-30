'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  quizRooms: Array<{
    id: string;
    inviteCode: string;
    startTime: string;
    endTime: string;
  }>;
  _count: {
    questions: number;
  };
}

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/quiz/my-quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      setError('An error occurred while fetching quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuizStatus = (quiz: Quiz) => {
    if (quiz._count.questions === 0) return { status: 'Draft', color: 'gray' };
    
    const room = quiz.quizRooms[0];
    if (!room) return { status: 'No Room', color: 'red' };
    
    const now = new Date();
    const startTime = new Date(room.startTime);
    const endTime = new Date(room.endTime);
    
    if (now < startTime) return { status: 'Scheduled', color: 'blue' };
    if (now >= startTime && now <= endTime) return { status: 'Active', color: 'green' };
    return { status: 'Ended', color: 'red' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
            <p className="mt-2 text-gray-600">Manage and view all your created quizzes</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/create-quiz"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Quiz
            </Link>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first quiz.</p>
            <Link
              href="/admin/create-quiz"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              const room = quiz.quizRooms[0];
              
              return (
                <div key={quiz.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{quiz.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span className="font-medium">{quiz._count.questions}</span>
                      </div>
                      {room && (
                        <>
                          <div className="flex justify-between">
                            <span>Invite Code:</span>
                            <span className="font-mono font-medium">{room.inviteCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Start:</span>
                            <span>{new Date(room.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>End:</span>
                            <span>{new Date(room.endTime).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {room && (
                        <>
                          <Link
                            href={`/admin/quiz/${room.inviteCode}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium text-center transition-colors"
                          >
                            Manage
                          </Link>
                          <Link
                            href={`/quiz/${room.inviteCode}`}
                            target="_blank"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium text-center transition-colors"
                          >
                            Preview
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
