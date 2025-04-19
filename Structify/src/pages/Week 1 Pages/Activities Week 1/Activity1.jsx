import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../../../services/firebaseConfig";

const options = ["LINKED LIST", "ARRAY", "STACK", "QUEUE", "HASH TABLE"];
const descriptions = [
  "Stores multiple elements in a fixed order.",
  "Stores elements as nodes connected with pointers.",
  "Follows Last In, First Out (LIFO).",
  "Follows First In, First Out (FIFO).",
  "Uses a key-value pair for quick data retrieval."
];

const correctAnswers = {
  "Stores multiple elements in a fixed order.": "ARRAY",
  "Stores elements as nodes connected with pointers.": "LINKED LIST",
  "Follows Last In, First Out (LIFO).": "STACK",
  "Follows First In, First Out (FIFO).": "QUEUE",
  "Uses a key-value pair for quick data retrieval.": "HASH TABLE"
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
      className={`w-full sm:w-80 md:w-96 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-blue-900 to-blue-1000 rounded-lg border ${isOver ? 'border-white' : 'border-white/100'} font-bold flex items-center justify-center text-white text-sm sm:text-base md:text-xl transition-colors`}
    >
      {answer ? (
        <DraggableItem id={answer}>{answer}</DraggableItem>
      ) : (
        <span className="text-white/50">Drop here</span>
      )}
    </div>
  );
}

export default function Activity1() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);

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
    setFeedback("Checking answers...");
    let correctCount = 0;
    for (let desc in correctAnswers) {
      if (answers[desc] === correctAnswers[desc]) {
        correctCount++;
      }
    }
    const calculatedScore = correctCount * 20;
    setScore(calculatedScore);
    setFeedback(calculatedScore === 100 ? "Correct! Well done." : `You scored ${calculatedScore}/100. Try again!`);

    // try {
    //   const scoreData = {
    //     userId: "user1", // Replace with actual user ID
    //     activityId: "activity1",
    //     score: calculatedScore,
    //     timestamp: new Date().toISOString()
    //   };
    //   await setDoc(doc(db, "activityScores", `${scoreData.userId}_${scoreData.timestamp}`), scoreData);
    // } catch (error) {
    //   console.error("Error saving score:", error);
    //   setFeedback("Error saving score. Please try again.");
    // }

    setTimeout(() => {
      navigate("/week1activity2"); 
    }, 3000);
  };

    return (
      
      <div className="bg-[#1c2452] min-h-screen flex flex-col">
      
        <Header />
        <div className="flex justify-between items-center p-4 bg-[#1c2452] border-b border-[#2a3366]">
        <button onClick={() => (window.location.href = "/week2Page")} className="text-white">          
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-white">Activity 1 - Matching Type</h1>
          <img src={hint} className="w-8 h-8"></img>
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
                <p key={index} className="text-white text-xs sm:text-sm md:text-base lg:text-lg">{desc}</p>
              ))}
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
          <p className="mt-4 sm:mt-6 text-white font-medium text-sm sm:text-base md:text-lg">{feedback}</p>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 mt-4 sm:mt-6">
          <button 
            className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded text-sm sm:text-base md:text-lg w-full sm:w-auto"
            onClick={handleSubmit}
          >
            Submit
          </button>
          
        </div>
      </div>
    </div>
  );
}