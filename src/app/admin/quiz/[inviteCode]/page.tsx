'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
}

export default function QuizManagePage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const resolvedParams = use(params);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [participantLink, setParticipantLink] = useState('');
  const [formData, setFormData] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A' as 'A' | 'B' | 'C' | 'D',
    marks: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchQuizInfo();
  }, [resolvedParams.inviteCode]);

  const fetchQuizInfo = async () => {
    try {
      const response = await fetch(`/api/quiz/${resolvedParams.inviteCode}`);
      if (response.ok) {
        const data = await response.json();
        setQuizInfo(data.quizRoom);
        setQuestions(data.quizRoom.quiz.questions || []);
        setParticipantLink(`${window.location.origin}/quiz/${resolvedParams.inviteCode}`);
      }
    } catch (err) {
      console.error('Failed to fetch quiz info:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'marks' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to add questions');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/quiz/${resolvedParams.inviteCode}/add-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Question added successfully!');
        setQuestions([...questions, data.question]);
        setFormData({
          text: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctOption: 'A',
          marks: 1
        });
        setShowAddForm(false);
      } else {
        setError(data.error || 'Failed to add question');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (questions.length === 0) {
      setError('Cannot submit quiz without questions');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to submit quiz');
        return;
      }

      const response = await fetch(`/api/quiz/${resolvedParams.inviteCode}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Quiz submitted successfully! Participants can now access it.');
        setParticipantLink(data.participantLink);
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Link copied to clipboard!');
    } catch (err) {
      setError('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quizInfo?.quiz?.title || 'Manage Quiz'}
            </h1>
            <p className="mt-1 text-gray-600">{quizInfo?.quiz?.description}</p>
            <p className="mt-2 text-gray-600">
              Invite Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{resolvedParams.inviteCode}</span>
            </p>
            {quizInfo && (
              <p className="mt-1 text-sm text-gray-500">
                {new Date(quizInfo.startTime).toLocaleString()} - {new Date(quizInfo.endTime).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {showAddForm ? 'Cancel' : 'Add Question'}
            </button>
            {questions.length > 0 && (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  id="text"
                  name="text"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your question"
                  value={formData.text}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="optionA" className="block text-sm font-medium text-gray-700 mb-2">
                    Option A
                  </label>
                  <input
                    type="text"
                    id="optionA"
                    name="optionA"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.optionA}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="optionB" className="block text-sm font-medium text-gray-700 mb-2">
                    Option B
                  </label>
                  <input
                    type="text"
                    id="optionB"
                    name="optionB"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.optionB}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="optionC" className="block text-sm font-medium text-gray-700 mb-2">
                    Option C
                  </label>
                  <input
                    type="text"
                    id="optionC"
                    name="optionC"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.optionC}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="optionD" className="block text-sm font-medium text-gray-700 mb-2">
                    Option D
                  </label>
                  <input
                    type="text"
                    id="optionD"
                    name="optionD"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.optionD}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="correctOption" className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    id="correctOption"
                    name="correctOption"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.correctOption}
                    onChange={handleChange}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    type="number"
                    id="marks"
                    name="marks"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.marks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'Add Question'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Participant Link Section */}
        {participantLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Share Quiz with Participants</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={participantLink}
                readOnly
                className="flex-1 px-3 py-2 border border-blue-300 rounded-md bg-white text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(participantLink)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => window.open(participantLink, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Preview
              </button>
            </div>
            <p className="mt-2 text-sm text-blue-700">
              Share this link with participants to let them take the quiz.
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Questions ({questions.length})</h2>
          </div>
          <div className="p-6">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                      <span className="text-sm text-gray-500">{question.marks} marks</span>
                    </div>
                    <p className="text-gray-700 mb-3">{question.text}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={`p-2 rounded ${question.correctOption === 'A' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        A. {question.optionA}
                      </div>
                      <div className={`p-2 rounded ${question.correctOption === 'B' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        B. {question.optionB}
                      </div>
                      <div className={`p-2 rounded ${question.correctOption === 'C' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        C. {question.optionC}
                      </div>
                      <div className={`p-2 rounded ${question.correctOption === 'D' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        D. {question.optionD}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
