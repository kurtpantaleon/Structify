import React from 'react';
import QuestionBuilder from './QuestionBuilder';
import { FileText, Code, Calendar, AlignLeft, Loader, PlusCircle, HelpCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityForm = ({ 
  activityContent, 
  setActivityContent, 
  currentQuestion, 
  setCurrentQuestion, 
  handleAddQuestion, 
  handleActivitySubmit,
  isSubmitting = false 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <form 
      id="activity-form"
      onSubmit={handleActivitySubmit} 
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="activityTitle" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FileText size={16} className="mr-2 text-purple-500" />
              Title
            </label>
            <input
              id="activityTitle"
              type="text"
              value={activityContent.title}
              onChange={e => setActivityContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter activity title"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="activityWeek" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="mr-2 text-purple-500" />
              Week
            </label>
            <select
              id="activityWeek"
              value={activityContent.week}
              onChange={e => setActivityContent(prev => ({ ...prev, week: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
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
          </div>
        </div>

        <div>
          <label htmlFor="activityDescription" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <AlignLeft size={16} className="mr-2 text-purple-500" />
            Description
          </label>
          <textarea
            id="activityDescription"
            value={activityContent.description}
            onChange={e => setActivityContent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Explain what students need to do in this activity..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            rows="4"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Activity Type</label>
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
              activityContent.type === 'form' 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
            }`}
            onClick={() => setActivityContent(prev => ({ ...prev, type: 'form' }))}
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
            onClick={() => setActivityContent(prev => ({ ...prev, type: 'code' }))}
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
                Coding Problem / Question
              </label>
              <textarea
                id="codingProblem"
                value={activityContent.codeSettings?.problem || ''}
                onChange={e => setActivityContent(prev => ({
                  ...prev,
                  codeSettings: {
                    ...prev.codeSettings,
                    problem: e.target.value
                  }
                }))}
                placeholder="Describe the coding problem that students need to solve..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                rows="4"
              />
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
                {activityContent.codeSettings?.questions ? (
                  activityContent.codeSettings.questions.map((question, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center">
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                            Q{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={question.text}
                            onChange={e => {
                              const updatedQuestions = [...activityContent.codeSettings.questions];
                              updatedQuestions[idx].text = e.target.value;
                              setActivityContent(prev => ({
                                ...prev,
                                codeSettings: {
                                  ...prev.codeSettings,
                                  questions: updatedQuestions
                                }
                              }));
                            }}
                            placeholder="Question text"
                            className="w-full text-sm font-medium border-b border-transparent focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuestions = activityContent.codeSettings.questions.filter((_, i) => i !== idx);
                            setActivityContent(prev => ({
                              ...prev,
                              codeSettings: {
                                ...prev.codeSettings,
                                questions: updatedQuestions
                              }
                            }));
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <select
                          value={question.type}
                          onChange={e => {
                            const updatedQuestions = [...activityContent.codeSettings.questions];
                            updatedQuestions[idx].type = e.target.value;
                            setActivityContent(prev => ({
                              ...prev,
                              codeSettings: {
                                ...prev.codeSettings,
                                questions: updatedQuestions
                              }
                            }));
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
                          value={question.points}
                          onChange={e => {
                            const updatedQuestions = [...activityContent.codeSettings.questions];
                            updatedQuestions[idx].points = parseInt(e.target.value) || 0;
                            setActivityContent(prev => ({
                              ...prev,
                              codeSettings: {
                                ...prev.codeSettings,
                                questions: updatedQuestions
                              }
                            }));
                          }}
                          className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Points"
                        />
                      </div>
                      
                      {question.type === 'multiple-choice' && (
                        <div className="mt-3 space-y-2">
                          {question.options ? question.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={question.correctOption === optIdx}
                                onChange={() => {
                                  const updatedQuestions = [...activityContent.codeSettings.questions];
                                  updatedQuestions[idx].correctOption = optIdx;
                                  setActivityContent(prev => ({
                                    ...prev,
                                    codeSettings: {
                                      ...prev.codeSettings,
                                      questions: updatedQuestions
                                    }
                                  }));
                                }}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={e => {
                                  const updatedQuestions = [...activityContent.codeSettings.questions];
                                  updatedQuestions[idx].options[optIdx] = e.target.value;
                                  setActivityContent(prev => ({
                                    ...prev,
                                    codeSettings: {
                                      ...prev.codeSettings,
                                      questions: updatedQuestions
                                    }
                                  }));
                                }}
                                placeholder={`Option ${optIdx + 1}`}
                                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedQuestions = [...activityContent.codeSettings.questions];
                                  updatedQuestions[idx].options = updatedQuestions[idx].options.filter((_, i) => i !== optIdx);
                                  if (question.correctOption === optIdx) {
                                    updatedQuestions[idx].correctOption = null;
                                  }
                                  setActivityContent(prev => ({
                                    ...prev,
                                    codeSettings: {
                                      ...prev.codeSettings,
                                      questions: updatedQuestions
                                    }
                                  }));
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )) : null}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = [...activityContent.codeSettings.questions];
                              if (!updatedQuestions[idx].options) {
                                updatedQuestions[idx].options = [];
                              }
                              updatedQuestions[idx].options.push("");
                              setActivityContent(prev => ({
                                ...prev,
                                codeSettings: {
                                  ...prev.codeSettings,
                                  questions: updatedQuestions
                                }
                              }));
                            }}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1 mt-1"
                          >
                            <PlusCircle size={12} />
                            Add Option
                          </button>
                        </div>
                      )}
                      
                      {question.type === 'short-answer' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={question.answer || ''}
                            onChange={e => {
                              const updatedQuestions = [...activityContent.codeSettings.questions];
                              updatedQuestions[idx].answer = e.target.value;
                              setActivityContent(prev => ({
                                ...prev,
                                codeSettings: {
                                  ...prev.codeSettings,
                                  questions: updatedQuestions
                                }
                              }));
                            }}
                            placeholder="Expected answer (for grading)"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    const currentQuestions = activityContent.codeSettings?.questions || [];
                    setActivityContent(prev => ({
                      ...prev,
                      codeSettings: {
                        ...prev.codeSettings,
                        questions: [
                          ...currentQuestions,
                          {
                            text: '',
                            type: 'short-answer',
                            points: 10
                          }
                        ]
                      }
                    }));
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
                Programming Language
              </label>
              <select
                id="programmingLanguage"
                value={activityContent.codeSettings?.language || 'javascript'}
                onChange={e => setActivityContent(prev => ({
                  ...prev,
                  codeSettings: {
                    ...prev.codeSettings,
                    language: e.target.value
                  }
                }))}
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
                Difficulty Level
              </label>
              <div className="flex gap-3">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setActivityContent(prev => ({
                      ...prev,
                      codeSettings: {
                        ...prev.codeSettings,
                        difficulty: level.toLowerCase()
                      }
                    }))}
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
                    setActivityContent(prev => ({
                      ...prev,
                      codeSettings: {
                        ...prev.codeSettings,
                        challenges: [
                          ...challenges,
                          { 
                            id: Date.now(), 
                            title: `Challenge ${challenges.length + 1}`, 
                            description: '',
                            points: 10
                          }
                        ]
                      }
                    }));
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
                            value={challenge.title}
                            onChange={e => {
                              const updatedChallenges = [...activityContent.codeSettings.challenges];
                              updatedChallenges[idx].title = e.target.value;
                              setActivityContent(prev => ({
                                ...prev,
                                codeSettings: {
                                  ...prev.codeSettings,
                                  challenges: updatedChallenges
                                }
                              }));
                            }}
                            placeholder="Challenge title"
                            className="text-sm font-medium focus:outline-none focus:border-b focus:border-purple-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedChallenges = activityContent.codeSettings.challenges.filter(
                              (_, i) => i !== idx
                            );
                            setActivityContent(prev => ({
                              ...prev,
                              codeSettings: {
                                ...prev.codeSettings,
                                challenges: updatedChallenges
                              }
                            }));
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        value={challenge.description}
                        onChange={e => {
                          const updatedChallenges = [...activityContent.codeSettings.challenges];
                          updatedChallenges[idx].description = e.target.value;
                          setActivityContent(prev => ({
                            ...prev,
                            codeSettings: {
                              ...prev.codeSettings,
                              challenges: updatedChallenges
                            }
                          }));
                        }}
                        placeholder="Describe the challenge requirements..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        rows="2"
                      />
                      <div className="flex justify-end mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Points:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={challenge.points}
                            onChange={e => {
                              const updatedChallenges = [...activityContent.codeSettings.challenges];
                              updatedChallenges[idx].points = parseInt(e.target.value) || 0;
                              setActivityContent(prev => ({
                                ...prev,
                                codeSettings: {
                                  ...prev.codeSettings,
                                  challenges: updatedChallenges
                                }
                              }));
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
                Initial Code (Template for students)
              </label>
              <textarea
                id="initialCode"
                value={activityContent.codeSettings?.initialCode || '// Write your initial code here\n// This will be shown to students when they start the activity\n\nfunction example() {\n  // Your code here\n  return "Hello World";\n}'}
                onChange={e => setActivityContent(prev => ({
                  ...prev,
                  codeSettings: {
                    ...prev.codeSettings,
                    initialCode: e.target.value
                  }
                }))}
                placeholder="Provide initial code for students to start with..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono bg-gray-900 text-gray-100"
                rows="6"
              />
            </div>
            
            <div>
              <label htmlFor="testCases" className="block text-sm font-medium text-gray-700 mb-1">
                Test Cases (For autograding)
              </label>
              <textarea
                id="testCases"
                value={activityContent.codeSettings?.testCases || '// Example test cases\n// These will be used to check student code\n\ntest("example returns Hello World", () => {\n  expect(example()).toBe("Hello World");\n});'}
                onChange={e => setActivityContent(prev => ({
                  ...prev,
                  codeSettings: {
                    ...prev.codeSettings,
                    testCases: e.target.value
                  }
                }))}
                placeholder="Write test cases to validate student code..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono bg-gray-800 text-green-300"
                rows="6"
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Student View Preview</h4>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 border-b border-gray-300 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700">code-editor.js</span>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                      Run
                    </button>
                    <button className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
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
            {activityContent.questions.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium py-1 px-3 rounded-full">
                {activityContent.questions.length} {activityContent.questions.length === 1 ? 'Question' : 'Questions'} Added
              </span>
            )}
          </div>
          
          <QuestionBuilder
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            handleAddQuestion={handleAddQuestion}
            questions={activityContent.questions}
          />
        </div>
      )}
    </form>
  </motion.div>
);

export default ActivityForm;