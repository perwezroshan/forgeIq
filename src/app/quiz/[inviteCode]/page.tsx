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
  marks: number;
}

interface QuizData {
  id: string;
  inviteCode: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  quiz: {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    creator: {
      username: string;
    };
  };
}

export default function ParticipantQuizPage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const resolvedParams = use(params);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
    fetchQuizData();
  }, [resolvedParams.inviteCode]);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'PARTICIPANT') {
          setIsAuthenticated(true);
        } else {
          setError('Only participants can take quizzes. Please sign in with a participant account.');
        }
      } catch (err) {
        setError('Invalid authentication. Please sign in again.');
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    if (quizData && quizData.isActive && quizData.endTime) {
      const endTime = new Date(quizData.endTime).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);

        if (remaining === 0) {
          handleSubmitQuiz();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [quizData]);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/quiz/${resolvedParams.inviteCode}`);
      if (response.ok) {
        const data = await response.json();
        setQuizData(data.quizRoom);
      } else {
        setError('Quiz not found or not available');
      }
    } catch (err) {
      setError('Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to submit quiz');
        return;
      }

      const response = await fetch(`/api/quiz/${resolvedParams.inviteCode}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('An error occurred while submitting the quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="mb-4">You need to sign in as a participant to take this quiz.</p>
            {quizData && (
              <div className="bg-white rounded-lg p-3 text-gray-900 mb-4">
                <h3 className="font-semibold">{quizData.quiz.title}</h3>
                <p className="text-sm text-gray-600">{quizData.quiz.description}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/signin?redirect=/quiz/${resolvedParams.inviteCode}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push(`/signup?redirect=/quiz/${resolvedParams.inviteCode}`)}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium"
            >
              Create Account
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Quiz not found'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!quizData.isActive) {
    const now = new Date();
    const startTime = new Date(quizData.startTime);
    const endTime = new Date(quizData.endTime);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{quizData.quiz.title}</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {now < startTime ? (
              <>
                <p className="font-semibold">Quiz hasn't started yet</p>
                <p className="text-sm">Starts: {startTime.toLocaleString()}</p>
              </>
            ) : (
              <>
                <p className="font-semibold">Quiz has ended</p>
                <p className="text-sm">Ended: {endTime.toLocaleString()}</p>
              </>
            )}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">Quiz Submitted Successfully!</h2>
            <p className="mb-4">Thank you for taking the quiz. Here are your results:</p>

            {result && (
              <div className="bg-white rounded-lg p-4 text-gray-900">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Score:</span>
                    <div className="text-2xl font-bold text-green-600">
                      {result.score}/{result.totalMarks}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Percentage:</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {result.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData.quiz.questions[currentQuestion];
  const totalQuestions = quizData.quiz.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quizData.quiz.title}</h1>
              <p className="text-gray-600">{quizData.quiz.description}</p>
              <p className="text-sm text-gray-500 mt-1">Created by: {quizData.quiz.creator.username}</p>
            </div>
            <div className="text-right">
              {timeLeft !== null && (
                <div className="text-lg font-semibold text-red-600">
                  Time Left: {formatTime(timeLeft)}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {totalQuestions}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Question {currentQuestion + 1}
            </h2>
            <p className="text-gray-700 text-lg mb-4">{currentQ.text}</p>
            <div className="text-sm text-gray-500 mb-6">
              Marks: {currentQ.marks}
            </div>
          </div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <label
                key={option}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQ.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium mr-3">{option}.</span>
                <span>{currentQ[`option${option}` as keyof Question]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestion === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
