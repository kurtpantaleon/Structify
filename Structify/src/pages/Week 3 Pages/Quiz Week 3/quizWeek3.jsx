import React, { useState, useEffect } from "react";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import Confetti from "react-confetti";
import { fetchQuizQuestions } from "../../../utils/fetchQuizQuestions";

const QuizWeek3 = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchQuizQuestions(WEEK_NUMBER)
      .then((questions) => {
        setQuestions(shuffleArray(questions));
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz questions");
        setIsLoading(false);
      });
  }, []);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    setIsLoading(true);
    fetch("https://structify.tech/api/quiz/week3")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        setQuestions(shuffleArray(data));
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz questions");
        setIsLoading(false);
      });
  }, []);

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    if (
      currentQuestion.type === "multipleChoice" &&
      selectedAnswer === currentQuestion.correctAnswer
    ) {
      setScore((prev) => prev + 1);
      isCorrect = true;
    } else if (
      currentQuestion.type === "completeSentence" &&
      textAnswer.toLowerCase().trim() ===
        currentQuestion.correctAnswer.toLowerCase().trim()
    ) {
      setScore((prev) => prev + 1);
      isCorrect = true;
    }

    setAnswerFeedback(isCorrect);
    setShowConfetti(isCorrect);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setTextAnswer("");
        setAnswerFeedback(null);
        setShowConfetti(false);
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  const handleAnswerSelect = (answer) => setSelectedAnswer(answer);
  const handleTextChange = (e) => setTextAnswer(e.target.value);
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTextAnswer("");
    setScore(0);
    setShowResults(false);
    setAnswerFeedback(null);
    setShowConfetti(false);
  };
  const week4page = () => navigate("/week4Page");

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl font-semibold animate-pulse">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl font-semibold">
        {error}
      </div>
    );

  if (showResults) {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 min-h-screen text-white p-4 flex flex-col items-center justify-center">
        {showConfetti && <Confetti />}
        <h1 className="text-4xl font-bold mb-6 animate-bounce">
          🎉 Quiz Results 🎉
        </h1>
        <div className="bg-indigo-700 p-8 rounded-2xl w-full max-w-md shadow-xl">
          <p className="text-2xl mb-4 text-center">Your Score</p>
          <p className="text-5xl text-center mb-6">
            {score} / {questions.length}
          </p>
          <p className="text-center mb-8 italic">
            {score === questions.length
              ? "🏆 Excellent!"
              : score >= questions.length / 2
              ? "👍 Good job!"
              : "💪 Keep practicing!"}
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
              onClick={week4page}
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
    <div className="bg-gradient-to-br from-slate-900 to-blue-950 min-h-screen text-white">
      {showConfetti && <Confetti />}
      <Header />
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-700 h-2 rounded-full">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mt-10 space-y-6 px-4">
        <div className="w-full max-w-4xl p-10 bg-[#141a35] rounded-3xl border border-indigo-600 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center">
            📘 Week 3 - Quiz
          </h1>
          <p className="text-xl mb-8 text-center">
            {currentQuestionIndex + 1}.{" "}
            {currentQuestion && currentQuestion.question}
          </p>

          {currentQuestion && currentQuestion.type === "multipleChoice" ? (
            <div className="w-full max-w-md space-y-4 mx-auto">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-3 rounded-xl font-medium border transition-all duration-300 ${
                    selectedAnswer === option
                      ? "bg-blue-600 border-blue-300 scale-105"
                      : "bg-indigo-900 border-indigo-500 hover:bg-indigo-800"
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center justify-center text-xl space-x-2">
                <p>{currentQuestion && currentQuestion.preText}</p>
                <input
                  type="text"
                  value={textAnswer}
                  onChange={handleTextChange}
                  className="bg-[#1F274D] border-b-2 border-white px-2 py-1 w-32 text-center focus:outline-none"
                  placeholder="________"
                />
                <p>{currentQuestion && currentQuestion.postText}</p>
              </div>
            </div>
          )}

          {answerFeedback !== null && (
            <div
              className={`mt-6 flex items-center justify-center text-2xl font-semibold ${
                answerFeedback ? "text-green-400" : "text-red-400"
              }`}
            >
              {answerFeedback ? (
                <>
                  <CheckCircle className="mr-2" />
                  Correct!
                </>
              ) : (
                <>
                  <XCircle className="mr-2" />
                  Incorrect
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 w-full flex justify-center">
        <button
          className={`px-12 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${
            (currentQuestion &&
              currentQuestion.type === "multipleChoice" &&
              selectedAnswer) ||
            (currentQuestion &&
              currentQuestion.type === "completeSentence" &&
              textAnswer.trim() !== "")
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-indigo-700 text-indigo-300 cursor-not-allowed"
          }`}
          onClick={handleNextQuestion}
          disabled={
            (currentQuestion &&
              currentQuestion.type === "multipleChoice" &&
              !selectedAnswer) ||
            (currentQuestion &&
              currentQuestion.type === "completeSentence" &&
              textAnswer.trim() === "")
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuizWeek3;
