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
      rules: [],
      colors: {
        'editor.background': '#1a1a2e',
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-lg text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If activity not found or not of type code
  if (!activity || activity.type !== 'code') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-yellow-600 mb-2">Activity Not Found</h2>
            <p className="text-gray-700 mb-4">The requested coding activity could not be found.</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Results view
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Header />
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        
        <div className="max-w-4xl mx-auto mt-10">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Activities
            </button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="bg-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{activity.title} - Results</h2>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">{activity.week}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  {codeResults && questionResults && (
                    (codeResults.score + questionResults.score) / (codeResults.totalPoints + questionResults.totalPoints) >= 0.8 ? (
                      <CheckCircle size={24} className="text-green-500 mr-3" />
                    ) : (
                      <AlertCircle size={24} className="text-yellow-500 mr-3" />
                    )
                  )}
                  {codeResults && !questionResults && (
                    codeResults.score / codeResults.totalPoints >= 0.8 ? (
                      <CheckCircle size={24} className="text-green-500 mr-3" />
                    ) : (
                      <AlertCircle size={24} className="text-yellow-500 mr-3" />
                    )
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">Your Score</h3>
                    <p className="text-sm text-gray-600">
                      {questionResults && (
                        <>Questions: {questionResults.score}/{questionResults.totalPoints} points<br /></>
                      )}
                      {codeResults && (
                        <>Code: {codeResults.score}/{codeResults.totalPoints} points</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center border-8 border-purple-100">
                  <span className="text-2xl font-bold text-purple-700">
                    {Math.round(((questionResults?.score || 0) + (codeResults?.score || 0)) / 
                    ((questionResults?.totalPoints || 0) + (codeResults?.totalPoints || 0)) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Code Results Section */}
              {codeResults && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Code size={20} className="mr-2 text-purple-600" />
                    Code Assessment
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Pass Rate:</span>
                      <span className="font-medium">{Math.round(codeResults.passRate * 100)}%</span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full mb-4">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"
                        style={{ width: `${Math.round(codeResults.passRate * 100)}%` }}
                      ></div>
                    </div>
                    
                    <h4 className="text-sm font-medium mb-2">Test Results:</h4>
                    <ul className="space-y-2">
                      {codeResults.testResults.map((test, idx) => (
                        <li key={idx} className="flex items-center">
                          {test.passed ? (
                            <CheckCircle size={16} className="text-green-500 mr-2" />
                          ) : (
                            <AlertCircle size={16} className="text-red-500 mr-2" />
                          )}
                          <span className={test.passed ? "text-gray-700" : "text-gray-700"}>{test.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Question Results Section */}
              {questionResults && questionResults.feedback.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText size={20} className="mr-2 text-purple-600" />
                    Question Results
                  </h3>
                  
                  <div className="space-y-4">
                    {questionResults.feedback.map((item) => {
                      const question = activity.codeSettings.questions[item.questionIdx];
                      return (
                        <div 
                          key={item.questionIdx} 
                          className={`p-4 rounded-lg ${
                            item.correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                          }`}
                        >
                          <div className="flex items-start mb-2">
                            {item.correct ? (
                              <CheckCircle size={16} className="text-green-500 mr-2 mt-1" />
                            ) : (
                              <AlertCircle size={16} className="text-red-500 mr-2 mt-1" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-800">{question.text}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.correct ? (
                                  <span className="text-green-700">Correct! +{question.points} points</span>
                                ) : (
                                  <span className="text-red-700">Incorrect (0 points)</span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {!item.correct && question.type === 'multiple-choice' && (
                            <div className="mt-2 pl-6">
                              <p className="text-sm font-medium text-gray-700">Correct answer: 
                                <span className="ml-1 text-green-600">
                                  {question.options[question.correctOption]}
                                </span>
                              </p>
                            </div>
                          )}
                          
                          {!item.correct && question.type === 'short-answer' && (
                            <div className="mt-2 pl-6">
                              <p className="text-sm font-medium text-gray-700">Expected answer: 
                                <span className="ml-1 text-green-600">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Return to Activity
                </button>
                
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
    <div className="min-h-screen bg-gray-50 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <Header />
      
      <div className="max-w-6xl mx-auto mt-10">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Activities
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar with activity details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-purple-600 p-4 text-white">
                <h2 className="text-xl font-bold">{activity.title}</h2>
                <div className="flex items-center mt-1">
                  <Clock size={14} className="mr-1.5" />
                  <span className="text-sm">{activity.week}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-1">Difficulty</h3>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.codeSettings?.difficulty === 'easy' 
                        ? 'bg-green-100 text-green-800' 
                        : activity.codeSettings?.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.codeSettings?.difficulty || 'medium'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Programming Language</h3>
                  <div className="flex items-center">
                    <Code size={14} className="mr-1.5 text-gray-500" />
                    <span className="text-sm">{activity.codeSettings?.language || 'JavaScript'}</span>
                  </div>
                </div>
                
                {previousSubmission && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Previous Attempts</h3>
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Best Score:</span>
                        <span className="font-medium text-purple-600">{previousSubmission.scorePercentage || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Submissions:</span>
                        <span className="text-sm">{(submissionHistory?.length || 0) + 1}</span>
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
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors`}
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
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } transition-colors`}
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
          
          {/* Main content area with code editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden h-full">
              {/* Tabs */}
              <div className="bg-gray-100 px-4 border-b border-gray-200">
                <nav className="flex space-x-4" aria-label="Tabs">
                  <button
                    onClick={() => setCurrentTab('problem')}
                    className={`px-3 py-3 text-sm font-medium ${
                      currentTab === 'problem' 
                        ? 'text-purple-700 border-b-2 border-purple-500' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Problem
                  </button>
                  <button
                    onClick={() => setCurrentTab('code')}
                    className={`px-3 py-3 text-sm font-medium ${
                      currentTab === 'code' 
                        ? 'text-purple-700 border-b-2 border-purple-500' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Code Editor
                  </button>
                  {activity.codeSettings?.questions?.length > 0 && (
                    <button
                      onClick={() => setCurrentTab('questions')}
                      className={`px-3 py-3 text-sm font-medium ${
                        currentTab === 'questions' 
                          ? 'text-purple-700 border-b-2 border-purple-500' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Questions
                    </button>
                  )}
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="h-[calc(100%-44px)]">
                {/* Problem description tab */}
                {currentTab === 'problem' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Problem Description</h2>
                    <div className="text-gray-700 mb-6 whitespace-pre-line">{activity.codeSettings?.problem}</div>
                    
                    {activity.codeSettings?.challenges?.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">Coding Challenges</h3>
                        <div className="space-y-4">
                          {activity.codeSettings.challenges.map((challenge, idx) => (
                            <div key={idx} className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                              <div className="flex items-center mb-2">
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium rounded-full px-2.5 py-0.5 mr-2">
                                  #{idx + 1}
                                </span>
                                <h4 className="font-medium">{challenge.title}</h4>
                                <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                                  {challenge.points} points
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{challenge.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex">
                        <HelpCircle size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 mb-1">Hint</h4>
                          <p className="text-sm text-blue-700">
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
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
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
                    
                    <div className="bg-gray-900 text-white p-4 overflow-y-auto" style={{ maxHeight: '200px' }}>
                      <h3 className="text-sm font-mono mb-2">Console Output</h3>
                      {consoleOutput.length === 0 ? (
                        <p className="text-gray-400 text-xs">Run your code to see output here</p>
                      ) : (
                        <div className="font-mono text-xs space-y-1">
                          {consoleOutput.map((output, idx) => (
                            <div key={idx} className={output.type === 'error' ? 'text-red-400' : 'text-green-300'}>
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
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Questions</h2>
                    
                    <div className="space-y-6">
                      {activity.codeSettings.questions.map((question, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-800 mb-3 flex items-start">
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">
                              {idx + 1}
                            </span>
                            {question.text}
                            <span className="ml-auto text-xs text-gray-500">
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
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                  />
                                  <label 
                                    htmlFor={`question-${idx}-option-${optIdx}`}
                                    className="ml-2 block text-sm text-gray-700"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
                        <AlertCircle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-700">
                          <strong className="font-medium">Important:</strong> Remember to submit both your code and question answers by clicking the Submit button.
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
  );
};

export default StudentCodingActivityView;
