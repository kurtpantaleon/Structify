import React, { useState } from "react";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const options = [
  { id: "Queue-1", label: "Queue" },
  { id: "Stack", label: "Stack" },
  { id: "Array", label: "Array" },
  { id: "Queue-2", label: "Queue" },
  { id: "Hash Table", label: "Hash Table" }
];
const descriptions = [
  "Train Line",
  "Browser Back Button",
  "Contacts List on Phone",
  "People Standing in Line ",
  "Student Record System "
];

const correctAnswers = {
  "Train Line": "Queue",
  "Browser Back Button": "Stack",
  "Contacts List on Phone ": "Array",
  "People Standing in Line": "Queue",
  "Student Record System": "Hash Table"
};

function DraggableItem({ id, label }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 bg-blue-900 border border-white text-white rounded text-center uppercase text-lg font-bold cursor-pointer w-xl"
    >
      {label}
    </div>
  );
}

function DroppableArea({ id, answer }) {
  const { setNodeRef } = useDroppable({ id });

  const answerLabel = options.find((option) => option.id === answer)?.label || "";

  return (
    <div 
      ref={setNodeRef} 
      className="w-100 h-15 bg-gradient-to-r from-blue-900 to-blue-1000 rounded-lg border border-white/100  font-bold rounded flex items-center justify-center text-white text-xl"
    >
       {answerLabel}
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

  const goToNextActivity = () => {
    window.location.href = "/quizWeek1";
  };
  
  const goToPreviousActivity = () => {
    window.location.href = "/week1activity2";
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
            <div className="flex flex-col item-center justify-center gap-2 border-r border-white/20 rounded-xl p-6 w-100 bg-[#141a35]">
              {[1, 2, 3, 4, 5].map((num, index) => (
                <div key={num} className="flex items-center gap-4 mb-4">
                  <span className="text-white font-medium w-6">{num}.</span>
                  <DroppableArea id={descriptions[index]} answer={answers[descriptions[index]]} />
                </div>
              ))}
            </div>

            {/* Right column with descriptions */}
            <div className="rounded p-6 w-100 flex flex-col item-center justify-center gap-13 rounded-xl  bg-[#141a35] ">
              {descriptions.map((desc, index) => (
                <p key={index} className="text-white text-sm mb-4">{desc}</p>
              ))}
            </div>
          </div>

          {/* Answer options */}
          <div className="flex w-5xl gap-4 mt-3 justify-center">
          {options.map((opt) => (
              !Object.values(answers).includes(opt.id) && (
                <DraggableItem key={opt.id} id={opt.id} label={opt.label} />
              )
            ))}
          </div>
        </DndContext>            
        
        {feedback && (
          <p className="mt-4 text-white font-medium">{feedback}</p>
        )}
      </div>

         {/* Navigation buttons */}
         <div className="mt-3 flex justify-between align-center items-center w-full px-6 pb-6">
              <button 
                className="px-4 h-10 bg-blue-600 text-white rounded flex items-center"
                onClick={goToPreviousActivity}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous Activity
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
                Go to Quiz
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
        </div>
        
    </div>
  );
}