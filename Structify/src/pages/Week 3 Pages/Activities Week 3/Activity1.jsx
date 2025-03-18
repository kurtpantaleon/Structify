import React, { useState } from "react";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const options = ["toUpperCase()", "toLowerCase()", "replace()", "trim()", "length"];

const descriptions = [
  "Converts text to uppercase.",
  "Converts text to lowercase.",
  "Replaces a substring.",
  "Removes extra spaces at the beginning and end.",
  "Counts the number of characters in a string."
];

const correctAnswers = {
  "Converts text to uppercase.": "toUpperCase()",
  "Converts text to lowercase.": "toLowerCase()",
  "Replaces a substring.": "replace()",
  "Removes extra spaces at the beginning and end.": "trim()",
  "Counts the number of characters in a string.": "length"
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
      className="px-4 py-2 bg-transparent border border-white text-white rounded text-center uppercase text-sm cursor-pointer w-32"
    >
      {children}
    </div>
  );
}

function DroppableArea({ id, answer }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className="w-full h-8 bg-transparent border border-white rounded flex items-center justify-center text-white text-sm"
    >
      {answer || ""}
    </div>
  );
}

export default function Activity1() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");

  const handleDrop = (event) => {
    const { active, over } = event;
    if (over) {
      setAnswers((prev) => ({ ...prev, [over.id]: active.id }));
    }
  };

  const handleSubmit = () => {
    let isCorrect = true;
    for (let desc in correctAnswers) {
      if (answers[desc] !== correctAnswers[desc]) {
        isCorrect = false;
        break;
      }
    }
    setFeedback(isCorrect ? "Correct! Well done." : "Some answers are incorrect. Try again!");
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
        <h1 className="text-xl font-medium text-white">Activity 3 - Matching Type</h1>
        <img src={hint} className="w-8 h-8"></img>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <DndContext onDragEnd={handleDrop}>
          <div className="flex gap-8 justify-center max-w-4xl">
            {/* Left column with numbers and drop areas */}
            <div className="border border-white rounded p-6 w-64">
              {[1, 2, 3, 4, 5].map((num, index) => (
                <div key={num} className="flex items-center gap-4 mb-4">
                  <span className="text-white font-medium w-6">{num}.</span>
                  <DroppableArea id={descriptions[index]} answer={answers[descriptions[index]]} />
                </div>
              ))}
            </div>

            {/* Right column with descriptions */}
            <div className="border border-white rounded p-6 w-64">
              {descriptions.map((desc, index) => (
                <p key={index} className="text-white text-sm mb-4">{desc}</p>
              ))}
            </div>
          </div>

          {/* Answer options */}
          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            {options.map((opt) => (
              !Object.values(answers).includes(opt) && (
                <DraggableItem key={opt} id={opt}>{opt}</DraggableItem>
              )
            ))}
          </div>
        </DndContext>            
        {/* Submit button */}
        <button 
          className="mt-8 px-6 py-2 bg-blue-600 text-white rounded" 
          onClick={handleSubmit}
        >
          Submit
        </button>

        {feedback && (
          <p className="mt-4 text-white font-medium">{feedback}</p>
        )}
      </div>
    </div>
  );
}