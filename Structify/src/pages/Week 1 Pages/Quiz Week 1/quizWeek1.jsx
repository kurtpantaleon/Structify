import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { useNavigate } from 'react-router-dom';
import Week2Page from '../../Week2Page';


const QuizWeek1 = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Fetch questions from API
  useEffect(() => {
    setIsLoading(true);
  
    fetch("http://localhost:3001/questions?week=1")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched Questions:", data);
        setQuestions(shuffleArray(data));
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching quiz questions:", error);
        setError("Failed to load quiz questions");
        setIsLoading(false);
      });
  }, []);
  
  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.type === 'multipleChoice' && selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    } else if (
      currentQuestion.type === 'completeSentence' &&
      textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
    ) {
      setScore(prevScore => prevScore + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
    } else {
      setShowResults(true);
    }
  };

  const handleAnswerSelect = answer => {
    setSelectedAnswer(answer);
  };

  const handleTextChange = e => {
    setTextAnswer(e.target.value);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTextAnswer('');
    setScore(0);
    setShowResults(false);
  };

  const week2page = () => {
    navigate('/week2Page'); // Navigate to the main page
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-indigo-900 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-indigo-900">{error}</div>;
  }

  if (showResults) {
    return (
      <div className="bg-[#1F274D] min-h-screen text-white p-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">Quiz Results</h1>
        <div className="bg-indigo-800 p-8 rounded-lg w-full max-w-md">
          <p className="text-2xl mb-4 text-center">Your Score</p>
          <p className="text-4xl text-center mb-6">{score} / {questions.length}</p>
          <p className="text-center mb-8">
            {score === questions.length ? 'Excellent!' : score >= questions.length / 2 ? 'Good job!' : 'Keep practicing!'}
          </p>
          <div className="flex flex-col space-y-4">
            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              onClick={resetQuiz}
            >
              Try Again
            </button>
            <button
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
              onClick={week2page}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-[#1F274D] min-h-screen text-white">
      <Header />

      <div className="p-4 flex items-center">
        <button className="text-white text-2xl mr-4">×</button>
        <div className="flex-1 bg-amber-50 h-2 rounded-full">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black ml-4">?</div>
      </div>

      {/* Quiz Content */}
      <div className="flex flex-col items-center justify-center px-4 pt-8 pb-16">
        <h1 className="text-2xl font-bold mb-6">Week 1 - Quiz</h1>
        
        <p className="text-xl mb-8 text-center">
          {currentQuestionIndex + 1}. {currentQuestion && currentQuestion.question}
        </p>

        {/* Answer Options */}
        {currentQuestion && currentQuestion.type === 'multipleChoice' ? (
          <div className="w-full max-w-md space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-3 text-center rounded ${
                  selectedAnswer === option ? 'bg-blue-600' : 'bg-indigo-900'
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center text-xl">
              <p className="mr-2">{currentQuestion && currentQuestion.preText}</p>
              <input
                type="text"
                value={textAnswer}
                onChange={handleTextChange}
                className="bg-[#1F274D] border-b-2 border-white px-2 py-1 w-32 text-center focus:outline-none"
                placeholder="________"
              />
              <p className="ml-2">{currentQuestion && currentQuestion.postText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="fixed bottom-8 w-full flex justify-center">
        <button
          className={`px-12 py-2 rounded ${
            (currentQuestion && currentQuestion.type === 'multipleChoice' && selectedAnswer) || 
            (currentQuestion && currentQuestion.type === 'completeSentence' && textAnswer.trim() !== '')
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-indigo-700 text-indigo-300'
          }`}
          onClick={handleNextQuestion}
          disabled={(currentQuestion && currentQuestion.type === 'multipleChoice' && !selectedAnswer) || 
                  (currentQuestion && currentQuestion.type === 'completeSentence' && textAnswer.trim() === '')}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuizWeek1;