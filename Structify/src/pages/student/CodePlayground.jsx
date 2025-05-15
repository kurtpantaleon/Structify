import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { openai } from "../../services/openaiConfig";
import { snippetService } from "../../services/snippetService";

const DSA_CATEGORIES = [
  'arrays',
  'linked-lists', 
  'stacks',
  'queues',
  'trees',
  'graphs',
  'sorting',
  'searching',
  'recursion'
];

// Keyframe for animated gradient border
const gradientAnimation = `
@keyframes gradientBorder {
  0% {
    border-image-source: linear-gradient(45deg, #0000ff, #0099cc);
  }
  50% {
    border-image-source: linear-gradient(45deg, #0099cc, #0000ff);
  }
  100% {
    border-image-source: linear-gradient(45deg, #0000ff, #0099cc);
  }
}
`;

function CodePlayground() {
  const editorRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [explanation, setExplanation] = useState(""); // Added for explanation
  const [generalAnswer, setGeneralAnswer] = useState(""); // Added for general answers
  const [isLoading, setIsLoading] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Load saved snippets on component mount
  useEffect(() => {
    loadSavedSnippets();
  }, [selectedCategory]);

  async function loadSavedSnippets() {
    if (selectedCategory === 'all') {
      const snippets = await snippetService.getSnippets();
      setSavedSnippets(snippets);
    } else {
      const snippets = await snippetService.getSnippetsByCategory(selectedCategory);
      setSavedSnippets(snippets);
    }
  }

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

  async function askAI() {
    if (!aiPrompt) return;
    
    setIsLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a comprehensive AI assistant specializing in data structures and algorithms. 
            Provide detailed responses in the following format:
            1) For ALL questions: Give a clear, conceptual explanation first
            2) For code-related questions: Include relevant JavaScript code examples
            3) For algorithm questions: Include time and space complexity analysis
            4) For general questions: Provide real-world examples and applications
            Always aim to be educational and engaging in your responses.`
          },
          {
            role: "user",
            content: aiPrompt
          }
        ]
      });

      const aiText = response.choices[0].message.content;
      
      // Parse response into sections
      const hasCodeBlock = aiText.includes("```");
      
      if (hasCodeBlock) {
        // Extract code and explanation
        const codeMatch = aiText.match(/```(?:javascript)?([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[1].trim() : "";
        const explanation = aiText.replace(/```(?:javascript)?([\s\S]*?)```/, "").trim();
        
        setAiResponse(code);
        setExplanation(explanation);
        setGeneralAnswer("");
        
        // Save snippet only if it contains code
        const category = inferDSACategory(aiPrompt);
        const complexityInfo = extractComplexityInfo(aiText);
        
        await snippetService.saveSnippet({
          prompt: aiPrompt,
          code: code,
          category,
          timeComplexity: complexityInfo.time,
          spaceComplexity: complexityInfo.space,
          algorithm: inferAlgorithmType(aiPrompt)
        });
      } else {
        // For non-code questions, put the entire response in the general answer
        setGeneralAnswer(aiText);
        setAiResponse("");
        setExplanation("");
      }

      await loadSavedSnippets();

    } catch (error) {
      console.error("Error calling OpenAI:", error);
      setAiResponse("Sorry, there was an error processing your request. Please try again.");
      setGeneralAnswer("");
      setExplanation("");
    }
    setIsLoading(false);
  }

  async function deleteSnippet(id) {
    await snippetService.deleteSnippet(id);
    await loadSavedSnippets();
  }

  function insertCodeToEditor(code) {
    if (editorRef.current) {
      editorRef.current.setValue(code);
    }
  }

  function inferDSACategory(prompt) {
    const promptLower = prompt.toLowerCase();
    return DSA_CATEGORIES.find(category => 
      promptLower.includes(category.replace('-', ' '))
    ) || 'general';
  }

  function inferAlgorithmType(prompt) {
    const promptLower = prompt.toLowerCase();
    const commonAlgorithms = {
      'binary search': 'searching',
      'quick sort': 'sorting',
      'merge sort': 'sorting',
      'depth first': 'graph-traversal',
      'breadth first': 'graph-traversal'
    };

    for (const [algo, type] of Object.entries(commonAlgorithms)) {
      if (promptLower.includes(algo)) return type;
    }
    return 'N/A';
  }

  function extractComplexityInfo(code) {
    const timeComplexityMatch = code.match(/time complexity.*?O\([^)]+\)/i);
    const spaceComplexityMatch = code.match(/space complexity.*?O\([^)]+\)/i);

    return {
      time: timeComplexityMatch ? timeComplexityMatch[0].match(/O\([^)]+\)/)[0] : 'N/A',
      space: spaceComplexityMatch ? spaceComplexityMatch[0].match(/O\([^)]+\)/)[0] : 'N/A'
    };
  }

  return (
    <div className="flex h-screen bg-[#0A1F4D] text-white">
      {/* AI Assistant Sidebar */}
      <div className="w-96 bg-[#152238] p-4 overflow-y-auto border-r border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-cyan-400">DSA Assistant</h3>
        
        {/* Category Filter */}
        <select 
          className="w-full mb-4 p-2 bg-[#1A2A4B] text-white rounded-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {DSA_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
        
        <div className="mb-4">
          <textarea
            className="w-full h-32 bg-[#1A2A4B] text-white p-2 rounded-lg resize-none"
            placeholder="Ask for DSA implementations, complexity analysis, or optimizations..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <button
            onClick={askAI}
            disabled={isLoading}
            className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            {isLoading ? "Thinking..." : "Ask DSA Assistant"}
          </button>
        </div>

        {generalAnswer && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">General Explanation:</h4>
            <div className="bg-[#1A2A4B] p-3 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generalAnswer}</pre>
            </div>
          </div>
        )}

        {explanation && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">Explanation:</h4>
            <div className="bg-[#1A2A4B] p-3 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{explanation}</pre>
            </div>
          </div>
        )}

        {aiResponse && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">AI Response:</h4>
            <div className="bg-[#1A2A4B] p-3 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{aiResponse}</pre>
              <button
                onClick={() => insertCodeToEditor(aiResponse)}
                className="mt-2 px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
              >
                Use This Code
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-bold mb-2">Saved DSA Snippets:</h4>
          <div className="space-y-3">
            {savedSnippets.map((snippet) => (
              <div key={snippet.id} className="bg-[#1A2A4B] p-3 rounded-lg relative group">
                <div className="text-xs text-gray-400 mb-1">
                  {new Date(snippet.timestamp).toLocaleString()}
                </div>
                <div className="text-sm font-bold mb-1">{snippet.prompt}</div>
                <div className="text-xs text-cyan-400 mb-1">
                  Category: {snippet.category} | Time: {snippet.timeComplexity} | Space: {snippet.spaceComplexity}
                </div>
                <pre className="text-xs whitespace-pre-wrap mb-2">
                  {snippet.code.substring(0, 100)}...
                </pre>
                <div className="flex space-x-2">
                  <button
                    onClick={() => insertCodeToEditor(snippet.code)}
                    className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => deleteSnippet(snippet.id)}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 relative">
        <button
          onClick={() => navigate('/mainPage')}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">DSA Code Playground</h2>

        {/* Code Editor */}
        <div className="flex-1 border-8 border-solid border-transparent overflow-hidden shadow-2xl mb-4"
             style={{
               borderImageSource: 'linear-gradient(45deg, #0000ff, #0099cc)',
               borderImageSlice: 1,
               animation: 'gradientBorder 3s infinite'
             }}>
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            defaultValue="// Write your DSA implementation here
            // Example:
            function binarySearch(arr, target) {
              let left = 0;
              let right = arr.length - 1;
              
              while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (arr[mid] === target) return mid;
                if (arr[mid] < target) left = mid + 1;
                else right = mid - 1;
              }
              
              return -1;
            }

            // Test the implementation
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            console.log(binarySearch(array, 5)); // Expected: 4"
            onMount={handleEditorDidMount}
          />
        </div>

        {/* Run Button */}
        <button
          onClick={runCode}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
        >
          Run Code
        </button>

        {/* Console Output */}
        <div className="h-40 mt-4 p-3 bg-[#1A2A4B] text-green-400 font-mono overflow-y-auto rounded-lg">
          <div className="font-bold mb-2">Console Output:</div>
          {consoleOutput.map((line, index) => (
            <div key={index} className="text-sm">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodePlayground;
