import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";

function CodePlayground() {
  const editorRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState([]);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1F274D] text-white">
      <h2 className="text-2xl font-bold mb-4">Structify Code Playground</h2>

      {/* Code Editor */}
      <div className="w-4/5 h-[300px] border border-gray-600 rounded-lg overflow-hidden">
        <Editor
          height="300px"
          theme="vs-dark"
          defaultLanguage="csharp"
          defaultValue="// Write C# code here console.log('Hello, World!');"
          onMount={handleEditorDidMount}
        />
      </div>

      {/* Run Button */}
      <button
        onClick={runCode}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-800 text-white font-semibold rounded-lg"
      >
        Run Code
      </button>

      {/* Console Output */}
      <h3 className="text-lg font-semibold mt-4">Console Output:</h3>
      <div className="w-4/5 h-[150px] mt-2 p-3 bg-black text-green-400 font-mono overflow-y-auto border border-gray-600 rounded-lg">
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
