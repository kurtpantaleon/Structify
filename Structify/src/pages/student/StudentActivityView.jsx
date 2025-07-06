import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessonProgress } from '../../context/lessonProgressContext';
import StudentCodingActivityView from './StudentCodingActivityView';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { CheckCircle, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
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
  
  // Additional state for enhanced UX
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
          const initialAnsweredState = {};
          activityData.questions.forEach((question, index) => {
            if (question.type === 'multiple-choice') {
              initialAnswers[index] = null;
              initialAnsweredState[index] = false;
            } else if (question.type === 'short-answer') {
              initialAnswers[index] = '';
              initialAnsweredState[index] = false;
            }
          });
          setAnswers(initialAnswers);
          setAnsweredQuestions(initialAnsweredState);
          
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
    
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };
  
  const handleTextChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
    
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionIndex]: value && value.trim() !== ''
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
    setSubmitting(true);
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
      setSubmitting(false);
      setShowConfetti(true);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting activity:", err);
      setError("Failed to submit activity results");
      setSubmitting(false);
    }
  };
  
  const resetActivity = () => {
    // Reset answers
    const initialAnswers = {};
    const initialAnsweredState = {};
    activity.questions.forEach((question, index) => {
      if (question.type === 'multiple-choice') {
        initialAnswers[index] = null;
        initialAnsweredState[index] = false;
      } else if (question.type === 'short-answer') {
        initialAnswers[index] = '';
        initialAnsweredState[index] = false;
      }
    });
    setAnswers(initialAnswers);
    setAnsweredQuestions(initialAnsweredState);
    
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
    <div className="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] min-h-screen text-white">
      <Header />
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="mb-4">
          <Loader2 size={48} className="animate-spin text-blue-400" />
        </div>
        <div className="text-xl font-medium">Loading your activity</div>
        <div className="text-sm text-blue-300 mt-2">Just a moment...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] min-h-screen text-white">
      <Header />
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle size={56} className="text-red-400 mb-4" />
        <div className="text-2xl font-semibold text-red-400">{error}</div>
        <p className="text-gray-400 mt-2 mb-6 max-w-md text-center">
          We couldn't load this activity. Please try again or contact your instructor.
        </p>
        <button 
          className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 rounded-lg transition-colors focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#1F274D] focus:outline-none"
          onClick={navigateBack}
        >
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (showResults) {
    return (
      <div className="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] min-h-screen text-white p-4 flex flex-col items-center justify-center">
        {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={score > 80 ? 200 : 50} />}
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            {score === 100 ? '🎉 Perfect Score! 🎉' : 
             score >= 80 ? '🎊 Activity Complete! 🎊' : 
             '📝 Activity Submitted'}
          </h1>
          
          <div className="bg-[#141a35] p-8 rounded-2xl w-full max-w-md shadow-2xl border border-blue-500/30">
            <h2 className="text-2xl font-bold text-center mb-2">{activity.title}</h2>
            <p className="text-center text-sm mb-6 opacity-70">{activity.description}</p>
            
            <div className="my-8 flex flex-col items-center">
              <div className="relative">
                <svg className="w-36 h-36">
                  <circle 
                    cx="70" 
                    cy="70" 
                    r="60" 
                    fill="none" 
                    stroke="#1F274D" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="70" 
                    cy="70" 
                    r="60" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 60} 
                    strokeDashoffset={2 * Math.PI * 60 * (1 - score / 100)} 
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-5xl font-bold">{score}%</div>
                </div>
              </div>
              
              {previousScore !== null && previousScore !== score && (
                <div className="mt-4 bg-blue-600/40 px-4 py-2 rounded-lg">
                  <p className="text-sm">
                    {score > previousScore 
                      ? `🚀 +${score - previousScore}% improvement!` 
                      : `Previous: ${previousScore}%`}
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-center mb-8 text-lg font-medium">
              {score === 100 ? '🏆 Outstanding! Perfect score!' : 
               score >= 80 ? '👍 Great job! Keep it up!' : 
               score >= 60 ? '👌 Good effort! Room to improve.' : 
               '💪 Keep practicing! You\'ll get there.'}
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                className="py-3 px-4 bg-gradient-to-r bg-blue-600 hover:from-blue-700 hover:to-blue-400 rounded-lg font-medium transition-all focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#1F274D] focus:outline-none" 
                onClick={navigateBack}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestion = activity.questions[currentQuestionIndex];
  const totalQuestions = activity.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] min-h-screen text-white">
      <Header />
      
      <div className="p-4 sticky top-0 z-10 bg-[#141a35] shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl md:text-2xl font-bold">{activity.title}</h1>
            <div className="text-sm bg-[#2a3566] px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1} of {activity.questions.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-center mt-3">
            <div className="flex space-x-2">
              {activity.questions.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141a35] focus:ring-blue-300 ${
                    currentQuestionIndex === index 
                      ? 'bg-blue-400 w-5' 
                      : answeredQuestions[index] 
                        ? 'bg-blue-500/80' 
                        : 'bg-gray-600/50'
                  }`}
                  aria-label={`Go to question ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-[#141a35] rounded-xl border border-blue-500/30 p-6 mb-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-blue-900/30 relative group overflow-hidden">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 z-0" />
          <div className="relative z-10">
            <div className="flex items-start mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 mt-1 shadow-md">
                <span className="font-bold">{currentQuestionIndex + 1}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-medium leading-snug text-white">{currentQuestion.question}</h2>
            </div>
            
            {currentQuestion.points > 0 && (
              <div className="mb-6 flex items-center">
                <div className="px-3 py-1 bg-[#2a3566] border border-blue-500/30 rounded-full text-sm font-medium text-blue-200">
                  {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                </div>
              </div>
            )}
            
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-3 mt-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-lg font-medium border text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141a35] focus:ring-blue-400 ${
                      answers[currentQuestionIndex] === option 
                        ? 'bg-[#2a3566] border-blue-500/50 shadow-lg' 
                        : 'bg-[#1a2142] border-[#2a3566]/80 hover:bg-[#232d5d] hover:border-blue-500/30'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        answers[currentQuestionIndex] === option 
                          ? 'bg-white border-white'
                          : 'border-blue-400'
                      } mr-3 flex-shrink-0`}>
                        {answers[currentQuestionIndex] === option && 
                          <CheckCircle size={20} className="text-[#1F274D]" />
                        }
                      </div>
                      <span>{option}</span>
                    </div>
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
                  className="w-full bg-[#1a2142] border border-blue-500/30 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-lg transition-all"
                  placeholder="Type your answer here..."
                />
                <p className="text-xs text-blue-300 mt-2 ml-1">
                  Enter your short answer response
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F274D] ${
              currentQuestionIndex > 0
                ? 'bg-[#2a3566] hover:bg-[#323f7d] focus:ring-blue-400' 
                : 'bg-gray-800/60 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft size={20} className="mr-2" />
            Previous
          </button>
          
          <button
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F274D] ${
              isCurrentQuestionAnswered()
                ? 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 focus:ring-blue-400' 
                : 'bg-[#2a3566]/60 text-blue-300 cursor-not-allowed'
            }`}
            onClick={handleNextQuestion}
            disabled={!isCurrentQuestionAnswered() || submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Submitting...
              </>
            ) : currentQuestionIndex < activity.questions.length - 1 ? (
              <>
                Next
                <ChevronRight size={20} className="ml-2" />
              </>
            ) : (
              <>
                Submit
                <ArrowRight size={20} className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityView;
