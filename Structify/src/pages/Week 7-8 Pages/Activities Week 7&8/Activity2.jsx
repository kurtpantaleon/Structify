import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";

const options = ["Stack ", "Queue ", "Recursion ",];

const questions = [
  "The ______ data structure is used for undo/redo functions. ",
  "A ______ is used for waiting lines.",
  "______ occurs when a function keeps calling itself."
];

const correctAnswers = {
  "The ______ data structure is used for undo/redo functions. ": "Stack",
  "A ______ is used for waiting lines.": "Queue",
  "______ occurs when a function keeps calling itself.": "Recursion"
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
      className="px-4 py-1 bg-transparent border border-white text-white rounded text-center uppercase text-sm cursor-pointer w-32"
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
      className="inline-block w-36 h-6 bg-transparent border border-white rounded mx-1"
    >
      <div className="w-full h-full flex items-center justify-center text-white text-sm">
        {answer || ""}
      </div>
    </div>
  );
}

export default function Activity2() {
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
    for (let question in correctAnswers) {
      if (answers[question] !== correctAnswers[question]) {
        isCorrect = false;
        break;
      }
    }
    setFeedback(isCorrect ? "Correct! Well done." : "Some answers are incorrect. Try again!");
  };

  const goToNextActivity = () => {
    window.location.href = "/week7activity3";
  };
  
  const goToPreviousActivity = () => {
    window.location.href = "/week1activity2";
  };


  // Function to replace the blank in the question with the droppable area
  const renderQuestion = (question, index) => {
    const parts = question.split("________");
    return (
      <div key={index} className="mb-6 text-white">
        {index + 1}. {parts[0]}
        <DroppableArea id={question} answer={answers[question]} />
        {parts[1]}
      </div>
    );
  };

  return (
    <div className="bg-[#1c2452] min-h-screen flex flex-col">
      <> <Header /> 
      <div className="flex justify-between items-center p-4 bg-[#1c2452] border-b border-[#2a3366]">
      <button onClick={() => (window.location.href = "/mainPage")} className="text-white">          
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button >
        <h1 className="text-xl font-medium text-white">Activity 2 - Fill in the blanks</h1>
        <img src={hint} className="w-8 h-8"></img>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col items-center">
        <DndContext onDragEnd={handleDrop}>
          <div className="max-w-3xl w-full">
            {/* Questions with blanks */}
            <div className="mb-8">
              {questions.map((question, index) => renderQuestion(question, index))}
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              {options.map((opt) => (
                !Object.values(answers).includes(opt) && (
                  <DraggableItem key={opt} id={opt}>{opt}</DraggableItem>
                )
              ))}
            </div>
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
      </><div className="flex justify-between w-full px-6 pb-6">
        <button 
          className="px-4 py-2 bg-gray-600 text-white rounded flex items-center"
          onClick={goToPreviousActivity}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous Activity
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
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