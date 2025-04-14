import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";

const options = ["Algorithm", "Efficiency", "Big-O Notation", "Input", "Output"];

const descriptions = [
  "1. A step-by-step process to solve a problem.",
  "2. Measures time complexity.",
  "3. How fast an algorithm runs.",
  "4. The data an algorithm receives.",
  "5. The final result after processing."
];

const correctAnswers = {
  "A step-by-step process to solve a problem.": "Algorithm",
  "Measures time complexity.": "Big-O Notation",
  "How fast an algorithm runs.": "Efficiency",
  "The data an algorithm receives.": "Input",
  "The final result after processing.": "Output"
};

function DraggableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 sm:p-3 bg-blue-900 border border-white text-white rounded text-center uppercase text-sm sm:text-base md:text-lg font-bold cursor-pointer w-36 sm:w-44 md:w-48 hover:bg-blue-800 transition-colors"
    >
      {children}
    </div>
  );
}

function DroppableArea({ id, answer }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full sm:w-80 md:w-96 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-blue-900 to-blue-1000 rounded-lg border ${
        isOver ? "border-white" : "border-white/100"
      } font-bold flex items-center justify-center text-white text-sm sm:text-base md:text-xl transition-colors`}
    >
      {answer ? (
        <DraggableItem id={answer}>{answer}</DraggableItem>
      ) : (
        <span className="text-white/50">Drop here</span>
      )}
    </div>
  );
}

export default function Week2Activity1() {
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
        ? "Correct! Well done."
        : `You scored ${calculatedScore}/100. Try again!`
    );

    try {
      const scoreData = {
        userId: "user1", // Replace with actual user ID
        activityId: "week2activity1",
        score: calculatedScore,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "activityScores", `${scoreData.userId}_${scoreData.timestamp}`), scoreData);
    } catch (error) {
      console.error("Error saving score:", error);
      setFeedback("Error saving score. Please try again.");
    }
    setTimeout(() => {
      navigate(("/week2Activity2")); // Navigate to the next activity after 3 seconds
    }, 3000);
  };

  return (
    <div className="bg-[#1c2452] min-h-screen flex flex-col">
      <Header />
      <div className="flex justify-between items-center p-4 bg-[#1c2452] border-b border-[#2a3366]">
      <button onClick={() => (window.location.href = "/mainPage")} className="text-white">          
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-white">
          Activity 1 - Matching Type
        </h1>
        <img src={hint} className="w-6 h-6 sm:w-8 sm:h-8" alt="Hint" />
      </div>

      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
        <DndContext onDragEnd={handleDrop}>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 justify-center w-full max-w-5xl">
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 border-r border-white/20 rounded-xl p-4 sm:p-6 w-full md:w-1/2 bg-[#141a35]">
              {[1, 2, 3, 4, 5].map((num, index) => (
                <div key={num} className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                  <span className="text-white font-medium w-5 sm:w-6">{num}.</span>
                  <DroppableArea id={descriptions[index]} answer={answers[descriptions[index]]} />
                </div>
              ))}
            </div>
            <div className="rounded p-4 sm:p-6 w-full md:w-1/2 flex flex-col gap-6 sm:gap-8 md:gap-10 rounded-xl bg-[#141a35]">
              {descriptions.map((desc, index) => (
                <p key={index} className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
                  {desc}
                </p>
              ))}
            </div>
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
      </div>
      <div className="flex justify-between align-center items-center w-full px-6 pb-6 mt-3">
        <button className="px-4 h-10 bg-gray-600 text-white rounded flex items-center"
          >Previous Activity
         </button>
        {/* Submit button */}
        <button 
          className=" px-20 py-4 bg-blue-600 text-white rounded" 
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button 
          className="px-4 h-10 bg-blue-600 text-white rounded flex items-center"
          onClick={goToNextActivity}
        >
          Next Activity
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}