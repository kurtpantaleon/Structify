import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { useGameStats } from "../../../context/gameStatsContext";
import { useLessonProgress } from "../../../context/lessonProgressContext";

const problemDescription = `
Write a function that simulates a printer queue. The function should process print jobs in order (FIFO) and return the total time taken.

**Input:** An array of print job durations in minutes (e.g., [2, 3, 1, 4])
**Output:** Return the total time taken to process all jobs

**Example:**
Input: [2, 3, 1, 4]
Output: 10

Explanation:
- First job (2 min) starts at 0, ends at 2
- Second job (3 min) starts at 2, ends at 5
- Third job (1 min) starts at 5, ends at 6
- Fourth job (4 min) starts at 6, ends at 10
Total time = 10 minutes

Note: Each job must wait for the previous job to finish before starting.
`;

const defaultCodes = {
  javascript: `function calculatePrintTime(jobs) {
  // Your code here
}

console.log(calculatePrintTime([2, 3, 1, 4])); // Should print 10
`,
  python: `def calculate_print_time(jobs):
    pass

print(calculate_print_time([2, 3, 1, 4]))  # Should print 10
`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int calculatePrintTime(vector<int> jobs) {
}

int main() {
    vector<int> jobs = {2, 3, 1, 4};
    cout << calculatePrintTime(jobs) << endl;  // Should print 10
    return 0;
}`,
  csharp: `using System;
using System.Collections.Generic;

class Program {
    static int CalculatePrintTime(int[] jobs) {
    }

    static void Main() {
        int[] jobs = {2, 3, 1, 4};
        Console.WriteLine(CalculatePrintTime(jobs));  // Should print 10
    }
}`,
  java: `import java.util.*;

public class Main {
    public static int calculatePrintTime(int[] jobs) {
    }

    public static void main(String[] args) {
        int[] jobs = {2, 3, 1, 4};
        System.out.println(calculatePrintTime(jobs));  // Should print 10
    }
}`
};

const expectedOutput = "10";
const totalTimeInSeconds = 240;

export default function Activity3() {
  const editorRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [availableLanguages] = useState([
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "cpp", label: "C++" },
    { id: "csharp", label: "C#" },
    { id: "java", label: "Java" }
  ]);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasRunCode, setHasRunCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeInSeconds);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const navigate = useNavigate();
  const { deductHeart } = useGameStats();
  const { activityScores, markActivityComplete } = useLessonProgress();
  const [score, setScore] = useState(null);
  const timerRef = useRef(null);
  const [hasDeductedHeart, setHasDeductedHeart] = useState(false);

  useEffect(() => {
    if (activityScores && activityScores["activity3"] !== undefined) {
      setScore(activityScores["activity3"]);
      setFeedback(`Your previous score: ${activityScores["activity3"]}/100`);
    }
  }, [activityScores]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(defaultCodes[language] || "");
    }
  }, [language]);

  useEffect(() => {
    let timerHasDeductedHeart = false;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowTimeoutModal(true);
          if (!timerHasDeductedHeart && !hasDeductedHeart) {
            deductHeart();
            timerHasDeductedHeart = true;
            setHasDeductedHeart(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
    };
  }, [deductHeart, hasDeductedHeart]);

  const runCode = () => {
    setHasRunCode(true);
    setConsoleOutput("");
    setFeedback("");
    setIsCorrect(false);
    const code = editorRef.current?.getValue();

    if (language === "javascript") {
      try {
        let output = "";
        const originalLog = console.log;
        console.log = (...args) => {
          output += args.join(" ");
        };
        // eslint-disable-next-line no-eval
        eval(code);
        setConsoleOutput(output);
        console.log = originalLog;
        if (output.trim() === expectedOutput) {
          setFeedback("✅ Correct! Output matches expected result.");
          setIsCorrect(true);
          clearInterval(timerRef.current);
        } else {
          setFeedback("❌ Output does not match expected result.");
          setIsCorrect(false);
        }
      } catch (err) {
        setConsoleOutput(`Error: ${err.message}`);
        setFeedback("");
        setIsCorrect(false);
      }
    } else {
      setConsoleOutput("Code execution for this language is not supported in-browser. Please visually check your output.");
      setFeedback("(Manual Check) If your output is '10', you are correct!");
      setIsCorrect(false);
    }
  };

  const handleSubmit = async (force = false) => {
    if (!hasRunCode && !force) return;

    if (isCorrect) {
      const calculatedScore = 100;
      setScore(calculatedScore);
      await markActivityComplete("activity3", calculatedScore);
      navigate("/quizWeek1");
    } else if (!hasDeductedHeart) {
      await deductHeart();
      setHasDeductedHeart(true);
      setFeedback("❌ Output does not match expected result. 1 heart has been deducted.");
    } else {
      setFeedback("❌ Output does not match expected result.");
    }
  };

  const handleTryAgain = () => {
    setShowTimeoutModal(false);
    setTimeLeft(totalTimeInSeconds);
    setHasRunCode(false);
    setConsoleOutput("");
    setFeedback("");
    setIsCorrect(false);
    setHasDeductedHeart(false);
    if (editorRef.current) {
      editorRef.current.setValue(defaultCodes[language] || "");
    }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowTimeoutModal(true);
          if (!hasDeductedHeart) {
            deductHeart();
            setHasDeductedHeart(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-[#1c2452] min-h-screen flex flex-col">
      <Header />
      <div className="flex justify-between items-center p-4 border-b border-blue-500/40 backdrop-blur-md bg-white/10">
        <button onClick={() => navigate('/mainPage')} className="text-white hover:text-red-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-cyan-400 mb-0">Coding Problem</h2>
        <div className="text-sm text-white">Time Left: {timeLeft}s</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 p-4 items-center">
        <div className="w-full max-w-2xl bg-[#141a35] rounded-lg p-6 mb-4">
          <pre className="text-white whitespace-pre-wrap">{problemDescription}</pre>
        </div>
        <div className="w-full max-w-2xl flex-1 flex flex-col min-h-0">
          <div className="w-full mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="language-select" className="text-xs text-gray-300 font-semibold sm:mr-2">Language:</label>
            <select
              id="language-select"
              className="w-full sm:w-auto p-2 rounded bg-[#1A2A4B] text-white"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {availableLanguages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.label || lang.id}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-h-0 border-8 border-solid border-transparent overflow-hidden shadow-2xl mb-4"
               style={{
                 borderImageSource: 'linear-gradient(45deg, #0000ff, #0099cc)',
                 borderImageSlice: 1,
                 animation: 'gradientBorder 3s infinite'
               }}>
            <Editor
              height="300px"
              theme="vs-dark"
              language={language}
              defaultValue={defaultCodes[language] || ""}
              onMount={handleEditorDidMount}
            />
          </div>
          <button
            onClick={runCode}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transform transition-all duration-300 flex items-center justify-center"
          >
            <i className="far fa-play mr-2"></i>Run Code
          </button>
          <button
            onClick={() => handleSubmit()}
            className={`w-full mt-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transform transition-all duration-300 flex items-center justify-center ${!hasRunCode ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!hasRunCode}
          >
            <i className="far fa-check-circle mr-2"></i>Submit
          </button>
          <div className="mt-4 bg-[#1A2A4B] p-3 rounded-lg text-white font-mono min-h-[40px]">
            <div className="font-bold mb-2">Console Output:</div>
            {consoleOutput === "" ? (
              <div className="text-gray-400">No output yet.</div>
            ) : (
              <div>{consoleOutput}</div>
            )}
            {feedback && <div className="mt-2 font-bold text-cyan-300">{feedback}</div>}
          </div>
        </div>
      </div>

      {showTimeoutModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[#1A2A4B] p-6 rounded-xl text-white w-full max-w-md text-center shadow-2xl border border-blue-500/20">
            <h2 className="text-2xl font-bold mb-4">⏱ Time's Up!</h2>
            <p className="mb-4">Your time has ended. Would you like to retry or move to the next challenge?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleTryAgain}
                className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/quizWeek1")}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
              >
                Next Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}