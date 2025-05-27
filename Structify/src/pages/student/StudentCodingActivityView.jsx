import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessonProgress } from '../../context/lessonProgressContext';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { CheckCircle, AlertCircle, Clock, Code, Play, Save, FileText, Send, HelpCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import Editor from "@monaco-editor/react";
import Confetti from 'react-confetti';
import Header from '../../components/Header';
import { motion } from 'framer-motion';

const StudentCodingActivityView = () => {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { currentUser } = useAuth();
  const { markActivityComplete, activityScores } = useLessonProgress();
  const editorRef = useRef(null);
  
  // Activity state
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('problem');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [questionResults, setQuestionResults] = useState(null);
  const [codeResults, setCodeResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);

  // Function to handle editor mounting
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor; 
    // Apply custom editor settings here if needed
    monaco.editor.defineTheme('structifyTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4' },
        { token: 'keyword', foreground: 'bd93f9' },
        { token: 'string', foreground: '8be9fd' },
        { token: 'number', foreground: 'ff79c6' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#1a2142',
        'editor.foreground': '#f8f8f2',
        'editorCursor.foreground': '#8b5cf6',
        'editor.lineHighlightBackground': '#1F274D',
        'editorLineNumber.foreground': '#6272a4',
        'editor.selectionBackground': '#44475a',
        'editor.inactiveSelectionBackground': '#44475a80'
      }
    });
    monaco.editor.setTheme('structifyTheme');
  }

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      try {
        const activityDoc = await getDoc(doc(db, 'activities', activityId));
        if (activityDoc.exists()) {
          const activityData = activityDoc.data();
          setActivity({
            ...activityData,
            id: activityId
          });
          
          // Initialize question answers if there are any questions
          if (activityData.codeSettings?.questions?.length > 0) {
            const initialAnswers = {};
            activityData.codeSettings.questions.forEach((question, idx) => {
              if (question.type === 'multiple-choice') {
                initialAnswers[idx] = null;
              } else if (question.type === 'short-answer') {
                initialAnswers[idx] = '';
              }
            });
            setCurrentAnswers(initialAnswers);
          }
          
          // Fetch previous submissions if any
          await fetchPreviousSubmissions(activityId);
          
          setIsLoading(false);
        } else {
          setError("Activity not found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError("Failed to load activity data");
        setIsLoading(false);
      }
    };
    
    fetchActivity();
  }, [activityId, currentUser?.uid]);
  
  const fetchPreviousSubmissions = async (activityId) => {
    if (!currentUser?.uid) return;
    
    try {
      const submissionRef = await getDoc(doc(db, 'users', currentUser.uid, 'submissions', activityId));
      
      if (submissionRef.exists()) {
        const submissionData = submissionRef.data();
        setPreviousSubmission(submissionData);
        
        // If there's code from a previous attempt, load it
        if (submissionData.code && editorRef.current) {
          setTimeout(() => {
            // We use setTimeout to ensure editor is ready
            if (editorRef.current) {
              editorRef.current.setValue(submissionData.code);
            }
          }, 500);
        }
        
        // If there are previous question answers, load them
        if (submissionData.answers) {
          setCurrentAnswers(submissionData.answers);
        }
        
        // Load submission history if available
        if (submissionData.history && Array.isArray(submissionData.history)) {
          setSubmissionHistory(submissionData.history);
        }
      }
    } catch (err) {
      console.error("Error fetching previous submissions:", err);
    }
  };
  
  // Run code function
  const handleRunCode = async () => {
    if (!editorRef.current) return;
    
    setIsRunning(true);
    setConsoleOutput([{ type: 'info', text: 'Running your code...' }]);
    
    const code = editorRef.current.getValue();
    
    // In a real implementation, this would send the code to a backend for execution
    // For this demo, we'll simulate code execution
    try {
      // Mock code execution
      setTimeout(() => {
        // Simulate console output
        const outputs = [
          { type: 'log', text: 'Code execution started' },
          { type: 'log', text: 'Testing your implementation...' },
        ];
        
        // Add some simulated test results based on random success or failure
        if (Math.random() > 0.3) {
          outputs.push({ type: 'log', text: 'All tests passed!' });
        } else {
          outputs.push({ type: 'error', text: 'Error: Test failed - Expected output did not match actual output' });
        }
        
        setConsoleOutput(outputs);
        setIsRunning(false);
      }, 1500);
      
    } catch (err) {
      setConsoleOutput([
        ...consoleOutput,
        { type: 'error', text: `Error executing code: ${err.message}` }
      ]);
      setIsRunning(false);
    }
  };
  
  // Submit code and answers function
  const handleSubmitActivity = async () => {
    if (!activity || !currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      const code = editorRef.current ? editorRef.current.getValue() : '';
      
      // Calculate score for questions
      let questionScore = 0;
      let totalQuestionPoints = 0;
      let questionFeedback = [];
      
      if (activity.codeSettings?.questions?.length > 0) {
        activity.codeSettings.questions.forEach((question, idx) => {
          totalQuestionPoints += question.points;
          
          if (question.type === 'multiple-choice' && currentAnswers[idx] === question.correctOption) {
            questionScore += question.points;
            questionFeedback.push({ questionIdx: idx, correct: true });
          } else if (question.type === 'short-answer') {
            // For short answer, do a simple case-insensitive comparison
            // In a real app, you'd want more sophisticated matching
            if (currentAnswers[idx]?.toLowerCase() === question.answer?.toLowerCase()) {
              questionScore += question.points;
              questionFeedback.push({ questionIdx: idx, correct: true });
            } else {
              questionFeedback.push({ questionIdx: idx, correct: false });
            }
          } else {
            questionFeedback.push({ questionIdx: idx, correct: false });
          }
        });
      }
      
      // Simulate code evaluation (in a real app, you'd evaluate on the server)
      let codeScore = 0;
      const totalCodePoints = 100; // Assuming code is worth 100 points
      
      // Simulate code passing tests with random success rate
      // In a real app, you would run actual tests against the student's code
      const codePassRate = Math.random();
      codeScore = Math.floor(codePassRate * totalCodePoints);
      
      // Calculate total score
      let totalScore = 0;
      let totalPossibleScore = 0;
      
      if (activity.codeSettings?.questions?.length > 0) {
        totalScore = questionScore + codeScore;
        totalPossibleScore = totalQuestionPoints + totalCodePoints;
      } else {
        totalScore = codeScore;
        totalPossibleScore = totalCodePoints;
      }
      
      const scorePercentage = Math.round((totalScore / totalPossibleScore) * 100);
      
      // Create submission record
      const submission = {
        activityId,
        code,
        answers: currentAnswers,
        questionScore,
        codeScore,
        totalScore,
        scorePercentage,
        submittedAt: serverTimestamp(),
        feedback: {
          questions: questionFeedback,
          code: {
            passRate: codePassRate,
            // In a real app you would include actual test results
            testResults: [
              { name: "Basic functionality", passed: codePassRate > 0.3 },
              { name: "Edge cases", passed: codePassRate > 0.6 },
              { name: "Performance", passed: codePassRate > 0.8 }
            ]
          }
        }
      };
      
      // Save submission to Firestore
      const submissionRef = doc(db, 'users', currentUser.uid, 'submissions', activityId);
      
      // Get existing submission history or create new one
      let history = submissionHistory.length > 0 
                     ? [...submissionHistory] 
                     : [];
                     
      // Add current submission to history
      history.push({
        submittedAt: new Date(),
        scorePercentage,
        code
      });
      
      // Limit history to last 5 submissions
      if (history.length > 5) {
        history = history.slice(history.length - 5);
      }
      
      await updateDoc(submissionRef, {
        ...submission,
        history
      }, { merge: true });
      
      // Mark activity as complete
      markActivityComplete(activityId, scorePercentage);
      
      // Set results for display
      setQuestionResults({
        score: questionScore,
        totalPoints: totalQuestionPoints,
        feedback: questionFeedback
      });
      
      setCodeResults({
        score: codeScore,
        totalPoints: totalCodePoints,
        passRate: codePassRate,
        testResults: submission.feedback.code.testResults
      });
      
      // Show results
      setShowResults(true);
      
      // If score is good, show confetti
      if (scorePercentage >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error submitting activity:", err);
      setError("Failed to submit your answers. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  // Handle answer changes
  const handleAnswerChange = (questionIdx, value) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIdx]: value
    }));
  };
  
  // Autosave code changes
  const handleCodeChange = () => {
    if (!editorRef.current || !currentUser?.uid) return;
    
    // Implement debounced autosave here if needed
    // For now, we'll just save on submission
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-200">Loading activity...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-[#141a35] rounded-lg shadow-lg border border-blue-500/30 p-6">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle size={48} className="text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1F274D] focus:outline-none"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If activity not found or not of type code
  if (!activity || activity.type !== 'code') {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-[#141a35] rounded-lg shadow-lg border border-blue-500/30 p-6">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle size={48} className="text-yellow-400 mb-4" />
              <h2 className="text-xl font-bold text-yellow-400 mb-2">Activity Not Found</h2>
              <p className="text-gray-300 mb-4">The requested coding activity could not be found.</p>
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1F274D] focus:outline-none"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Results view
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] py-12 px-4 sm:px-6 lg:px-8 text-white">
        <Header />
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        
        <div className="max-w-4xl mx-auto mt-10">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Activities
            </button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141a35] rounded-lg shadow-lg border border-blue-500/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{activity.title} - Results</h2>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">{activity.week}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center bg-[#1a2142] rounded-lg p-4 mb-6 border border-blue-500/20">
                <div className="flex items-center">
                  {codeResults && questionResults && (
                    (codeResults.score + questionResults.score) / (codeResults.totalPoints + questionResults.totalPoints) >= 0.8 ? (
                      <CheckCircle size={24} className="text-green-400 mr-3" />
                    ) : (
                      <AlertCircle size={24} className="text-yellow-400 mr-3" />
                    )
                  )}
                  {codeResults && !questionResults && (
                    codeResults.score / codeResults.totalPoints >= 0.8 ? (
                      <CheckCircle size={24} className="text-green-400 mr-3" />
                    ) : (
                      <AlertCircle size={24} className="text-yellow-400 mr-3" />
                    )
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-white">Your Score</h3>
                    <p className="text-sm text-gray-300">
                      {questionResults && (
                        <>Questions: {questionResults.score}/{questionResults.totalPoints} points<br /></>
                      )}
                      {codeResults && (
                        <>Code: {codeResults.score}/{codeResults.totalPoints} points</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="bg-[#141a35] rounded-full h-24 w-24 flex items-center justify-center border-4 border-blue-800">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
                    {Math.round(((questionResults?.score || 0) + (codeResults?.score || 0)) / 
                    ((questionResults?.totalPoints || 0) + (codeResults?.totalPoints || 0)) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Code Results Section */}
              {codeResults && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Code size={20} className="mr-2 text-blue-400" />
                    Code Assessment
                  </h3>
                  
                  <div className="bg-[#1a2142] rounded-lg p-4 border border-blue-500/20">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Pass Rate:</span>
                      <span className="font-medium text-white">{Math.round(codeResults.passRate * 100)}%</span>
                    </div>
                    
                    <div className="h-2 bg-[#141a35] rounded-full mb-4">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-600"
                        style={{ width: `${Math.round(codeResults.passRate * 100)}%` }}
                      ></div>
                    </div>
                    
                    <h4 className="text-sm font-medium mb-2 text-white">Test Results:</h4>
                    <ul className="space-y-2">
                      {codeResults.testResults.map((test, idx) => (
                        <li key={idx} className="flex items-center">
                          {test.passed ? (
                            <CheckCircle size={16} className="text-green-400 mr-2" />
                          ) : (
                            <AlertCircle size={16} className="text-red-400 mr-2" />
                          )}
                          <span className={test.passed ? "text-gray-200" : "text-gray-300"}>{test.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Question Results Section */}
              {questionResults && questionResults.feedback.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText size={20} className="mr-2 text-blue-400" />
                    Question Results
                  </h3>
                  
                  <div className="space-y-4">
                    {questionResults.feedback.map((item) => {
                      const question = activity.codeSettings.questions[item.questionIdx];
                      return (
                        <div 
                          key={item.questionIdx} 
                          className={`p-4 rounded-lg border ${
                            item.correct 
                              ? 'bg-green-900/20 border-green-500/30' 
                              : 'bg-red-900/20 border-red-500/30'
                          }`}
                        >
                          <div className="flex items-start mb-2">
                            {item.correct ? (
                              <CheckCircle size={16} className="text-green-400 mr-2 mt-1" />
                            ) : (
                              <AlertCircle size={16} className="text-red-400 mr-2 mt-1" />
                            )}
                            <div>
                              <h4 className="font-medium text-white">{question.text}</h4>
                              <p className="text-sm mt-1">
                                {item.correct ? (
                                  <span className="text-green-400">Correct! +{question.points} points</span>
                                ) : (
                                  <span className="text-red-400">Incorrect (0 points)</span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {!item.correct && question.type === 'multiple-choice' && (
                            <div className="mt-2 pl-6">
                              <p className="text-sm font-medium text-gray-300">Correct answer: 
                                <span className="ml-1 text-green-400">
                                  {question.options[question.correctOption]}
                                </span>
                              </p>
                            </div>
                          )}
                          
                          {!item.correct && question.type === 'short-answer' && (
                            <div className="mt-2 pl-6">
                              <p className="text-sm font-medium text-gray-300">Expected answer: 
                                <span className="ml-1 text-green-400">
                                  {question.answer}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setQuestionResults(null);
                    setCodeResults(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-md transition-colors focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#141a35] focus:outline-none"
                >
                  Return to Activity
                </button>
                
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-blue-500/30 rounded-md hover:bg-[#1a2142] transition-colors text-white"
                >
                  Finish & Return
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main activity view
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] text-white">
      <Header />
      
      <div className="max-w-6xl mx-auto mt-10">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Activities
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar with activity details */}
          <div className="lg:col-span-1">
            <div className="bg-[#141a35] rounded-lg shadow-lg overflow-hidden border border-blue-500/30 relative group">
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 z-0" />
            
              <div className="relative z-10">
                <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-4 text-white">
                  <h2 className="text-xl font-bold">{activity.title}</h2>
                  <div className="flex items-center mt-1">
                    <Clock size={14} className="mr-1.5" />
                    <span className="text-sm">{activity.week}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-200 mb-1">Description</h3>
                    <p className="text-gray-300 text-sm">{activity.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-200 mb-1">Difficulty</h3>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.codeSettings?.difficulty === 'easy' 
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                          : activity.codeSettings?.difficulty === 'medium'
                          ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-900/30 text-red-400 border border-red-500/30'
                      }`}>
                        {activity.codeSettings?.difficulty || 'medium'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-200 mb-1">Programming Language</h3>
                    <div className="flex items-center">
                      <Code size={14} className="mr-1.5 text-gray-400" />
                      <span className="text-sm text-gray-300">{activity.codeSettings?.language || 'JavaScript'}</span>
                    </div>
                  </div>
                  
                  {previousSubmission && (
                    <div className="mt-6 pt-4 border-t border-blue-500/20">
                      <h3 className="font-medium text-gray-200 mb-2">Previous Attempts</h3>
                      <div className="bg-[#1a2142] rounded-md p-3 border border-blue-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Best Score:</span>
                          <span className="font-medium text-blue-400">{previousSubmission.scorePercentage || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-400">Submissions:</span>
                          <span className="text-sm text-gray-300">{(submissionHistory?.length || 0) + 1}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md ${
                        isRunning 
                          ? 'bg-[#1a2142] text-gray-500 cursor-not-allowed border-blue-500/20' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-transparent'
                      } transition-all focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#141a35] focus:outline-none`}
                    >
                      {isRunning ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-1.5" />
                          Run Code
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleSubmitActivity}
                      disabled={isSubmitting}
                      className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md ${
                        isSubmitting 
                          ? 'bg-[#1a2142] text-gray-500 cursor-not-allowed border-blue-500/20' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white border-transparent'
                      } transition-all focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#141a35] focus:outline-none`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-1.5" />
                          Submit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area with code editor */}
          <div className="lg:col-span-2">
            <div className="bg-[#141a35] rounded-lg shadow-lg overflow-hidden border border-blue-500/30 h-full relative group">
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 z-0" />
              
              <div className="relative z-10 h-full flex flex-col">
                {/* Tabs */}
                <div className="bg-[#0f142a] px-4 border-b border-blue-500/20">
                  <nav className="flex space-x-4" aria-label="Tabs">
                    <button
                      onClick={() => setCurrentTab('problem')}
                      className={`px-3 py-3 text-sm font-medium transition-colors ${
                        currentTab === 'problem' 
                          ? 'text-blue-400 border-b-2 border-blue-500' 
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Problem
                    </button>
                    <button
                      onClick={() => setCurrentTab('code')}
                      className={`px-3 py-3 text-sm font-medium transition-colors ${
                        currentTab === 'code' 
                          ? 'text-blue-400 border-b-2 border-blue-500' 
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Code Editor
                    </button>
                    {activity.codeSettings?.questions?.length > 0 && (
                      <button
                        onClick={() => setCurrentTab('questions')}
                        className={`px-3 py-3 text-sm font-medium transition-colors ${
                          currentTab === 'questions' 
                            ? 'text-blue-400 border-b-2 border-blue-500' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Questions
                      </button>
                    )}
                  </nav>
                </div>
                
                {/* Tab content */}
                <div className="h-full flex-1 flex flex-col">
                  {/* Problem description tab */}
                  {currentTab === 'problem' && (
                    <div className="p-6 overflow-y-auto h-full">
                      <h2 className="text-lg font-semibold text-white mb-2">Problem Description</h2>
                      <div className="text-gray-300 mb-6 whitespace-pre-line">{activity.codeSettings?.problem}</div>
                      
                      {activity.codeSettings?.challenges?.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-md font-semibold text-white mb-3">Coding Challenges</h3>
                          <div className="space-y-4">
                            {activity.codeSettings.challenges.map((challenge, idx) => (
                              <div key={idx} className="bg-[#1a2142] rounded-lg p-4 border border-blue-500/30">
                                <div className="flex items-center mb-2">
                                  <span className="bg-blue-900/30 text-blue-400 text-xs font-medium rounded-full px-2.5 py-0.5 mr-2 border border-blue-500/30">
                                    #{idx + 1}
                                  </span>
                                  <h4 className="font-medium text-white">{challenge.title}</h4>
                                  <span className="ml-auto text-xs text-gray-400 bg-[#0f142a] px-2 py-0.5 rounded border border-blue-500/20">
                                    {challenge.points} points
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">{challenge.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8 bg-[#1a2142] border border-blue-500/30 rounded-lg p-4">
                        <div className="flex">
                          <HelpCircle size={20} className="text-blue-400 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-300 mb-1">Hint</h4>
                            <p className="text-sm text-gray-300">
                              Read the problem carefully before you start coding. Consider edge cases in your solution.
                              You can run your code as many times as needed before submitting.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Code editor tab */}
                  {currentTab === 'code' && (
                    <div className="flex flex-col h-full flex-1">
                      <div className="flex-1 min-h-0">
                        <Editor
                          height="100%"
                          defaultLanguage={activity.codeSettings?.language || "javascript"}
                          defaultValue={activity.codeSettings?.initialCode || "// Write your code here"}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                          onMount={handleEditorDidMount}
                          onChange={handleCodeChange}
                        />
                      </div>
                      
                      <div className="bg-[#0f142a] text-white p-4 overflow-y-auto border-t border-blue-500/20" style={{ maxHeight: '200px' }}>
                        <h3 className="text-sm font-mono mb-2 text-gray-300">Console Output</h3>
                        {consoleOutput.length === 0 ? (
                          <p className="text-gray-500 text-xs">Run your code to see output here</p>
                        ) : (
                          <div className="font-mono text-xs space-y-1">
                            {consoleOutput.map((output, idx) => (
                              <div key={idx} className={output.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                                {output.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Questions tab */}
                  {currentTab === 'questions' && activity.codeSettings?.questions?.length > 0 && (
                    <div className="p-6 overflow-y-auto h-full">
                      <h2 className="text-lg font-semibold text-white mb-4">Questions</h2>
                      
                      <div className="space-y-6">
                        {activity.codeSettings.questions.map((question, idx) => (
                          <div key={idx} className="bg-[#1a2142] border border-blue-500/20 rounded-lg p-4">
                            <h3 className="font-medium text-white mb-3 flex items-start">
                              <span className="bg-blue-900/30 text-blue-400 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2 border border-blue-500/30">
                                {idx + 1}
                              </span>
                              {question.text}
                              <span className="ml-auto text-xs text-gray-400">
                                {question.points} points
                              </span>
                            </h3>
                            
                            {question.type === 'multiple-choice' && (
                              <div className="mt-3 space-y-2">
                                {question.options?.map((option, optIdx) => (
                                  <div key={optIdx} className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`question-${idx}-option-${optIdx}`}
                                      name={`question-${idx}`}
                                      checked={currentAnswers[idx] === optIdx}
                                      onChange={() => handleAnswerChange(idx, optIdx)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-[#0f142a]"
                                    />
                                    <label 
                                      htmlFor={`question-${idx}-option-${optIdx}`}
                                      className="ml-2 block text-sm text-gray-300"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'short-answer' && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  value={currentAnswers[idx] || ''}
                                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                  placeholder="Your answer..."
                                  className="w-full px-3 py-2 bg-[#0f142a] border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200 placeholder-gray-500"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <div className="bg-[#1a2142] border border-yellow-500/30 rounded-lg p-4 flex items-start">
                          <AlertCircle size={20} className="text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-300">
                            <strong className="font-medium text-yellow-400">Important:</strong> Remember to submit both your code and question answers by clicking the Submit button.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCodingActivityView;
