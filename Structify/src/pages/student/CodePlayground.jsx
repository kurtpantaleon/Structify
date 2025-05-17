import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { openai } from "../../services/openaiConfig";
import { snippetService } from "../../services/snippetService";

const DSA_CATEGORIES = [
  { id: 'arrays', icon: 'far fa-table', label: 'Arrays' },
  { id: 'linked-lists', icon: 'far fa-link', label: 'Linked Lists' },
  { id: 'stacks', icon: 'far fa-layer-group', label: 'Stacks' },
  { id: 'queues', icon: 'far fa-stream', label: 'Queues' },
  { id: 'trees', icon: 'far fa-sitemap', label: 'Trees' },
  { id: 'graphs', icon: 'far fa-project-diagram', label: 'Graphs' },
  { id: 'sorting', icon: 'far fa-sort-amount-down', label: 'Sorting' },
  { id: 'searching', icon: 'far fa-search', label: 'Searching' },
  { id: 'recursion', icon: 'far fa-redo-alt', label: 'Recursion' }
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

// Add loading animation keyframes
const animations = `
${gradientAnimation}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [creditInfo, setCreditInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load saved snippets on component mount
  useEffect(() => {
    loadSavedSnippets();
  }, [selectedCategory, searchQuery, sortBy]);

  // Add useEffect to fetch credit info
  useEffect(() => {
    updateCreditInfo();
  }, []);

  async function loadSavedSnippets() {
    let snippets;
    if (selectedCategory === 'all') {
      snippets = await snippetService.getSnippets();
    } else {
      snippets = await snippetService.getSnippetsByCategory(selectedCategory);
    }

    // Filter snippets by search query
    if (searchQuery) {
      snippets = snippets.filter(snippet => 
        snippet.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort snippets
    if (sortBy === "date") {
      snippets.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === "complexity") {
      snippets.sort((a, b) => {
        const complexityA = extractComplexityInfo(a.code);
        const complexityB = extractComplexityInfo(b.code);
        
        // Compare time complexity first, then space complexity
        return (complexityA.time.localeCompare(complexityB.time)) || 
               (complexityA.space.localeCompare(complexityB.space));
      });
    }

    setSavedSnippets(snippets);
  }

  const updateCreditInfo = () => {
    const usage = openai.getCreditUsage();
    setCreditInfo(usage);
  };

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
    setError(null);
    
    try {
      const response = await openai.createCompletion([
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
      ]);

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
        setGeneralAnswer(aiText);
        setAiResponse("");
        setExplanation("");
      }

      // Update credit info after successful request
      updateCreditInfo();
      await loadSavedSnippets();

    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      setAiResponse("");
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
    const category = DSA_CATEGORIES.find(cat => 
      promptLower.includes(cat.id.replace('-', ' '))
    );
    return category ? category.id : 'general';
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

  // Handle Enter key in prompt
  const handlePromptKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div className="flex h-screen bg-[#0A1F4D] text-white">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-4 bg-red-600 text-white p-3 rounded-lg text-sm z-50 shadow-lg animate-fade-in flex items-center space-x-2 max-w-md">
          <i className="far fa-exclamation-circle"></i>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-white hover:text-red-200"
          >
            <i className="far fa-times"></i>
          </button>
        </div>
      )}

      {/* AI Assistant Sidebar */}
      <div className="w-96 bg-[#152238] p-4 overflow-y-auto border-r border-gray-700 flex flex-col">
        <h3 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
          <i className="far fa-robot mr-2"></i>
          DSA Assistant
        </h3>
        
        {/* Category List */}
        <div className="flex-1">
          <h4 className="font-bold mb-2 text-gray-300">Categories</h4>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'hover:bg-[#1A2A4B] text-gray-300'
              }`}
            >
              <i className="far fa-folder mr-2"></i>
              All Categories
            </button>
            {DSA_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                  selectedCategory === category.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-[#1A2A4B] text-gray-300'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Snippets Section */}
        <div className="flex-1 overflow-y-auto mt-4">
          <h4 className="font-bold mb-2 text-gray-300 flex items-center">
            <i className="far fa-code mr-2"></i>
            Saved DSA Snippets
          </h4>
          <div className="space-y-3">
            {savedSnippets.map((snippet) => (
              <div key={snippet.id} className="bg-[#1A2A4B] p-3 rounded-lg relative group hover:transform hover:scale-[1.02] transition-all">
                <div className="text-xs text-gray-400 mb-1 flex items-center">
                  <i className="far fa-clock mr-1"></i>
                  {new Date(snippet.timestamp).toLocaleString()}
                </div>
                <div className="text-sm font-bold mb-1">{snippet.prompt}</div>
                <div className="text-xs text-cyan-400 mb-1">
                  <i className="far fa-tag mr-1"></i>
                  Category: {snippet.category} | Time: {snippet.timeComplexity} | Space: {snippet.spaceComplexity}
                </div>
                <pre className="text-xs whitespace-pre-wrap mb-2">
                  {snippet.code.substring(0, 100)}...
                </pre>
                <div className="flex space-x-2">
                  <button
                    onClick={() => insertCodeToEditor(snippet.code)}
                    className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center"
                  >
                    <i className="far fa-code mr-1"></i> Use
                  </button>
                  <button
                    onClick={() => deleteSnippet(snippet.id)}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded-md flex items-center"
                  >
                    <i className="far fa-trash-alt mr-1"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Prompt Section */}
        <div className="mt-4 border-t border-gray-700 pt-4">
          <div className="relative">
            <textarea
              className="w-full h-24 bg-[#1A2A4B] text-white p-2 rounded-lg resize-none pr-24"
              placeholder="Ask for DSA implementations, complexity analysis, or optimizations..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
            />
            <button
              onClick={askAI}
              disabled={isLoading}
              className={`absolute right-2 bottom-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all flex items-center
                ${isLoading ? 'animate-pulse' : 'hover:scale-105'}`}
            >
              {isLoading ? (
                <>
                  <i className="far fa-spinner fa-spin mr-2"></i>
                  Thinking...
                </>
              ) : (
                <>
                  <i className="far fa-lightbulb mr-2"></i>
                  Ask AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response Sections */}
        {(generalAnswer || explanation || aiResponse) && (
          <div className="mt-4 space-y-4 border-t border-gray-700 pt-4">
            {generalAnswer && (
              <div className="bg-[#1A2A4B] p-3 rounded-lg transform transition-all hover:scale-[1.02]">
                <h4 className="font-bold mb-2 flex items-center">
                  <i className="far fa-comment-dots mr-2"></i>
                  General Explanation:
                </h4>
                <pre className="whitespace-pre-wrap text-sm">{generalAnswer}</pre>
              </div>
            )}

            {explanation && (
              <div className="bg-[#1A2A4B] p-3 rounded-lg transform transition-all hover:scale-[1.02]">
                <h4 className="font-bold mb-2 flex items-center">
                  <i className="far fa-book mr-2"></i>
                  Explanation:
                </h4>
                <pre className="whitespace-pre-wrap text-sm">{explanation}</pre>
              </div>
            )}

            {aiResponse && (
              <div className="bg-[#1A2A4B] p-3 rounded-lg transform transition-all hover:scale-[1.02]">
                <h4 className="font-bold mb-2 flex items-center">
                  <i className="far fa-file-code mr-2"></i>
                  Code Solution:
                </h4>
                <pre className="whitespace-pre-wrap text-sm">{aiResponse}</pre>
                <button
                  onClick={() => insertCodeToEditor(aiResponse)}
                  className="mt-2 px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm flex items-center transform transition-all hover:scale-105"
                >
                  <i className="far fa-paste mr-2"></i>
                  Use This Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 relative">
        <button
          onClick={() => navigate('/mainPage')}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-300"
        >
          <i className="far fa-times text-xl"></i>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          <i className="far fa-laptop-code mr-2"></i>
          Code Playground
        </h2>

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
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transform transition-all duration-300  flex items-center justify-center"
        >
          <i className="far fa-play mr-2"></i>
          Run Code
        </button>

        {/* Console Output */}
        <div className="h-40 mt-4 p-3 bg-[#1A2A4B] text-green-400 font-mono overflow-y-auto rounded-lg">
          <div className="font-bold mb-2 flex items-center">
            <i className="far fa-terminal mr-2"></i>
            Console Output:
          </div>
          {consoleOutput.map((line, index) => (
            <div key={index} className="text-sm">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodePlayground;
