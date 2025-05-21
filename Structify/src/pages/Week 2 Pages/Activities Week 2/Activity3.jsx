import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Actbox from "../../../assets/asset/ActBox.png";
import { useLessonProgress } from "../../../context/lessonProgressContext"; // Importing the lesson progress context

const options = ["O(1)", "O(n)", "O(log n)", "O(n²)", "O(n log n)"];

const descriptions = [
  "Accessing an element in an array.",
  "Linear Search.",
  "Binary Search.",
  "Bubble Sort.",
  "Merge Sort."
];

const correctAnswers = {
  "Accessing an element in an array.": "O(1)",
  "Linear Search.": "O(n)",
  "Binary Search.": "O(log n)",
  "Bubble Sort.": "O(n²)",
  "Merge Sort.": "O(n log n)"
};

function DraggableItem({ id, children, fitContainer = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    backgroundImage: `url(${Actbox})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center justify-center text-white rounded text-center uppercase text-sm sm:text-base md:text-lg font-bold cursor-pointer hover:scale-105 
        ${fitContainer ? 'w-full h-full p-0' : 'w-36 sm:w-44 md:w-48 p-2 sm:p-3'}`}
    >
      {children}
    </div>
  );
}

function DroppableArea({ id, answer }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const style = {
    backgroundImage: `url(${Actbox})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full sm:w-80 md:w-96 h-12 sm:h-14 md:h-16 rounded-lg font-bold flex items-center justify-center text-white text-sm sm:text-base md:text-xl transition-all duration-300 bg-opacity-80`}
    >
      {answer ? (
        <DraggableItem id={answer} fitContainer>{answer}</DraggableItem>
      ) : (
        <span className="text-white/50">Drop here</span>
      )}
    </div>
  );
}

export default function Activity3() {
  const { activityScores, markActivityComplete } = useLessonProgress(); // declaring the context
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);

  //added useEffect to get the score from the context
  useEffect(() => {
    if (activityScores && activityScores["Week2activity2"] !== undefined) {
      setScore(activityScores["Week2activity2"]);
      setFeedback(`Your previous score: ${activityScores["Week2activity2"]}/100`);
    }
  }, [activityScores]);

  const handleDrop = (event) => {
    const { active, over } = event;
    if (!over) return;

    setAnswers((prev) => {
      const newAnswers = { ...prev };
      const previousDropArea = Object.keys(prev).find(key => prev[key] === active.id);
      if (previousDropArea && previousDropArea !== over.id) {
        delete newAnswers[previousDropArea];
      }
      newAnswers[over.id] = active.id;
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    setFeedback("Checking answers..."); //added feedback message for scores
    let correctCount = 0;
    for (let desc in correctAnswers) {
      if (answers[desc] === correctAnswers[desc]) {
        correctCount++;
      }
    }
    const calculatedScore = correctCount * 20;
    setScore(calculatedScore);
    setFeedback(calculatedScore === 100 ? "🎉 Correct! You nailed it!" : `You scored ${calculatedScore}/100. Try again!`);
  
    await markActivityComplete("Week2activity3", calculatedScore); // Save the score in the context
  
    setTimeout(() => {
      navigate("/quizWeek3");
    }, 3000);
  };

  return (
    <>
      <style>{`
        @keyframes pulseBorder {
          0% { border-color: #4f46e5; }
          25% { border-color: #9333ea; }
          50% { border-color: #f43f5e; }
          75% { border-color: #9333ea; }
          100% { border-color: #4f46e5; }
        }

       @keyframes fall {
          0% { 
            transform: translateY(-10%); 
            opacity: 1; 
            background-color: #f43f5e; /* Initial Color (Red) */
          }
          25% { 
            background-color: #9333ea; /* Purple */
          }
          50% { 
            transform: translateY(50vh); 
            opacity: 0.6; 
            background-color: #4f46e5; /* Blue */
          }
          75% { 
            background-color: #ffcc00; /* Yellow */
          }
          100% { 
            transform: translateY(110vh); 
            opacity: 0; 
            background-color: #ffffff; /* White (Final Color) */
          }
        }

        .particle {
          position: fixed;
          top: -10px;
          width: 8px; /* Larger particles */
          height: 8px; 
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.9); /* Glowing effect */
          animation: fall 4s linear infinite;
          pointer-events: none;
          z-index: 0;
          animation-delay: calc(Math.random() * 5s);
          animation-duration: calc(3 + Math.random() * 2)s;
          transform: scale(calc(0.8 + Math.random() * 0.5));  /* Randomize size */
        }

      `}</style>

      <div className="bg-[#1c2452] min-h-screen flex flex-col overflow-hidden relative z-10">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}vw`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${3 + Math.random() * 20}s`
            }}
          />
        ))}

        <Header />

        <div className="flex justify-between items-center p-4 border-b border-blue-500/40 backdrop-blur-md bg-white/10">
          <button onClick={() => (window.location.href = "/week2Page")} className="text-white hover:text-red-400 transition-colors">          
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide"> Activity 3 - Matching Game</h1>
          <img src={hint} className="w-8 h-8" alt="Hint Icon" />
        </div>

        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
          <DndContext onDragEnd={handleDrop}>
            
            <div className="rounded-xl border-4 animate-[pulseBorder_3s_ease-in-out_infinite] shadow-inner shadow-indigo-500/20">

              <div className="flex flex-row items-center justify-center rounded-xl p-4 sm:p-6 w-200 bg-[#141a35]/80 backdrop-blur-md">
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map((num, index) => (
                    <div key={num} className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                      <span className="text-white font-semibold w-5 sm:w-6">{num}.</span>
                      <DroppableArea id={descriptions[index]} answer={answers[descriptions[index]]} />
                    </div>
                  ))}
                </div>

                <div className="p-4 sm:p-6 w-full md:w-1/2 flex flex-col gap-6 sm:gap-8 md:gap-10">
                  {descriptions.map((desc, index) => (
                    <p key={index} className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg font-light">{desc}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 justify-center w-full max-w-5xl">
              {options.map((opt) => (
                !Object.values(answers).includes(opt) && (
                  <DraggableItem key={opt} id={opt}>{opt}</DraggableItem>
                )
              ))}
            </div>
          </DndContext>
          {feedback && (
            <p className="mt-4 sm:mt-6 text-white font-medium text-base sm:text-lg md:text-xl animate-bounce">{feedback}</p>
          )}

<div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 mt-4 sm:mt-6">
          <button
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm sm:text-base md:text-lg w-full sm:w-auto font-semibold shadow-md hover:scale-105 transition-transform"
            onClick={() => navigate("/week2activity2")}
          >
            Previous Activity
          </button>
          <button 
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm sm:text-base md:text-lg w-full sm:w-auto font-semibold shadow-md hover:scale-105 transition-transform"
              onClick={handleSubmit}
            >
              Submit Answers
            </button>
        </div>
        </div>
      </div>
    </>
  );
}
