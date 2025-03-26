import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate
import Editor from "@monaco-editor/react";

function CodePlayground() {
  const editorRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const navigate = useNavigate(); // Hook to navigate to other pages

  // Store editor instance
  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  // Function to execute code
  function runCode() {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();
    setConsoleOutput([]); // Clear console before running new code

    try {
      let log = [];
      
      // Override console.log to capture output
      console.oldLog = console.log;
      console.log = function (message) {
        log.push(message);
        setConsoleOutput((prev) => [...prev, message]);
        console.oldLog.apply(console, arguments);
      };

      // Execute JavaScript Code (For C#, this needs a backend)
      new Function(code)();

      // Restore original console.log
      console.log = console.oldLog;

    } catch (error) {
      setConsoleOutput((prev) => [...prev, "Error: " + error.message]);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0A1F4D] text-white">
      {/* Exit Button */}
      <button
        onClick={() => navigate('/mainPage')} // Navigate to main page or a specific exit page
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400 animate-pulse">Structify Code Playground</h2>

      {/* Code Editor */}
      <div className="w-4/5 h-[300px] border border-blue-700 rounded-lg overflow-hidden shadow-lg">
        <Editor
          height="300px"
          theme="vs-dark"
          defaultLanguage="javascript"
          defaultValue="// Write your code here console.log('Hello, World!');"
          onMount={handleEditorDidMount}
        />
      </div>

      {/* Run Button */}
      <button
        onClick={runCode}
        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        Run Code
      </button>

      {/* Console Output */}
      <h3 className="text-lg font-semibold mt-6">Console Output:</h3>
      <div className="w-4/5 h-[150px] mt-3 p-3 bg-[#1A2A4B] text-green-400 font-mono overflow-y-auto border border-blue-800 rounded-lg shadow-xl">
        {consoleOutput.map((line, index) => (
          <div key={index} className="text-sm">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CodePlayground;
