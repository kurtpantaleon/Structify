import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessonProgress } from '../../context/lessonProgressContext';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, where, query, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import Header from '../../components/Header';

const StudentQuizView = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const { markActivityComplete, markQuizComplete, activityScores } = useLessonProgress();
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quiz interaction state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          const quizData = quizDoc.data();
          
          // If randomize questions is enabled, shuffle the questions
          let questions = [...quizData.questions];
          if (quizData.randomizeQuestions) {
            questions = shuffleArray(questions);
          }
          
          setQuiz({
            ...quizData,
            questions: questions,
            id: quizId
          });
          
          // Set timer
          if (quizData.timeLimit) {
            setTimeLeft(quizData.timeLimit * 60); // convert minutes to seconds
          }
          
          // Check for previous attempts
          if (activityScores && activityScores[`quiz_${quizId}`] !== undefined) {
            setPreviousScore(activityScores[`quiz_${quizId}`]);
          }
          
          setIsLoading(false);
        } else {
          setError("Quiz not found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz");
        setIsLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId, activityScores]);
  
  // Handle timer countdown
  useEffect(() => {
    if (!timeLeft || !quizStarted || showResults) return;
    
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleQuizTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [timeLeft, quizStarted, showResults]);
  
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
  };
  
  const handleQuizTimeout = () => {
    // Calculate score based on answered questions
    const finalScore = calculateFinalScore();
    submitQuizResults(finalScore);
  };
  
  const handleNextQuestion = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswer;
    
    if (currentQuestion.type === 'multiple-choice') {
      userAnswer = selectedAnswer;
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      if (isCorrect) {
        setScore(prevScore => prevScore + currentQuestion.points);
      }
    } else if (currentQuestion.type === 'short-answer') {
      userAnswer = textAnswer;
      // For short answer, we can check if it matches any of the accepted answers
      const normalizedUserAnswer = textAnswer.toLowerCase().trim();
      const acceptedAnswers = Array.isArray(currentQuestion.correctAnswer) 
        ? currentQuestion.correctAnswer.map(a => a.toLowerCase().trim())
        : [currentQuestion.correctAnswer.toLowerCase().trim()];
      
      isCorrect = acceptedAnswers.includes(normalizedUserAnswer);
      if (isCorrect) {
        setScore(prevScore => prevScore + currentQuestion.points);
      }
    }
    
    // Store user's answer
    setUserAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer,
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer
    }]);
    
    // Only show immediate feedback if enabled in quiz settings
    if (quiz.showResultsImmediately) {
      setAnswerFeedback(isCorrect);
      
      setTimeout(() => {
        moveToNextQuestionOrFinish();
      }, 1000);
    } else {
      // Otherwise, move immediately to the next question without showing feedback
      moveToNextQuestionOrFinish();
    }
  };
  
  const moveToNextQuestionOrFinish = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setAnswerFeedback(null);
    } else {
      // Quiz finished - calculate final score and submit results
      const finalScore = calculateFinalScore();
      submitQuizResults(finalScore);
    }
  };
  
  const calculateFinalScore = () => {
    // Calculate percentage based on points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    return Math.round((score / totalPoints) * 100);
  };
  
  const submitQuizResults = async (finalScore) => {
    try {
      // Save to user's progress
      await markActivityComplete(`quiz_${quizId}`, finalScore);
      await markQuizComplete(`quiz_${quizId}`);
      
      // Add to quiz_submissions collection
      await addDoc(collection(db, 'quiz_submissions'), {
        quizId,
        quizTitle: quiz.title,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email,
        score: finalScore,
        answers: userAnswers,
        submittedAt: serverTimestamp(),
        instructorId: quiz.instructorId,
        section: currentUser.section
      });
      
      setShowConfetti(true);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz results");
    }
  };
  
  const handleAnswerSelect = answer => setSelectedAnswer(answer);
  const handleTextChange = e => setTextAnswer(e.target.value);
  
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTextAnswer('');
    setScore(0);
    setUserAnswers([]);
    setShowResults(false);
    setAnswerFeedback(null);
    setShowConfetti(false);
    
    if (quiz && quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    
    setQuizStarted(false);
  };
  
  const navigateBack = () => {
    navigate(-1);
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <div className="mt-4 text-xl text-white">Loading quiz...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <div className="text-xl font-semibold text-red-400">{error}</div>
        <button 
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1F274D] focus:outline-none"
          onClick={navigateBack}
        >
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col">
        <Header />
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <h1 className="text-4xl text-white font-bold mb-6 animate-bounce">🎉 Quiz Results 🎉</h1>
          
          <div className="bg-[#141a35] p-8 rounded-xl w-full max-w-md shadow-xl border border-blue-500/30 relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 z-0" />
            
            <div className="relative z-10 text-white">
              <h2 className="text-2xl font-bold text-center mb-2 text-white">{quiz.title}</h2>
              <p className="text-center text-white mb-4 opacity-70">{quiz.description}</p>
              
              <div className="my-8 flex flex-col items-center">
                <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
                  {calculateFinalScore()}%
                </div>
                <p className="text-lg text-white">Your Score</p>
                {previousScore && previousScore !== calculateFinalScore() && (
                  <p className="text-white mt-2">Previous Score: <span className="text-yellow-300">{previousScore}%</span></p>
                )}
              </div>
              
              <p className="text-center mb-6 italic text-white">
                {calculateFinalScore() === 100 ? '🏆 Perfect! Excellent work!' : 
                calculateFinalScore() >= 80 ? '👍 Great job!' : 
                calculateFinalScore() >= 60 ? '👌 Good effort!' : 
                '💪 Keep practicing!'}
              </p>
              
              {/* Display summary instead of per-question results */}
              <div className="mb-6 bg-[#1a2142] rounded-lg p-4 border border-blue-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Total Questions:</span>
                  <span className="font-medium text-white">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Correct Answers:</span>
                  <span className="font-medium text-white">{userAnswers.filter(a => a.isCorrect).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Points Earned:</span>
                  <span className="font-medium text-white">{score} / {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <button 
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-lg font-medium transition-all text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#141a35] focus:outline-none" 
                  onClick={resetQuiz}
                >
                  Try Again
                </button>
                <button 
                  className="w-full py-3 border border-blue-500/30 rounded-lg font-medium transition-all hover:bg-[#1a2142] text-white" 
                  onClick={navigateBack}
                >
                  Back to Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col text-white">
        <Header />
        <div className="flex-1 container mx-auto max-w-4xl px-4 py-8">
          <div className="bg-[#141a35] rounded-xl p-8 shadow-lg border border-blue-500/30 relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 z-0" />
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2 text-white">{quiz.title}</h1>
              <p className="text-white mb-6">{quiz.description}</p>
              
              <div className="bg-[#1a2142] rounded-xl p-5 mb-8 border border-blue-500/20 text-white">
                <h3 className="font-semibold text-lg mb-3">Quiz Details</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Clock size={18} className="mr-2 text-blue-400" />
                    <span>Time Limit: {quiz.timeLimit} minutes</span>
                  </li>
                  <li>
                    <span>Total Questions: {quiz.questions.length}</span>
                  </li>
                  <li>
                    <span>Total Points: {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</span>
                  </li>
                  {previousScore !== null && (
                    <li className="flex items-center">
                      <CheckCircle size={18} className="mr-2 text-green-400" />
                      <span>Previous Score: {previousScore}%</span>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex justify-center">
                <button
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-lg font-bold transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1F274D] focus:outline-none"
                  onClick={handleStartQuiz}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col text-white">
      <Header />
      
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#243bab] to-[#232d5d] shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm-white text-white">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            {timeLeft > 0 && (
              <div className={`flex items-center ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                <Clock size={16} className="mr-1" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          <div className="w-full bg-[#141a35] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-600 h-full rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto max-w-4xl px-4 py-6">
        <div className="bg-[#141a35] rounded-xl border border-blue-500/30 p-6 mb-8 shadow-lg relative group text-white">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500 z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-blue-900/60 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 border border-blue-500/40 text-white">
                {currentQuestionIndex + 1}
              </div>
              <h2 className="text-xl font-medium text-white">{currentQuestion.question}</h2>
            </div>
            
            {currentQuestion.points > 1 && (
              <div className="mb-4 text-sm-white text-white">
                {currentQuestion.points} points
              </div>
            )}
            
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-3 mt-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-lg font-medium transition-all text-white ${
                      selectedAnswer === option 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 border border-blue-300/50 shadow-lg' 
                        : 'bg-[#1a2142] border border-blue-500/30 hover:bg-[#232d5d]'
                    }`}
                    onClick={() => handleAnswerSelect(option)}
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
                  value={textAnswer}
                  onChange={handleTextChange}
                  className="w-full bg-[#1a2142] border border-blue-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Type your answer here..."
                />
              </div>
            )}
            
            {answerFeedback !== null && (
              <div className={`mt-6 flex items-center justify-center text-xl font-semibold ${
                answerFeedback ? 'text-green-400' : 'text-red-400'
              }`}>
                {answerFeedback ? (
                  <><CheckCircle className="mr-2" />Correct!</>
                ) : (
                  <><XCircle className="mr-2" />Incorrect</>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className={`px-10 py-3 rounded-lg text-lg font-bold transition-all text-white ${
              (currentQuestion.type === 'multiple-choice' && selectedAnswer) || 
              (currentQuestion.type === 'short-answer' && textAnswer.trim() !== '')
                ? 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700' 
                : 'bg-[#1a2142]/60 text-blue-300/50 border border-blue-500/20 cursor-not-allowed'
            }`}
            onClick={handleNextQuestion}
            disabled={(currentQuestion.type === 'multiple-choice' && !selectedAnswer) || 
              (currentQuestion.type === 'short-answer' && textAnswer.trim() === '')}
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizView;
