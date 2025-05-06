import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import Actbox from "../../../assets/asset/ActBox.png";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../../../services/firebaseConfig";

const options = ["INDEX", "ARRAY", "STACK", "QUEUE", "HASH TABLE"];

const questions = [
  "Arrays use an ________ to access their elements.",
  "A ________ follows LIFO, meaning the last element added is the first to be removed.",
  "A ________ follows FIFO, meaning the first element added is the first to be removed.",
  "A queue is similar to a ________ of people waiting for a bus.",
  "A ________ is a key-value data structure for fast lookups."
];

const correctAnswers = {
  "Arrays use an ________ to access their elements.": "INDEX",
  "A ________ follows LIFO, meaning the last element added is the first to be removed.": "STACK",
  "A ________ follows FIFO, meaning the first element added is the first to be removed.": "QUEUE",
  "A queue is similar to a ________ of people waiting for a bus.": "QUEUE",
  "A ________ is a key-value data structure for fast lookups.": "HASH TABLE"
};
function DraggableItem({ id, children, fitContainer = false  }) {
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

export default function Activity2() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);

  const handleDrop = (event) => {
    const { active, over } = event;
    if (!over) return;

    setAnswers((prev) => {
      const newAnswers = { ...prev };
      const previousDropArea = Object.keys(prev).find((key) => prev[key] === active.id);
      if (previousDropArea && previousDropArea !== over.id) {
        delete newAnswers[previousDropArea];
      }
      newAnswers[over.id] = active.id;
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    setFeedback("Checking answers...");
    let correctCount = 0;
    for (let desc in correctAnswers) {
      if (answers[desc] === correctAnswers[desc]) {
        correctCount++;
      }
    }
    const calculatedScore = correctCount * 20;
    setScore(calculatedScore);
    setFeedback(
      calculatedScore === 100
        ? "🎉 Correct! You nailed it!" : ` You scored ${calculatedScore}/100. Try again!`
    );

    // try {
    //   const scoreData = {
    //     userId: "user1", // Replace with actual user ID
    //     activityId: "activity2",
    //     score: calculatedScore,
    //     timestamp: new Date().toISOString()
    //   };
    //   await setDoc(doc(db, "activityScores", `${scoreData.userId}_${scoreData.timestamp}`), scoreData);
    // } catch (error) {
    //   console.error("Error saving score:", error);
    //   setFeedback("Error saving score. Please try again.");
    // }

    setTimeout(() => {
      navigate("/week1activity3"); // Replace with your desired action after the delay
    }, 3000);
  };

  const renderQuestion = (question, index) => {
    const parts = question.split("________");
    return (
      <div key={index} className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <span className="text-white font-medium w-5 sm:w-6">{index + 1}.</span>
        <span className="text-white text-sm sm:text-base md:text-lg">{parts[0]}</span>
        <DroppableArea id={question} answer={answers[question]} />
        <span className="text-white text-sm sm:text-base md:text-lg">{parts[1]}</span>
      </div>
    );
  };

  return (
    <div className="bg-[#1c2452] min-h-screen flex flex-col">

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
      <button onClick={() => (window.location.href = "/mainPage")} className="text-white">          
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-white">
          Activity 2 - Fill in the Blanks
        </h1>
        <img src={hint} className="w-6 h-6 sm:w-8 sm:h-8" alt="Hint" />
      </div>

      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
        <DndContext onDragEnd={handleDrop}>
          <div className="bg-[#141a35]/80  backdrop-blur-md  rounded-xl border-4 animate-[pulseBorder_3s_ease-in-out_infinite] shadow-inner shadow-indigo-500/20 p-5" >
            {questions.map((question, index) => renderQuestion(question, index))}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 justify-center w-full max-w-5xl">
            {options.map(
              (opt) =>
                !Object.values(answers).includes(opt) && (
                  <DraggableItem key={opt} id={opt}>{opt}</DraggableItem>
                )
            )}
          </div>
        </DndContext>

        {feedback && (
          <p className="mt-4 sm:mt-6 text-white font-medium text-sm sm:text-base md:text-lg">
            {feedback}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 mt-4 sm:mt-6">
          <button
            className="px-16 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm sm:text-base md:text-lg w-full sm:w-auto font-semibold shadow-md hover:scale-105 transition-transform"
            onClick={() => navigate("/week1activity1")}
          >
           
            Previous Activity
          </button>
          <button
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm sm:text-base md:text-lg w-full sm:w-auto font-semibold shadow-md hover:scale-105 transition-transform"
            onClick={handleSubmit}
          >
            Submit
          </button>
         
        </div>
      </div>
    </div>
  );
}