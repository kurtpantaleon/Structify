import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, CheckCircle2, Clock, Trophy, AlertTriangle, Terminal, Heart, Zap, ArrowLeft } from 'lucide-react';
import { getSocket, reconnectSocket } from '../../services/socketService';
import { recordMatch } from '../../utils/recordMatch';
import { useGameStats } from '../../context/gameStatsContext';

const challenges = [
  {
    id: 1,
    title: "FizzBuzz Challenge",
    description: "Write a function that returns 'Fizz' for numbers divisible by 3, 'Buzz' for numbers divisible by 5, and 'FizzBuzz' for numbers divisible by both.",
    initialCode: `function fizzBuzz(n) {
  // Your code here
}`,
    testCases: [
      { input: "3", expected: "Fizz" },
      { input: "5", expected: "Buzz" },
      { input: "15", expected: "FizzBuzz" },
      { input: "7", expected: "7" }
    ],
    difficulty: "Easy"
  },
  {
    id: 2,
    title: "Palindrome Checker",
    description: "Write a function to check if a string is a palindrome (reads the same backwards as forwards).",
    initialCode: `function isPalindrome(str) {
  // Your code here
}`,
    testCases: [
      { input: "'racecar'", expected: "true" },
      { input: "'hello'", expected: "false" },
      { input: "'A man, a plan, a canal: Panama'", expected: "true" },
      { input: "'10801'", expected: "true" }
    ],
    difficulty: "Easy"
  },
  {
    id: 3,
    title: "Array Sum",
    description: "Write a function that returns the sum of all numbers in an array.",
    initialCode: `function arraySum(arr) {
  // Your code here
}`,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expected: "15" },
      { input: "[-1, -2, -3, -4]", expected: "-10" },
      { input: "[]", expected: "0" },
      { input: "[99]", expected: "99" }
    ],
    difficulty: "Easy"
  },
  {
    id: 4,
    title: "Reverse Words",
    description: "Write a function that reverses each word in a string while maintaining the word order.",
    initialCode: `function reverseWords(str) {
  // Your code here
}`,
    testCases: [
      { input: "'Hello World'", expected: "'olleH dlroW'" },
      { input: "'JavaScript is fun'", expected: "'tpircSavaJ si nuf'" },
      { input: "'a'", expected: "'a'" },
      { input: "''", expected: "''" }
    ],
    difficulty: "Medium"
  },
  {
    id: 5,
    title: "Find Missing Number",
    description: "Find the missing number in an array containing distinct numbers from 0 to n.",
    initialCode: `function findMissingNumber(nums) {
  // Your code here
}`,
    testCases: [
      { input: "[3, 0, 1]", expected: "2" },
      { input: "[9, 6, 4, 2, 3, 5, 7, 0, 1]", expected: "8" },
      { input: "[0]", expected: "1" },
      { input: "[1, 0, 3]", expected: "2" }
    ],
    difficulty: "Medium"
  },
  {
    id: 6,
    title: "Anagram Check",
    description: "Write a function to check if two strings are anagrams (contain the same characters with the same frequency).",
    initialCode: `function areAnagrams(str1, str2) {
  // Your code here
}`,
    testCases: [
      { input: "'listen', 'silent'", expected: "true" },
      { input: "'hello', 'world'", expected: "false" },
      { input: "'cinema', 'iceman'", expected: "true" },
      { input: "'', ''", expected: "true" }
    ],
    difficulty: "Medium"
  },
  {
    id: 7,
    title: "Binary Search",
    description: "Implement a binary search algorithm to find the index of a target value in a sorted array.",
    initialCode: `function binarySearch(arr, target) {
  // Your code here
  // Return -1 if target is not found
}`,
    testCases: [
      { input: "[1, 2, 3, 4, 5], 3", expected: "2" },
      { input: "[1, 2, 3, 4, 5], 6", expected: "-1" },
      { input: "[1, 3, 5, 7, 9], 5", expected: "2" },
      { input: "[], 5", expected: "-1" }
    ],
    difficulty: "Hard"
  },
  {
    id: 8,
    title: "Valid Parentheses",
    description: "Write a function to determine if a string containing only parentheses ('(', ')', '{', '}', '[', ']') is valid.",
    initialCode: `function isValidParentheses(s) {
  // Your code here
}`,
    testCases: [
      { input: "'()'", expected: "true" },
      { input: "'()[]{}'", expected: "true" },
      { input: "'(]'", expected: "false" },
      { input: "'([)]'", expected: "false" },
      { input: "'{[]}'", expected: "true" }
    ],
    difficulty: "Hard"
  }
];

export default function CodingChallenge({ matchId, opponent, currentUser, onCompleteChallenge, onTimeUp, difficulty = 'Easy' }) {
  const navigate = useNavigate();
  const { addRankPoints } = useGameStats();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passedTests, setPassedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);  
  const [timeLeft, setTimeLeft] = useState(420); 
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [completionTime, setCompletionTime] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [completionType, setCompletionType] = useState(''); // 'win', 'lose', or 'timeout'
    // Request challenge assignment when the component mounts
  useEffect(() => {
    // Make sure we have a working socket connection
    const socket = getSocket();
    
    // If socket is not connected, try to reconnect
    if (!socket.connected) {
      reconnectSocket();
    }
    
    console.log("Challenge component - Socket status:", socket.connected ? "Connected" : "Disconnected");
    
    // Filter challenges by difficulty if specified
    const difficultyFiltered = difficulty ? 
      challenges.filter(c => c.difficulty === difficulty) : 
      challenges;
    
    // If no challenges match the difficulty, fall back to all challenges
    const eligibleChallenges = difficultyFiltered.length > 0 ? 
      difficultyFiltered : 
      challenges;
    
    // Generate a random challenge ID to suggest to the server
    const randomIndex = Math.floor(Math.random() * eligibleChallenges.length);
    const suggestedChallengeId = eligibleChallenges[randomIndex].id;
    
    // Set up listener for challenge assignment
    const handleChallengeAssignment = (data) => {
      if (data.matchId === matchId) {
        const assignedChallenge = challenges.find(c => c.id === data.challengeId);
        if (assignedChallenge) {
          setChallenge(assignedChallenge);
          setCode(assignedChallenge.initialCode);
          setTotalTests(assignedChallenge.testCases.length);
          setIsLoadingChallenge(false);
        }
      }
    };
    
    socket.on('assignChallenge', handleChallengeAssignment);
    
    // Send challenge selection to server
    if (socket.connected) {
      console.log("Sending challengeSelected event");
      socket.emit('challengeSelected', { 
        matchId, 
        challengeId: suggestedChallengeId,
        difficulty: difficulty
      });
    } else {
      console.warn("Socket not connected, waiting for connection to send challengeSelected event");
      
      // Add a one-time connect listener to emit the event when connected
      socket.once('connect', () => {
        console.log("Socket reconnected, sending challengeSelected event");
        socket.emit('challengeSelected', { 
          matchId, 
          challengeId: suggestedChallengeId,
          difficulty: difficulty
        });
      });
    }
    
    // Set loading state to false once challenge is received
    const timeoutId = setTimeout(() => {
      // If we don't get a response within 5 seconds, use default challenge as fallback
      if (isLoadingChallenge) {
        const defaultChallenge = challenges[0];
        setChallenge(defaultChallenge);
        setCode(defaultChallenge.initialCode);
        setTotalTests(defaultChallenge.testCases.length);
        setIsLoadingChallenge(false);
        console.warn('Challenge synchronization timed out, using default challenge');
      }
    }, 5000);
    
    return () => {
      socket.off('assignChallenge', handleChallengeAssignment);
      clearTimeout(timeoutId);
    };
  }, [matchId, isLoadingChallenge, difficulty]);
  // Set up socket event listeners for opponent progress and quitting
  useEffect(() => {
    // Get socket instance from our service
    const socket = getSocket();
    
    // If socket is not connected, try to reconnect
    if (!socket.connected) {
      reconnectSocket();
    }
    
    const handleOpponentProgress = (data) => {
      if (data.matchId === matchId) {
        setOpponentProgress(data.progress);
        
        if (data.completed && !winner) {
          setWinner(opponent.name);
          setChallengeComplete(true);
          setCompletionType('lose');
          setCompletionMessage(`${opponent.name} completed the challenge first!`);
          setShowCompletionModal(true);
        }
      }
    };
    
    const handleOpponentQuit = (data) => {
      if (data.matchId === matchId) {
        setOpponentQuit(true);
        setWinner(currentUser.name);
        setChallengeComplete(true);
        setCompletionType('win');
        setCompletionMessage('Your opponent left the match. Victory by forfeit!');
        setShowCompletionModal(true);
        if (typeof addRankPoints === 'function') {
          addRankPoints(50);
        }
      }
    };
    
    const handleOpponentReconnected = (data) => {
      if (data.matchId === matchId) {
        setOpponentQuit(false);
        setOpponentProgress(0);
      }
    };
    
    // Register event handlers
    socket.on('opponentProgress', handleOpponentProgress);
    socket.on('opponentQuit', handleOpponentQuit);
    socket.on('opponentReconnected', handleOpponentReconnected);
    
    // Register reconnect listener to re-emit events
    socket.io.on('reconnect', () => {
      console.log("Socket reconnected - re-registering with the match");
      if (matchId) {
        socket.emit('heartbeat', { matchId });
      }
    });
    
    return () => {
      // Clean up event listeners
      socket.off('opponentProgress', handleOpponentProgress);
      socket.off('opponentQuit', handleOpponentQuit);
      socket.off('opponentReconnected', handleOpponentReconnected);
      socket.io.off('reconnect');
    };
  }, [matchId, opponent, winner, currentUser, onCompleteChallenge, challenge, startTime]);
    // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!challengeComplete) {
            setChallengeComplete(true);
            
            // Calculate completion time in seconds (for statistics)
            const endTime = Date.now();
            const timeTaken = Math.floor((endTime - (startTime || endTime)) / 1000);
            setCompletionTime(timeTaken);
            
            // Call onTimeUp handler with challenge data
            if (onTimeUp) onTimeUp(challenge, timeTaken);

            // Record match in Firestore (opponent wins by timeout)
            recordMatch({
              player1: { uid: currentUser?.uid, name: currentUser?.name || 'You' },
              player2: { uid: opponent?.userId, name: opponent?.name },
              winnerUid: opponent?.userId,
              challengeId: challenge?.id,
              difficulty: challenge?.difficulty,
              completionTime: timeTaken,
            });

            // Show timeout modal
            setCompletionType('timeout');
            setCompletionMessage('Time\'s up! Keep practicing to improve your speed!');
            setShowCompletionModal(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [challengeComplete, onTimeUp, challenge, startTime]);
  
  // Listen for matchEnded event to lock the editor and show modal if opponent wins
  useEffect(() => {
    const socket = getSocket();
    const handleMatchEnded = (data) => {
      // Only act if the matchId matches
      if (data.matchId === matchId) {
        // If current user is not the winner, show lose modal
        if (data.winnerUid !== currentUser?.uid) {
          setChallengeComplete(true);
          setWinner(opponent?.name || 'Opponent');
          setCompletionType('lose');
          setCompletionMessage(`${opponent?.name || 'Opponent'} completed the challenge first!`);
          setShowCompletionModal(true);
        }
      }
    };
    socket.on('matchEnded', handleMatchEnded);
    return () => socket.off('matchEnded', handleMatchEnded);
  }, [matchId, currentUser, opponent]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };
  
  const runTests = async () => {
    const socket = getSocket();
    setIsSubmitting(true);
    setOutput("");
    setError(null);
    
    try {
      // Evaluate the code (this is a simple implementation - in production, use a safer approach)
      const userFunc = new Function(`return ${code}`)();
      let passed = 0;
      let results = [];
      
      for (const testCase of challenge.testCases) {
        try {
          // Parse the input string to JS value
          const inputValue = eval(testCase.input);
          // Call the user's function
          const result = userFunc(inputValue);
          // Convert result to string for comparison
          const resultStr = String(result);
          
          const isPassed = resultStr === testCase.expected;
          if (isPassed) passed++;
          
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            result: resultStr,
            passed: isPassed
          });
        } catch (err) {
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            result: "Error: " + err.message,
            passed: false
          });
        }
      }
      
      // Update passed tests
      setPassedTests(passed);
      
      // Format results for output
      const outputText = results.map((res, idx) => 
        `Test ${idx + 1}: ${res.passed ? '✅ Passed' : '❌ Failed'}\n` +
        `  Input: ${res.input}\n` +
        `  Expected: ${res.expected}\n` +
        `  Your output: ${res.result}\n`
      ).join('\n');
      
      setOutput(outputText);
      
      // Calculate progress percentage
      const progress = Math.floor((passed / challenge.testCases.length) * 100);
      
      // Send progress update to server
      socket.emit('updateProgress', { 
        matchId, 
        userId: currentUser?.uid,
        progress,
        completed: passed === challenge.testCases.length
      });
      
      // If all tests passed, show completion modal
      if (passed === challenge.testCases.length) {
        setChallengeComplete(true);
        setWinner(currentUser?.name || 'You');
        setCompletionType('win');
        setCompletionMessage('Congratulations! You completed the challenge first!');
        setShowCompletionModal(true);
        
        // Calculate completion time in seconds
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - (startTime || endTime)) / 1000);
        setCompletionTime(timeTaken);
        
        if (onCompleteChallenge) {
          onCompleteChallenge(true, 'solved', challenge, timeTaken);
        }

        // Record match in Firestore
        recordMatch({
          player1: { uid: currentUser?.uid, name: currentUser?.name || 'You' },
          player2: { uid: opponent?.userId, name: opponent?.name },
          winnerUid: currentUser?.uid,
          challengeId: challenge?.id,
          difficulty: challenge?.difficulty,
          completionTime: timeTaken,
        });

        // Award 50 rank points to the winner
        if (typeof addRankPoints === 'function') {
          addRankPoints(50);
        }
      }
      
    } catch (err) {
      setError("Error in your code: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!challenge || isLoadingChallenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1444] to-[#1a1f60] text-white p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Synchronizing challenge with opponent...</p>
        <p className="text-sm text-blue-300 mt-2">Ensuring both players receive the same challenge</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header with Challenge Info and Timer */}
      <div className="bg-[#151f4b] p-4 flex justify-between items-center border-b border-blue-800">
        <div className="flex items-center">
          <Code className="text-blue-400 mr-2" />
          <h2 className="text-xl font-bold">{challenge.title}</h2>
          <span className={`ml-3 px-2 py-1 rounded text-xs font-semibold ${
            challenge.difficulty === 'Easy' ? 'bg-green-600' : 
            challenge.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-full">
            <Clock className="text-blue-400 w-4 h-4 mr-1" />
            <span className={`font-mono ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-blue-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={() => navigate('/CodeChallengeLobby')} 
            className="flex items-center text-sm bg-red-500/20 hover:bg-red-500/40 px-3 py-1 rounded-md transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Exit
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Challenge Description & Progress */}
        <div className="w-1/4 bg-[#18204e] p-4 flex flex-col overflow-y-auto border-r border-blue-800">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Challenge</h3>
            <p className="text-sm text-gray-200">{challenge.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
            <div className="space-y-2">
              {challenge.testCases.map((test, idx) => (
                <div key={idx} className="text-xs bg-blue-900/20 p-2 rounded">
                  <div><span className="text-blue-300">Input:</span> {test.input}</div>
                  <div><span className="text-green-300">Expected:</span> {test.expected}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-blue-800/50">
            <h3 className="text-lg font-semibold mb-3">Battle Progress</h3>
            
            {/* Your Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">You ({passedTests}/{totalTests})</span>
                <span className="text-sm font-medium">{Math.floor((passedTests / totalTests) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${(passedTests / totalTests) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Opponent Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{opponent?.name || 'Opponent'}</span>
                <span className="text-sm font-medium">{opponentProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${opponentProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Code Editor and Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <textarea
              className="w-full h-full bg-[#1d2450] text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
              value={code}
              onChange={handleCodeChange}
              disabled={challengeComplete}
              spellCheck="false"
            />
          </div>
          
          {/* Output Panel */}
          <div className="h-1/3 border-t border-blue-800 bg-[#151f4b] p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold flex items-center">
                <Terminal className="w-4 h-4 mr-1" /> Output
              </h3>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center ${
                    isSubmitting || challengeComplete
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  onClick={runTests}
                  disabled={isSubmitting || challengeComplete}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {isSubmitting ? 'Running...' : 'Run Tests'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 p-3 rounded mb-3 flex items-start">
                <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                <pre className="text-red-300 text-xs overflow-auto whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            )}
            
            {output && (
              <pre className="text-gray-200 text-xs overflow-auto whitespace-pre-wrap font-mono bg-[#111a3e] p-3 rounded max-h-40">
                {output}
              </pre>
            )}              {challengeComplete && (
              <div className={`mt-4 p-3 rounded-lg border ${
                winner === (currentUser?.name || 'You') 
                  ? 'bg-green-900/30 border-green-700' 
                  : 'bg-blue-900/30 border-blue-700'
              }`}>
                <div className="flex items-center">
                  {winner === (currentUser?.name || 'You') && output.includes('opponent left') ? (
                    <>
                      <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                      <div>
                        <h3 className="font-bold text-lg">You Win!</h3>
                        <p className="text-sm text-gray-300">
                          Your opponent left the match. Victory by forfeit!
                        </p>
                      </div>
                    </>
                  ) : winner === (currentUser?.name || 'You') ? (
                    <>
                      <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                      <div>
                        <h3 className="font-bold text-lg">You Win!</h3>
                        <p className="text-sm text-gray-300">
                          Congratulations! You completed the challenge first.
                        </p>
                      </div>
                    </>
                  ) : timeLeft === 0 ? (
                    <>
                      <Clock className="w-6 h-6 text-red-400 mr-2" />
                      <div>
                        <h3 className="font-bold text-lg">Time's Up!</h3>
                        <p className="text-sm text-gray-300">
                          You've run out of time. Keep practicing!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 text-blue-400 mr-2" />
                      <div>
                        <h3 className="font-bold text-lg">{winner} Wins!</h3>
                        <p className="text-sm text-gray-300">
                          Your opponent completed the challenge first.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => navigate('/CodeChallengeLobby')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition-colors duration-200"
                  >
                    Return to Lobby
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-lg z-50">
          <div className="backdrop-blur-lg bg-white/20 border border-blue-300/40 shadow-2xl rounded-2xl p-8 max-w-md w-full mx-4" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
            <div className="text-center">
              {completionType === 'win' ? (
                <>
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-400 mb-2">Victory!</h2>
                  <p className="text-lg text-blue-200 mb-6">{completionMessage}</p>
                </>
              ) : completionType === 'lose' ? (
                <>
                  <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-blue-400 mb-2">Challenge Complete</h2>
                  <p className="text-lg text-blue-200 mb-6">{completionMessage}</p>
                </>
              ) : (
                <>
                  <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-400 mb-2">Time's Up!</h2>
                  <p className="text-lg text-blue-200 mb-6">{completionMessage}</p>
                </>
              )}
              <button
                onClick={() => navigate('/CodeChallengeLobby')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
