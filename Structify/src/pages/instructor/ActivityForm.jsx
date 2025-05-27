import React, { useEffect } from 'react';
import QuestionBuilder from './QuestionBuilder';
import { FileText, Code, Calendar, AlignLeft, Loader, PlusCircle, HelpCircle, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Initialize default values for new activity content
const initializeCodeSettings = () => ({
  problem: '',
  language: 'javascript',
  difficulty: 'medium',
  initialCode: '// Write your initial code here\n// This will be shown to students when they start the activity\n\nfunction example() {\n  // Your code here\n  return "Hello World";\n}',
  testCases: '// Example test cases\n// These will be used to check student code\n\ntest("example returns Hello World", () => {\n  expect(example()).toBe("Hello World");\n});',
  questions: [],
  challenges: []
});

const ActivityForm = ({ 
  activityContent, 
  setActivityContent, 
  currentQuestion, 
  setCurrentQuestion, 
  handleAddQuestion, 
  handleActivitySubmit,
  isSubmitting = false 
}) => {
  // Make sure we have code settings initialized when type is 'code'
  useEffect(() => {
    if (activityContent.type === 'code' && !activityContent.codeSettings) {
      setActivityContent(prev => ({
        ...prev,
        codeSettings: initializeCodeSettings()
      }));
    }
  }, [activityContent.type, setActivityContent]);

  // Handler for form submission with validation
  const onSubmitForm = (e) => {
    e.preventDefault();
    
    // Basic form validation before submission
    if (!activityContent.title.trim()) {
      alert('Please enter an activity title');
      return;
    }

    if (!activityContent.week) {
      alert('Please select a week');
      return;
    }
    
    if (activityContent.type === 'code' && !activityContent.codeSettings.problem.trim()) {
      alert('Please provide a coding problem description');
      return;
    }

    if (activityContent.type === 'form' && activityContent.questions.length === 0) {
      alert('Please add at least one question to the form activity');
      return;
    }

    handleActivitySubmit(e);
  };

  // Helper functions for form input handling
  const updateActivityField = (field, value) => {
    setActivityContent(prev => ({ ...prev, [field]: value }));
  };

  const updateCodeSettings = (field, value) => {
    setActivityContent(prev => ({
      ...prev,
      codeSettings: {
        ...prev.codeSettings,
        [field]: value
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form 
        id="activity-form"
        onSubmit={onSubmitForm} 
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="activityTitle" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FileText size={16} className="mr-2 text-purple-500" />
                Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="activityTitle"
                type="text"
                value={activityContent.title || ''}
                onChange={e => updateActivityField('title', e.target.value)}
                placeholder="Enter activity title"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  activityContent.title === '' ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {activityContent.title === '' && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Title is required
                </p>
              )}
            </div>

            <div>
              <label htmlFor="activityWeek" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="mr-2 text-purple-500" />
                Week <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="activityWeek"
                value={activityContent.week || ''}
                onChange={e => updateActivityField('week', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
                  activityContent.week === '' ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Week</option>
                <option value="Week 1">Week 1</option>
                <option value="Week 2">Week 2</option>
                <option value="Week 3">Week 3</option>
                <option value="Week 4-5">Week 4-5</option>
                <option value="Week 6">Week 6</option>
                <option value="Week 7-8">Week 7-8</option>
              </select>
              {activityContent.week === '' && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Please select a week
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="activityDescription" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <AlignLeft size={16} className="mr-2 text-purple-500" />
              Description <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="activityDescription"
              value={activityContent.description || ''}
              onChange={e => updateActivityField('description', e.target.value)}
              placeholder="Explain what students need to do in this activity..."
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                activityContent.description === '' ? 'border-red-300' : 'border-gray-300'
              }`}
              rows="4"
              required
            />
            {activityContent.description === '' && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle size={12} className="mr-1" /> Description is required
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Activity Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                activityContent.type === 'form' 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
              }`}
              onClick={() => updateActivityField('type', 'form')}
            >
              <div className="flex items-center justify-center flex-col">
                <div className={`rounded-full p-3 ${
                  activityContent.type === 'form' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <FileText size={24} className={`${
                    activityContent.type === 'form' ? 'text-purple-600' : 'text-gray-500'
                  }`} />
                </div>
                <h3 className={`mt-3 font-medium ${
                  activityContent.type === 'form' ? 'text-purple-700' : 'text-gray-600'
                }`}>Form Activity</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Multiple choice, short answer questions
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                activityContent.type === 'code' 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
              }`}
              onClick={() => updateActivityField('type', 'code')}
            >
              <div className="flex items-center justify-center flex-col">
                <div className={`rounded-full p-3 ${
                  activityContent.type === 'code' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <Code size={24} className={`${
                    activityContent.type === 'code' ? 'text-purple-600' : 'text-gray-500'
                  }`} />
                </div>
                <h3 className={`mt-3 font-medium ${
                  activityContent.type === 'code' ? 'text-purple-700' : 'text-gray-600'
                }`}>Code Activity</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Programming exercises with autograding
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Activity type help text */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start">
          <HelpCircle size={20} className="text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <strong className="text-purple-700 font-medium">Tip:</strong> {' '}
            {activityContent.type === 'form' 
              ? 'Form activities allow you to create multiple-choice questions, short answers, and other question types to assess student understanding.'
              : 'Code activities let students write and run code directly in the platform, with automated testing and feedback.'}
          </div>
        </div>

        {/* Code Activity Settings (only shown when code activity type is selected) */}
        {activityContent.type === 'code' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="bg-purple-50 rounded-lg p-6 border border-purple-200"
          >
            <h3 className="font-semibold text-gray-800 text-lg flex items-center mb-4">
              <Code size={18} className="mr-2 text-purple-600" />
              Code Activity Settings
            </h3>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="codingProblem" className="block text-sm font-medium text-gray-700 mb-1">
                  Coding Problem / Question <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="codingProblem"
                  value={activityContent.codeSettings?.problem || ''}
                  onChange={e => updateCodeSettings('problem', e.target.value)}
                  placeholder="Describe the coding problem that students need to solve..."
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    activityContent.codeSettings?.problem === '' ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows="4"
                  required
                />
                {activityContent.codeSettings?.problem === '' && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> Problem description is required
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Explain the problem clearly with examples and expected outcomes.
                </p>
              </div>
              
              {/* Adding question fields for coding activity */}
              <div>
                <label htmlFor="codingQuestions" className="block text-sm font-medium text-gray-700 mb-1">
                  Questions for Students (Optional)
                </label>
                <div className="space-y-3">
                  {activityContent.codeSettings?.questions && activityContent.codeSettings.questions.length > 0 ? (
                    activityContent.codeSettings.questions.map((question, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-md p-3 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                              Q{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={question.text || ''}
                              onChange={e => {
                                const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                                updatedQuestions[idx] = {...updatedQuestions[idx], text: e.target.value};
                                updateCodeSettings('questions', updatedQuestions);
                              }}
                              placeholder="Question text"
                              className="w-full text-sm font-medium border-b border-transparent focus:outline-none focus:border-purple-500"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = (activityContent.codeSettings?.questions || []).filter((_, i) => i !== idx);
                              updateCodeSettings('questions', updatedQuestions);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <select
                            value={question.type || 'short-answer'}
                            onChange={e => {
                              const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                              updatedQuestions[idx] = {
                                ...updatedQuestions[idx], 
                                type: e.target.value,
                                // Initialize options array if changing to multiple choice
                                options: e.target.value === 'multiple-choice' && !updatedQuestions[idx].options ? [] : updatedQuestions[idx].options
                              };
                              updateCodeSettings('questions', updatedQuestions);
                            }}
                            className="px-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="short-answer">Short Answer</option>
                            <option value="multiple-choice">Multiple Choice</option>
                          </select>
                          
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={question.points || 10}
                            onChange={e => {
                              const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                              updatedQuestions[idx] = {...updatedQuestions[idx], points: parseInt(e.target.value) || 0};
                              updateCodeSettings('questions', updatedQuestions);
                            }}
                            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Points"
                          />
                        </div>
                        
                        {question.type === 'multiple-choice' && (
                          <div className="mt-3 space-y-2">
                            {question.options && question.options.map((option, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`question-${idx}-option`}
                                  checked={question.correctOption === optIdx}
                                  onChange={() => {
                                    const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                                    updatedQuestions[idx] = {...updatedQuestions[idx], correctOption: optIdx};
                                    updateCodeSettings('questions', updatedQuestions);
                                  }}
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <input
                                  type="text"
                                  value={option || ''}
                                  onChange={e => {
                                    const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                                    const updatedOptions = [...(updatedQuestions[idx].options || [])];
                                    updatedOptions[optIdx] = e.target.value;
                                    updatedQuestions[idx] = {...updatedQuestions[idx], options: updatedOptions};
                                    updateCodeSettings('questions', updatedQuestions);
                                  }}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                                    const updatedOptions = (updatedQuestions[idx].options || []).filter((_, i) => i !== optIdx);
                                    updatedQuestions[idx] = {
                                      ...updatedQuestions[idx], 
                                      options: updatedOptions,
                                      // Reset correctOption if that option is removed
                                      correctOption: question.correctOption === optIdx ? null : 
                                        question.correctOption > optIdx ? question.correctOption - 1 : question.correctOption
                                    };
                                    updateCodeSettings('questions', updatedQuestions);
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                                const updatedOptions = [...(updatedQuestions[idx].options || []), ""];
                                updatedQuestions[idx] = {...updatedQuestions[idx], options: updatedOptions};
                                updateCodeSettings('questions', updatedQuestions);
                              }}
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1 mt-1"
                            >
                              <PlusCircle size={12} />
                              Add Option
                            </button>
                            {question.options && question.options.length > 0 && question.correctOption === undefined && (
                              <p className="text-xs text-amber-600 flex items-center mt-1">
                                <AlertCircle size={12} className="mr-1" /> Please select a correct answer
                              </p>
                            )}
                          </div>
                        )}
                        
                        {question.type === 'short-answer' && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={question.answer || ''}
                              onChange={e => {
                                const updatedQuestions = [...(activityContent.codeSettings?.questions || [])];
                                updatedQuestions[idx] = {...updatedQuestions[idx], answer: e.target.value};
                                updateCodeSettings('questions', updatedQuestions);
                              }}
                              placeholder="Expected answer (for grading)"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md border border-gray-200">
                      No questions added yet. Add questions to assess student understanding.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const currentQuestions = activityContent.codeSettings?.questions || [];
                      updateCodeSettings('questions', [
                        ...currentQuestions,
                        {
                          text: '',
                          type: 'short-answer',
                          points: 10
                        }
                      ]);
                    }}
                    className="text-sm px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 flex items-center justify-center gap-1 w-full"
                  >
                    <PlusCircle size={16} />
                    Add Question
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="programmingLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                  Programming Language <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="programmingLanguage"
                  value={activityContent.codeSettings?.language || 'javascript'}
                  onChange={e => updateCodeSettings('language', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  required
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              
              {/* Difficulty level selector */}
              <div>
                <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-3">
                  {["Easy", "Medium", "Hard"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateCodeSettings('difficulty', level.toLowerCase())}
                      className={`flex-1 py-2 rounded-md border transition-all ${
                        activityContent.codeSettings?.difficulty === level.toLowerCase() 
                          ? `border-purple-500 bg-purple-100 text-purple-700 font-medium`
                          : `border-gray-300 text-gray-600 hover:bg-gray-50`
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Multiple coding challenges option */}
              <div className="border border-purple-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <PlusCircle size={16} className="mr-1.5 text-purple-600" />
                    Coding Challenges
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const challenges = activityContent.codeSettings?.challenges || [];
                      updateCodeSettings('challenges', [
                        ...challenges,
                        { 
                          id: Date.now(), 
                          title: `Challenge ${challenges.length + 1}`, 
                          description: '',
                          points: 10
                        }
                      ]);
                    }}
                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center gap-1"
                  >
                    <PlusCircle size={12} />
                    Add Challenge
                  </button>
                </div>
                
                {(!activityContent.codeSettings?.challenges || activityContent.codeSettings.challenges.length === 0) ? (
                  <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md">
                    Add specific challenges for this coding activity. Each challenge can have its own requirements and points.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityContent.codeSettings.challenges.map((challenge, idx) => (
                      <div key={challenge.id} className="border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2 items-center">
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={challenge.title || ''}
                              onChange={e => {
                                const updatedChallenges = [...(activityContent.codeSettings?.challenges || [])];
                                updatedChallenges[idx] = {...updatedChallenges[idx], title: e.target.value};
                                updateCodeSettings('challenges', updatedChallenges);
                              }}
                              placeholder="Challenge title"
                              className="text-sm font-medium focus:outline-none focus:border-b focus:border-purple-500"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedChallenges = (activityContent.codeSettings?.challenges || []).filter(
                                (_, i) => i !== idx
                              );
                              updateCodeSettings('challenges', updatedChallenges);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <textarea
                          value={challenge.description || ''}
                          onChange={e => {
                            const updatedChallenges = [...(activityContent.codeSettings?.challenges || [])];
                            updatedChallenges[idx] = {...updatedChallenges[idx], description: e.target.value};
                            updateCodeSettings('challenges', updatedChallenges);
                          }}
                          placeholder="Describe the challenge requirements..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          rows="2"
                          required
                        />
                        <div className="flex justify-end mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Points:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={challenge.points || 10}
                              onChange={e => {
                                const updatedChallenges = [...(activityContent.codeSettings?.challenges || [])];
                                updatedChallenges[idx] = {...updatedChallenges[idx], points: parseInt(e.target.value) || 10};
                                updateCodeSettings('challenges', updatedChallenges);
                              }}
                              className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="initialCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Code (Template for students) <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="initialCode"
                  value={activityContent.codeSettings?.initialCode || '// Write your initial code here\n// This will be shown to students when they start the activity\n\nfunction example() {\n  // Your code here\n  return "Hello World";\n}'}
                  onChange={e => updateCodeSettings('initialCode', e.target.value)}
                  placeholder="Provide initial code for students to start with..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono bg-gray-900 text-gray-100"
                  rows="6"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="testCases" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Cases (For autograding) <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="testCases"
                  value={activityContent.codeSettings?.testCases || '// Example test cases\n// These will be used to check student code\n\ntest("example returns Hello World", () => {\n  expect(example()).toBe("Hello World");\n});'}
                  onChange={e => updateCodeSettings('testCases', e.target.value)}
                  placeholder="Write test cases to validate student code..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono bg-gray-800 text-green-300"
                  rows="6"
                  required
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Student View Preview</h4>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 border-b border-gray-300 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">code-editor.js</span>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                        Run
                      </button>
                      <button 
                        type="button"
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                        Submit
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-900 p-4 text-xs text-gray-300 font-mono">
                    <pre className="whitespace-pre-wrap">
                      {activityContent.codeSettings?.initialCode || '// Student will see this code editor\n// with your template code loaded'}
                    </pre>
                  </div>
                  <div className="bg-gray-800 p-2 border-t border-gray-700 text-xs text-gray-400">
                    Console output will appear here after running code
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activityContent.type === 'form' && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center">
                <PlusCircle size={18} className="mr-2 text-purple-600" />
                Question Builder
              </h3>
              {activityContent.questions?.length > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium py-1 px-3 rounded-full">
                  {activityContent.questions.length} {activityContent.questions.length === 1 ? 'Question' : 'Questions'} Added
                </span>
              )}
            </div>
            
            <QuestionBuilder
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              handleAddQuestion={handleAddQuestion}
              questions={activityContent.questions || []}
            />
          </div>
        )}

        {/* Submit button */}
        {/* <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={18} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Activity'
            )}
          </button>
        </div> */}
      </form>
    </motion.div>
  );
};

export default ActivityForm;