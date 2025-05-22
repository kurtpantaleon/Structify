import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { openai } from "../../services/openaiConfig";
import { snippetService } from "../../services/snippetService";

const DSA_CATEGORIES = [
  { 
    id: 'arrays', 
    icon: 'far fa-table', 
    label: 'Arrays',
    query: 'Explain arrays in JavaScript with implementation examples. Cover: 1) Basic operations (access, insert, delete) 2) Common array methods 3) Time complexity for each operation 4) Example problems like two-pointer technique and sliding window. Include practical examples and optimization tips.'
  },
  { 
    id: 'linked-lists', 
    icon: 'far fa-link', 
    label: 'Linked Lists',
    query: 'Explain singly and doubly linked lists with JavaScript implementations. Cover: 1) Node structure 2) Basic operations 3) Time complexity analysis 4) Common problems like cycle detection and reversal. Include practical examples and edge cases.'
  },
  { 
    id: 'stacks', 
    icon: 'far fa-layer-group', 
    label: 'Stacks',
    query: 'Explain stack data structure with JavaScript implementation. Cover: 1) LIFO principle 2) Basic operations 3) Array vs Linked List implementation 4) Common applications like expression evaluation and backtracking. Include real-world examples.'
  },
  { 
    id: 'queues', 
    icon: 'far fa-stream', 
    label: 'Queues',
    query: 'Explain queue data structure with JavaScript implementation. Cover: 1) FIFO principle 2) Basic operations 3) Array vs Linked List implementation 4) Variations like circular and priority queues. Include practical applications.'
  },
  { 
    id: 'trees', 
    icon: 'far fa-sitemap', 
    label: 'Trees',
    query: 'Explain binary trees and BST with JavaScript implementation. Cover: 1) Tree traversal methods 2) Insertion/Deletion operations 3) Balancing techniques 4) Common problems like height calculation and validation. Include practical examples.'
  },
  { 
    id: 'graphs', 
    icon: 'far fa-project-diagram', 
    label: 'Graphs',
    query: 'Explain graph data structure with JavaScript implementation. Cover: 1) Representation methods 2) BFS and DFS traversal 3) Shortest path algorithms 4) Common problems like connectivity and cycle detection. Include real-world applications.'
  },
  { 
    id: 'sorting', 
    icon: 'far fa-sort-amount-down', 
    label: 'Sorting',
    query: 'Explain key sorting algorithms (Quick, Merge, Heap Sort) with JavaScript implementations. For each: 1) Step-by-step process 2) Time/Space complexity 3) Best/Worst cases 4) When to use each. Include optimization techniques.'
  },
  { 
    id: 'searching', 
    icon: 'far fa-search', 
    label: 'Searching',
    query: 'Explain searching algorithms (Linear, Binary, Hash-based) with JavaScript implementations. Cover: 1) Algorithm steps 2) Time complexity 3) Required conditions 4) Real-world applications. Include practical examples and optimization tips.'
  },
  { 
    id: 'recursion', 
    icon: 'far fa-redo-alt', 
    label: 'Recursion',
    query: 'Explain recursion with JavaScript examples. Cover: 1) Base case and recursive case 2) Call stack visualization 3) Common patterns 4) Converting recursion to iteration. Include practical problems and optimization techniques.'
  }
];

function CodePlayground() {
  // Add animation styles when component mounts
  useEffect(() => {
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

    const styles = document.createElement('style');
    styles.textContent = `
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
    document.head.appendChild(styles);
    return () => styles.remove();
  }, []);
  // States and refs
  const editorRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [explanation, setExplanation] = useState("");
  const [generalAnswer, setGeneralAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Memoized helper functions
  const extractComplexityInfo = useCallback((code) => {
    const timeComplexityMatch = code.match(/time complexity.*?O\([^)]+\)/i);
    const spaceComplexityMatch = code.match(/space complexity.*?O\([^)]+\)/i);

    return {
      time: timeComplexityMatch ? timeComplexityMatch[0].match(/O\([^)]+\)/)[0] : 'N/A',
      space: spaceComplexityMatch ? spaceComplexityMatch[0].match(/O\([^)]+\)/)[0] : 'N/A'
    };
  }, []);

  // Memoize loadSavedSnippets to prevent infinite loop
  const loadSavedSnippets = useCallback(async () => {
    try {
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
          return (complexityA.time.localeCompare(complexityB.time)) || 
                 (complexityA.space.localeCompare(complexityB.space));
        });
      }

      setSavedSnippets(snippets);
    } catch (error) {
      setError(`Failed to load snippets: ${error.message}`);
    }
  }, [selectedCategory, searchQuery, sortBy, extractComplexityInfo]);

  useEffect(() => {
    loadSavedSnippets();
  }, [loadSavedSnippets]);
  

  // Store editor instance
  const handleEditorDidMount = useCallback((editor, monaco) => {
    setAvailableLanguages(monaco.languages.getLanguages());
    editorRef.current = editor;
  }, []);
  // Function to execute code
  const runCode = useCallback(() => {
    if (!editorRef.current) {
      setConsoleOutput([{ type: 'error', message: 'Editor not initialized' }]);
      return;
    }

    const code = editorRef.current.getValue();
    if (!code.trim()) {
      setConsoleOutput([{ type: 'warn', message: 'No code to execute' }]);
      return;
    }

    setConsoleOutput([]); 

    try {
      let log = [];
      const startTime = performance.now();
      
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };

      // Custom console handler with safety checks
      const handleConsoleOutput = (type, ...args) => {
        try {
          const output = args.map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return '[Circular or Invalid Object]';
              }
            }
            return String(arg);
          }).join(' ');
          
          log.push({ type, message: output });
          setConsoleOutput(prev => [...prev, { type, message: output }]);
          originalConsole[type].apply(console, args);
        } catch {
          // Fallback for any console handling errors
          log.push({ type: 'error', message: 'Error in console output' });
          setConsoleOutput(prev => [...prev, { type: 'error', message: 'Error in console output' }]);
        }
      };

      // Override console methods
      console.log = (...args) => handleConsoleOutput('log', ...args);
      console.error = (...args) => handleConsoleOutput('error', ...args);
      console.warn = (...args) => handleConsoleOutput('warn', ...args);
      console.info = (...args) => handleConsoleOutput('info', ...args);

      // Execute JavaScript Code with timeout
      const timeoutMs = 5000; // 5 second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Code execution timed out (5s limit)')), timeoutMs);
      });

      Promise.race([
        new Promise((resolve) => {
          // Create a safe environment for code execution
          const safeEval = new Function('code', `
            'use strict';
            const window = undefined;
            const document = undefined;
            const localStorage = undefined;
            const sessionStorage = undefined;
            return eval(code);
          `);
          
          safeEval(code);
          resolve();
        }),
        timeoutPromise
      ]).catch(error => {
        handleConsoleOutput('error', error.message);
      }).finally(() => {
        // Restore original console methods
        Object.assign(console, originalConsole);
        
        // Log execution time
        const executionTime = performance.now() - startTime;
        handleConsoleOutput('info', `Execution time: ${executionTime.toFixed(2)}ms`);
      });

    } catch (err) {
      setConsoleOutput(prev => [...prev, { 
        type: 'error', 
        message: `Runtime Error: ${err.message}`
      }]);
    }
  }, []); // No dependencies as it only uses refs and setState

  async function askAI() {
    if (!aiPrompt) {
      setError("Please enter a query before asking the AI");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAiResponse("");
    setGeneralAnswer("");
    setExplanation("");
      try {

      const response = await openai.createCompletion([
        {
          role: "system",
          content: `You are an expert DSA tutor specializing in algorithms and data structures. Follow these guidelines:

          1) EXPLANATION FORMAT:
             - Start with a simple, clear definition
             - Use analogies from real life when possible
             - Break down complex concepts into smaller parts
          
          2) CODE EXAMPLES:
             - Provide clean, well-commented JavaScript implementations
             - Include input validation and error handling
             - Add example usage with test cases
          
          3) COMPLEXITY ANALYSIS:
             - Always specify Big O time complexity
             - Include space complexity analysis
             - Explain WHY this complexity occurs
             - Compare with alternative approaches
          
          4) BEST PRACTICES:
             - Highlight common pitfalls and how to avoid them
             - Suggest optimization techniques
             - Mention trade-offs between different approaches
          
          5) REAL-WORLD APPLICATIONS:
             - Include practical use cases
             - Mention where this DSA is used in popular software/websites
          
          Format your response with clear headings and bullet points for readability.`
        },
        {
          role: "user",
          content: aiPrompt
        }
      ]);

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error("Received invalid response from AI service");
      }

      const aiText = response.choices[0].message.content;
      
      // Parse response into sections
      const hasCodeBlock = aiText.includes("```");
      
      if (hasCodeBlock) {
        // Extract code and explanation
        const codeMatch = aiText.match(/```(?:javascript)?([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[1].trim() : "";
        const explanation = aiText.replace(/```(?:javascript)?([\s\S]*?)```/, "").trim();
        
        if (!code) {
          setGeneralAnswer(aiText);
        } else {
          setAiResponse(code);
          setExplanation(explanation);
          
          // Save snippet only if it contains code
          const category = inferDSACategory(aiPrompt);
          const complexityInfo = extractComplexityInfo(aiText);
          
          try {
            await snippetService.saveSnippet({
              prompt: aiPrompt,
              code: code,
              category,
              timeComplexity: complexityInfo.time,
              spaceComplexity: complexityInfo.space,
              algorithm: inferAlgorithmType(aiPrompt)
            });
          } catch (saveError) {
            console.error("Failed to save snippet:", saveError);
            // Don't throw here as the main AI response was successful
          }
        }
      } else {
        setGeneralAnswer(aiText);
      }      await loadSavedSnippets();

    } catch (error) {      console.error("Error:", error);
      setError(error.message || "An unexpected error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
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

  // Handle Enter key in prompt
  const handlePromptKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };
  // Handle textarea auto-height adjustment
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    function adjustTextareaHeight() {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
    }

    textarea.addEventListener('input', adjustTextareaHeight);
    // Initial adjustment
    adjustTextareaHeight();

    return () => {
      textarea.removeEventListener('input', adjustTextareaHeight);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0A1F4D] text-white overflow-hidden">
      {/* Error Display */}      
      {error && (
        <div className="fixed top-4 left-4 right-4 lg:right-auto bg-red-600 text-white p-4 rounded-lg text-sm z-50 shadow-xl animate-fade-in flex items-center space-x-3 max-w-md border-l-4 border-red-800">
          <div className="flex-shrink-0">
            <i className="far fa-exclamation-circle text-xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-1">Error Occurred</h4>
            <p className="text-red-100">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="flex-shrink-0 text-white hover:text-red-200 transition-colors"
            title="Dismiss"
          >
            <i className="far fa-times text-lg"></i>
          </button>
        </div>
      )}      {/* AI Assistant Sidebar */}
      <div className="w-full lg:w-96 bg-[#152238] flex flex-col h-[50vh] lg:h-full overflow-hidden order-2 lg:order-1">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-cyan-400 flex items-center">
            <i className="far fa-robot mr-2"></i>
            DSA Assistant
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            {/* Quick Tips */}
            <div className="bg-[#0A1F4D] p-3 rounded-lg text-sm">
              <h4 className="font-bold text-cyan-400 mb-2 flex items-center">
                <i className="far fa-lightbulb mr-2"></i>
                Quick Tips
              </h4>
              <ul className="text-gray-300 space-y-1 text-xs">
                <li>• Click on a category to get detailed explanations</li>
                <li>• Use the editor to test and modify code</li>
                <li>• Save useful snippets for later reference</li>
                <li>• Ask specific questions about DSA concepts</li>
              </ul>
            </div>
            
            {/* Category List */}
            <div>
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
                {DSA_CATEGORIES.map(category => (              <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      if (category.id !== 'all') {
                        setAiPrompt(category.query);
                        askAI();
                      }
                    }}
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
            <div>
              <div className="mb-2 sm:mb-4 space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="Search snippets..."
                    className="w-full sm:flex-1 px-3 py-2 bg-[#1A2A4B] rounded-lg text-white text-xs sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="w-full sm:w-auto px-3 py-2 bg-[#1A2A4B] rounded-lg text-white text-xs sm:text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="complexity">Sort by Complexity</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {savedSnippets.map((snippet) => (
                  <div key={snippet.id} className="bg-[#1A2A4B] p-2 sm:p-3 rounded-lg relative group 
                    hover:transform hover:scale-[1.02] transition-all border border-transparent hover:border-cyan-600">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:mb-2">
                      <div className="text-[10px] sm:text-xs text-gray-400 flex items-center">
                        <i className="far fa-clock mr-1"></i>
                        {new Date(snippet.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(snippet.code)}
                          className="text-[10px] sm:text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center"
                          title="Copy code"
                        >
                          <i className="far fa-copy"></i>
                        </button>
                        <button
                          onClick={() => deleteSnippet(snippet.id)}
                          className="text-[10px] sm:text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded-md flex items-center"
                          title="Delete snippet"
                        >
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold mb-2 text-cyan-400">{snippet.prompt}</div>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2 text-[10px] sm:text-xs">
                      <div className="bg-[#0A1F4D] p-2 rounded">
                        <span className="text-gray-400">Category:</span>
                        <span className="ml-1 text-white">{snippet.category}</span>
                      </div>
                      <div className="bg-[#0A1F4D] p-2 rounded">
                        <span className="text-gray-400">Algorithm:</span>
                        <span className="ml-1 text-white">{snippet.algorithm}</span>
                      </div>
                      <div className="bg-[#0A1F4D] p-2 rounded">
                        <span className="text-gray-400">Time:</span>
                        <span className="ml-1 text-green-400">{snippet.timeComplexity}</span>
                      </div>
                      <div className="bg-[#0A1F4D] p-2 rounded">
                        <span className="text-gray-400">Space:</span>
                        <span className="ml-1 text-yellow-400">{snippet.spaceComplexity}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <pre className="text-xs whitespace-pre-wrap mb-2 bg-[#0A1F4D] p-2 rounded max-h-32 overflow-y-auto">
                        {snippet.code}
                      </pre>
                      <button
                        onClick={() => insertCodeToEditor(snippet.code)}
                        className="absolute bottom-2 right-2 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center transform transition-all hover:scale-105"
                      >
                        <i className="far fa-code mr-1"></i> Use Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Sections */}
            {(generalAnswer || explanation || aiResponse) && (
              <div className="space-y-4">
                {generalAnswer && (
                  <div className="bg-[#1A2A4B] p-4 rounded-lg transform transition-all hover:scale-[1.02] shadow-lg">
                    <h4 className="font-bold mb-3 text-cyan-400 flex items-center gap-2">
                      <i className="far fa-comment-dots"></i>
                      General Explanation
                    </h4>
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{generalAnswer}</pre>
                    </div>
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
        </div>

        {/* AI Prompt Section - Fixed at bottom */}
        <div className="p-2 sm:p-4 bg-[#152238] border-t border-gray-700">
          <div className="relative flex flex-col gap-2 sm:gap-3">
            <div className="relative">
              <textarea
                className="w-full bg-[#1A2A4B] text-white p-3 sm:p-4 rounded-lg resize-none min-h-[80px] sm:min-h-[100px] 
                border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 
                outline-none transition-all pr-[80px] sm:pr-[90px] text-sm placeholder:text-gray-400"
                placeholder="Ask me about DSA concepts..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
              />
              <button
                onClick={askAI}
                disabled={isLoading}
                className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-600 
                         hover:bg-cyan-700 text-white rounded-lg transition-all duration-300 
                         flex items-center gap-1 sm:gap-2 text-xs sm:text-sm
                         hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <i className="far fa-spinner fa-spin"></i>
                    <span className="hidden sm:inline">Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="far fa-robot"></i>
                    <span className="hidden sm:inline">Ask AI</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-gray-400 flex items-center gap-2 px-1">
              <i className="far fa-keyboard"></i>
              <span className="text-[10px] sm:text-xs">Press Shift + Enter for new line, Enter to send</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 relative order-1 lg:order-2 h-[50vh] lg:h-full">
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

        {/* Responsive Language Selector */}
        <div className="w-full mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="language-select" className="text-xs text-gray-300 font-semibold sm:mr-2">
            Language:
          </label>
          <select
            id="language-select"
            className="w-full sm:w-auto p-2 rounded bg-[#1A2A4B] text-white"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {availableLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.id}
              </option>
            ))}
          </select>
        </div>

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
            language={language}
            defaultValue="// Write your DSA implementation here"
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
        </button>        {/* Console Output */}
        <div className="h-32 sm:h-40 mt-2 sm:mt-4 p-2 sm:p-3 bg-[#1A2A4B] font-mono overflow-y-auto rounded-lg">
          <div className="font-bold mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <i className="far fa-terminal mr-2"></i>
              <span className="text-xs sm:text-base">Console Output:</span>
            </div>
            <button
              onClick={() => setConsoleOutput([])}
              className="text-[10px] sm:text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center"
              title="Clear console"
            >
              <i className="far fa-trash-alt mr-1"></i>
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
          {consoleOutput.map((output, index) => (
            <div 
              key={index} 
              className={`text-xs sm:text-sm font-mono mb-1 ${
                output.type === 'error' ? 'text-red-400' :
                output.type === 'warn' ? 'text-yellow-400' :
                output.type === 'info' ? 'text-cyan-400' :
                'text-green-400'
              }`}
            >
              {output.type === 'error' && <i className="far fa-times-circle mr-2" />}
              {output.type === 'warn' && <i className="far fa-exclamation-triangle mr-2" />}
              {output.type === 'info' && <i className="far fa-info-circle mr-2" />}
              {output.type === 'log' && <i className="far fa-arrow-right mr-2" />}
              {output.message}
            </div>
          ))}
          {consoleOutput.length === 0 && (
            <div className="text-gray-500 text-xs sm:text-sm italic">
              No output yet. Run your code to see results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodePlayground;
