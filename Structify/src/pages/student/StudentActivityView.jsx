import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessonProgress } from '../../context/lessonProgressContext';
import StudentCodingActivityView from './StudentCodingActivityView';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import Header from '../../components/Header';

const StudentActivityView = () => {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { currentUser } = useAuth();
  const { markActivityComplete, activityScores } = useLessonProgress();
  
  // Activity state
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Activity interaction state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      try {
        const activityDoc = await getDoc(doc(db, 'activities', activityId));
        if (activityDoc.exists()) {
          const activityData = activityDoc.data();
          
          // Check if this is a coding activity, if so redirect to coding view
          if (activityData.type === 'code') {
            navigate(`/student/coding-activity/${activityId}`);
            return;
          }
          
          setActivity({
            ...activityData,
            id: activityId
          });
          
          // Check for previous attempts
          if (activityScores && activityScores[`activity_${activityId}`] !== undefined) {
            setPreviousScore(activityScores[`activity_${activityId}`]);
          }
          
          // Initialize answers object
          const initialAnswers = {};
          activityData.questions.forEach((question, index) => {
            if (question.type === 'multiple-choice') {
              initialAnswers[index] = null;
            } else if (question.type === 'short-answer') {
              initialAnswers[index] = '';
            }
          });
          setAnswers(initialAnswers);
          
          setIsLoading(false);
        } else {
          setError("Activity not found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError("Failed to load activity");
        setIsLoading(false);
      }
    };
    
    fetchActivity();
  }, [activityId, activityScores, navigate]);
  
  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };
  
  const handleTextChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < activity.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    activity.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      totalPoints += question.points;
      
      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'short-answer') {
        // For short answer, check if it matches any accepted answer
        const normalizedUserAnswer = userAnswer.toLowerCase().trim();
        const acceptedAnswers = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.map(a => a.toLowerCase().trim())
          : [question.correctAnswer.toLowerCase().trim()];
        
        if (acceptedAnswers.includes(normalizedUserAnswer)) {
          earnedPoints += question.points;
        }
      }
    });
    
    const finalScorePercentage = Math.round((earnedPoints / totalPoints) * 100);
    submitActivityResults(finalScorePercentage);
  };
  
  const submitActivityResults = async (finalScore) => {
    try {
      // Save to user's progress
      await markActivityComplete(`activity_${activityId}`, finalScore);
      
      // Create formatted answers for submission
      const formattedAnswers = activity.questions.map((question, index) => ({
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect: question.type === 'multiple-choice' 
          ? answers[index] === question.correctAnswer
          : Array.isArray(question.correctAnswer)
            ? question.correctAnswer.map(a => a.toLowerCase().trim()).includes(answers[index].toLowerCase().trim())
            : question.correctAnswer.toLowerCase().trim() === answers[index].toLowerCase().trim()
      }));
      
      // Add to activity_submissions collection
      await addDoc(collection(db, 'activity_submissions'), {
        activityId,
        activityTitle: activity.title,
        activityType: activity.type,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email,
        score: finalScore,
        answers: formattedAnswers,
        submittedAt: serverTimestamp(),
        instructorId: activity.instructorId,
        section: currentUser.section
      });
      
      setScore(finalScore);
      setShowConfetti(true);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting activity:", err);
      setError("Failed to submit activity results");
    }
  };
  
  const resetActivity = () => {
    // Reset answers
    const initialAnswers = {};
    activity.questions.forEach((question, index) => {
      if (question.type === 'multiple-choice') {
        initialAnswers[index] = null;
      } else if (question.type === 'short-answer') {
        initialAnswers[index] = '';
      }
    });
    setAnswers(initialAnswers);
    
    // Reset other state
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setShowConfetti(false);
  };
  
  const navigateBack = () => {
    navigate(-1);
  };
  
  const isCurrentQuestionAnswered = () => {
    const currentAnswer = answers[currentQuestionIndex];
    
    if (activity.questions[currentQuestionIndex].type === 'multiple-choice') {
      return currentAnswer !== null;
    } else {
      return currentAnswer && currentAnswer.trim() !== '';
    }
  };
  
  if (isLoading) return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-950 min-h-screen text-white">
      <Header />
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-xl">Loading activity...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-950 min-h-screen text-white">
      <Header />
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <div className="text-xl font-semibold text-red-400">{error}</div>
        <button 
          className="mt-6 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={navigateBack}
        >
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (showResults) {
    return (
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 min-h-screen text-white p-4 flex flex-col items-center justify-center">
        {showConfetti && <Confetti />}
        <h1 className="text-4xl font-bold mb-6 animate-bounce">🎉 Activity Complete 🎉</h1>
        <div className="bg-indigo-700 p-8 rounded-2xl w-full max-w-md shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2">{activity.title}</h2>
          <p className="text-center text-sm mb-4 opacity-70">{activity.description}</p>
          
          <div className="my-8 flex flex-col items-center">
            <div className="text-6xl font-bold mb-2">{score}%</div>
            <p className="text-lg">Your Score</p>
            {previousScore && previousScore !== score && (
              <p className="text-sm mt-2 text-yellow-300">Previous Score: {previousScore}%</p>
            )}
          </div>
          
          <p className="text-center mb-6 italic">
            {score === 100 ? '🏆 Perfect! Excellent work!' : 
             score >= 80 ? '👍 Great job!' : 
             score >= 60 ? '👌 Good effort!' : 
             '💪 Keep practicing!'}
          </p>
          
          <div className="flex flex-col space-y-4">
            <button 
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all" 
              onClick={resetActivity}
            >
              Try Again
            </button>
            <button 
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all" 
              onClick={navigateBack}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestion = activity.questions[currentQuestionIndex];
  
  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-950 min-h-screen text-white">
      <Header />
      
      <div className="p-4 sticky top-0 z-10 bg-gradient-to-r from-purple-900 to-blue-950">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{activity.title}</h1>
            <div className="text-sm">
              Question {currentQuestionIndex + 1} of {activity.questions.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / activity.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">
        {activity.type === 'form' && (
          <div className="bg-indigo-900/60 rounded-xl border border-purple-700 p-6 mb-8 shadow-lg">
            <div className="flex items-start mb-4">
              <div className="bg-purple-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                {currentQuestionIndex + 1}
              </div>
              <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
            </div>
            
            {currentQuestion.points > 1 && (
              <div className="mb-4 text-sm text-purple-300">
                {currentQuestion.points} points
              </div>
            )}
            
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-3 mt-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-lg font-medium border transition-all ${
                      answers[currentQuestionIndex] === option 
                        ? 'bg-purple-600 border-purple-300 shadow-lg' 
                        : 'bg-indigo-800/60 border-purple-600 hover:bg-indigo-800/80'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'short-answer' && (
              <div className="mt-6">
                <input
                  type="text"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleTextChange(currentQuestionIndex, e.target.value)}
                  className="w-full bg-indigo-800/60 border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your answer here..."
                />
              </div>
            )}
          </div>
        )}
        
        {activity.type === 'code' && (
          <div className="bg-indigo-900/60 rounded-xl border border-purple-700 p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-center">
              <HelpCircle className="w-10 h-10 text-purple-400 mr-3" />
              <p className="text-lg">Code activities are accessed from the specific activity page.</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentQuestionIndex > 0
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-gray-800/60 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          <button
            className={`px-10 py-3 rounded-xl font-bold transition-all ${
              isCurrentQuestionAnswered()
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-indigo-800/60 text-indigo-300 cursor-not-allowed'
            }`}
            onClick={handleNextQuestion}
            disabled={!isCurrentQuestionAnswered()}
          >
            {currentQuestionIndex < activity.questions.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityView;
