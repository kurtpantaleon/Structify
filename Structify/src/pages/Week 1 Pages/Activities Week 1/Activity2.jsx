import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { useGameStats } from "../../../context/gameStatsContext";
import { useLessonProgress } from "../../../context/lessonProgressContext";

const problemDescription = `
Write a function that uses a stack to check if a string of parentheses is balanced.

**Input:** A string containing only parentheses (e.g., "((()))")
**Output:** Return true if the parentheses are balanced, false otherwise

**Example:**
Input: "((()))"
Output: true

Input: "(()"
Output: false

Note: A string is balanced if:
1. Every opening parenthesis '(' has a matching closing parenthesis ')'
2. The parentheses are properly nested
`;

const defaultCodes = {
  javascript: `function isBalanced(str) {
  // Your code here
}

console.log(isBalanced("((()))")); // Should print true
console.log(isBalanced("(()")); // Should print false
`,
  python: `def is_balanced(s):
    pass

print(is_balanced("((()))"))  # Should print True
print(is_balanced("(()"))  # Should print False
`,
  cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(string s) {
}

int main() {
    cout << isBalanced("((()))") << endl;  // Should print 1 (true)
    cout << isBalanced("(()") << endl;     // Should print 0 (false)
    return 0;
}`,
  csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool IsBalanced(string s) {
    }

    static void Main() {
        Console.WriteLine(IsBalanced("((()))"));  // Should print True
        Console.WriteLine(IsBalanced("(()"));     // Should print False
    }
}`,
  java: `import java.util.Stack;

public class Main {
    public static boolean isBalanced(String s) {
    }

    public static void main(String[] args) {
        System.out.println(isBalanced("((()))"));  // Should print true
        System.out.println(isBalanced("(()"));     // Should print false
    }
}`
};

const expectedOutput = "true\nfalse";
const totalTimeInSeconds = 120;

export default function Activity2() {
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
    if (activityScores && activityScores["activity2"] !== undefined) {
      setScore(activityScores["activity2"]);
      setFeedback(`Your previous score: ${activityScores["activity2"]}/100`);
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
          output += args.join(" ") + "\n";
        };
        // eslint-disable-next-line no-eval
        eval(code);
        setConsoleOutput(output.trim());
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
      setFeedback("(Manual Check) If your output matches the expected result, you are correct!");
      setIsCorrect(false);
    }
  };

  const handleSubmit = async (force = false) => {
    if (!hasRunCode && !force) return;

    if (isCorrect) {
      const calculatedScore = 100;
      setScore(calculatedScore);
      await markActivityComplete("activity2", calculatedScore);
      navigate("/week1activity3");
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
                onClick={() => navigate("/week1activity3")}
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