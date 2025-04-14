import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import Header from "../../../components/Header";
import hint from "../../../assets/images/hint.png";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";

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
      className={`inline-block h-12 sm:h-14 md:h-16 bg-gradient-to-r from-blue-900 to-blue-1000 rounded-lg border ${
        isOver ? "border-white" : "border-white/100"
      } font-bold flex items-center justify-center text-white text-sm sm:text-base md:text-xl transition-colors w-36 sm:w-44 md:w-48`}
    >
      {answer ? (
        <DraggableItem id={answer}>{answer}</DraggableItem>
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
        ? "Correct! Well done."
        : `You scored ${calculatedScore}/100. Try again!`
    );

    try {
      const scoreData = {
        userId: "user1", // Replace with actual user ID
        activityId: "activity2",
        score: calculatedScore,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "activityScores", `${scoreData.userId}_${scoreData.timestamp}`), scoreData);
    } catch (error) {
      console.error("Error saving score:", error);
      setFeedback("Error saving score. Please try again.");
    }
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
      <Header /> 
      <div className="flex justify-between items-center p-4 bg-[#1c2452] border-b border-[#2a3366]">
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
          <div className="w-full max-w-5xl bg-[#141a35] rounded-xl p-4 sm:p-6 border border-white/20">
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
            className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded text-sm sm:text-base md:text-lg flex items-center w-full sm:w-auto mb-2 sm:mb-0"
            onClick={() => navigate("/week1activity1")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Previous Activity
          </button>
          <button
            className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded text-sm sm:text-base md:text-lg w-full sm:w-auto mb-2 sm:mb-0"
            onClick={handleSubmit}
          >
            Submit
          </button>
         
        </div>
      </div>
    </div>
  );
}