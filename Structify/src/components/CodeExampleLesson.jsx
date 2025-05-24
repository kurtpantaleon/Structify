import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

function CodeExampleLesson({ title, description, codeExamples, leftIcon, rightIcon, currentIndex, nextLesson, prevLesson }) {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [availableLanguages] = useState([
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "cpp", label: "C++" }
  ]);

  // Reset console when language changes
  useEffect(() => {
    setConsoleOutput("");
  }, [language]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setIsRunning(true);
    setConsoleOutput("");
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
        setConsoleOutput(output);
        console.log = originalLog;
      } catch (err) {
        setConsoleOutput(`Error: ${err.message}`);
      }
    } else {
      setConsoleOutput("Code execution for this language is not supported in-browser. Please check the comments in the code for expected output.");
    }
    setIsRunning(false);
  };

  return (
    <div className="bg-[#1F274D] text-white px-4 sm:px-8 md:px-10 py-4 sm:py-6 flex flex-col gap-2 sm:gap-4 items-center min-h-screen md:min-h-[80vh] w-full">
      {/* Title with animated underline */}
      <div className="relative">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
      </div>

      {/* Description with fade-in animation */}
      <p className="text-center max-w-xs sm:max-w-md md:max-w-2xl text-base sm:text-lg md:text-2xl mb-4 sm:mb-6 animate-fade-in">
        {description}
      </p>

      {/* Code Example Section */}
      <div className="flex items-center justify-between w-full max-w-7xl relative">
        {/* Left arrow with hover effect */}
        <button
          onClick={prevLesson}
          disabled={currentIndex === 0}
          className={`p-2 sm:p-3 transform transition-all duration-300 ease-in-out focus:ring-2 focus:ring-white
            ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          aria-label="Previous Example"
        >
          <img
            src={leftIcon}
            alt="Previous"
            className={`h-8 w-5 sm:h-10 sm:w-6 md:h-12 md:w-7
              ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              transition-transform duration-500 ease-in-out`}
          />
        </button>

        {/* Code Editor and Console */}
        <div className="flex-1 mx-4 flex flex-col gap-4">
          {/* Top Controls with glass effect */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 bg-[#1A2A4B]/80 backdrop-blur-sm p-3 rounded-lg border border-blue-500/20 shadow-lg">
            <div className="flex items-center gap-2">
              <label htmlFor="language-select" className="text-sm text-gray-300 font-semibold">Language:</label>
              <select
                id="language-select"
                className="p-2 rounded bg-[#2A3A5B] text-white border border-blue-500/30 focus:border-blue-500 focus:outline-none transition-all duration-300"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {availableLanguages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label || lang.id}</option>
                ))}
              </select>
            </div>
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`sm:ml-auto py-2 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transform transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed ${isRunning ? 'animate-pulse' : ''}`}
            >
              {isRunning ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>

          {/* Code Editor with enhanced styling */}
          <div className="flex-1 min-h-0 border-8 border-solid border-transparent overflow-hidden shadow-2xl rounded-lg transform transition-all duration-300 hover:shadow-blue-500/20"
               style={{
                 borderImageSource: 'linear-gradient(45deg, #0000ff, #0099cc)',
                 borderImageSlice: 1,
                 animation: 'gradientBorder 3s infinite'
               }}>
            <Editor
              height="400px"
              theme="vs-dark"
              language={language}
              defaultValue={codeExamples[currentIndex][language] || ""}
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: true,
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10
                }
              }}
            />
          </div>

          {/* Console Output with enhanced styling */}
          <div className="bg-[#1A2A4B]/80 backdrop-blur-sm p-4 rounded-lg text-white font-mono min-h-[100px] max-h-[200px] overflow-y-auto border border-blue-500/30 shadow-lg transition-all duration-300 hover:shadow-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-cyan-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Console Output
              </div>
              {consoleOutput && (
                <button
                  onClick={() => setConsoleOutput("")}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {consoleOutput === "" ? (
              <div className="text-gray-400 italic animate-fade-in">No output yet. Click 'Run Code' to see the results.</div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm animate-fade-in">{consoleOutput}</pre>
            )}
          </div>
        </div>

        {/* Right arrow with hover effect */}
        <button
          onClick={nextLesson}
          disabled={currentIndex === codeExamples.length - 1}
          className={`p-2 sm:p-3 transform transition-all duration-300 ease-in-out focus:ring-2 focus:ring-white
            ${currentIndex === codeExamples.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          aria-label="Next Example"
        >
          <img
            src={rightIcon}
            alt="Next"
            className={`h-8 w-5 sm:h-10 sm:w-6 md:h-12 md:w-7
              ${currentIndex === codeExamples.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}
              transition-transform duration-500 ease-in-out`}
          />
        </button>
      </div>
    </div>
  );
}

export default CodeExampleLesson; 