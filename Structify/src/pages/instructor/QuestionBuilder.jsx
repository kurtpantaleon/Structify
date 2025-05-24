import React from 'react';
import { HelpCircle, Plus, CheckCircle, CheckSquare, List, Type, Award, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionBuilder = ({ currentQuestion, setCurrentQuestion, handleAddQuestion, questions }) => (
  <div className="mt-8">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <HelpCircle size={18} className="mr-2 text-indigo-600" />
        Question Builder
      </h3>
      {questions.length > 0 && (
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium py-1 px-3 rounded-full">
          {questions.length} {questions.length === 1 ? 'Question' : 'Questions'} Added
        </span>
      )}
    </div>
    
    <motion.div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-5">
        {/* Question Type Selector */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
              currentQuestion.type === 'multiple-choice' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setCurrentQuestion(prev => ({
              ...prev,
              type: 'multiple-choice',
              options: ['', '', '', ''],
              correctAnswer: 0
            }))}
          >
            <List size={20} className={`mb-2 ${currentQuestion.type === 'multiple-choice' ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${currentQuestion.type === 'multiple-choice' ? 'text-indigo-700' : 'text-gray-700'}`}>
              Multiple Choice
            </span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
              currentQuestion.type === 'true-false' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setCurrentQuestion(prev => ({
              ...prev,
              type: 'true-false',
              options: [],
              correctAnswer: 'true'
            }))}
          >
            <CheckSquare size={20} className={`mb-2 ${currentQuestion.type === 'true-false' ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${currentQuestion.type === 'true-false' ? 'text-indigo-700' : 'text-gray-700'}`}>
              True/False
            </span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
              currentQuestion.type === 'short-answer' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setCurrentQuestion(prev => ({
              ...prev,
              type: 'short-answer',
              options: [],
              correctAnswer: ''
            }))}
          >
            <Type size={20} className={`mb-2 ${currentQuestion.type === 'short-answer' ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${currentQuestion.type === 'short-answer' ? 'text-indigo-700' : 'text-gray-700'}`}>
              Short Answer
            </span>
          </motion.div>
        </div>
        
        {/* Question Content */}
        <div className="pt-3">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <HelpCircle size={16} className="mr-2 text-indigo-500" />
            Question Text
          </label>
          <textarea
            value={currentQuestion.question}
            onChange={e => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Enter your question here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            rows="2"
          />
        </div>
        
        {/* Answer Options based on question type */}
        <AnimatePresence mode="wait">
          {currentQuestion.type === 'multiple-choice' && (
            <motion.div 
              key="multiple-choice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2"
            >
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <List size={16} className="mr-2 text-indigo-500" />
                Answer Choices <span className="text-xs text-gray-500 ml-2">(select the correct one)</span>
              </label>
              
              {currentQuestion.options.map((option, index) => (
                <motion.div 
                  key={index} 
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                    currentQuestion.correctAnswer === index ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                  }`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      id={`option-${index}`}
                    />
                    {currentQuestion.correctAnswer === index && (
                      <CheckCircle size={14} className="text-green-500 ml-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={e => setCurrentQuestion(prev => ({
                        ...prev,
                        options: prev.options.map((opt, i) => i === index ? e.target.value : opt)
                      }))}
                      placeholder={`Option ${index + 1}`}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                        currentQuestion.correctAnswer === index 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {currentQuestion.type === 'true-false' && (
            <motion.div 
              key="true-false"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2"
            >
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CheckSquare size={16} className="mr-2 text-indigo-500" />
                Correct Answer
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.label 
                  className={`flex items-center justify-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                    currentQuestion.correctAnswer === 'true' 
                      ? 'bg-green-50 border-green-500 shadow-sm' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={currentQuestion.correctAnswer === 'true'}
                    onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-2"
                  />
                  <span className={`font-medium ${currentQuestion.correctAnswer === 'true' ? 'text-green-700' : 'text-gray-700'}`}>True</span>
                  {currentQuestion.correctAnswer === 'true' && (
                    <CheckCircle size={16} className="text-green-500 ml-2" />
                  )}
                </motion.label>
                
                <motion.label 
                  className={`flex items-center justify-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                    currentQuestion.correctAnswer === 'false' 
                      ? 'bg-green-50 border-green-500 shadow-sm' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={currentQuestion.correctAnswer === 'false'}
                    onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-2"
                  />
                  <span className={`font-medium ${currentQuestion.correctAnswer === 'false' ? 'text-green-700' : 'text-gray-700'}`}>False</span>
                  {currentQuestion.correctAnswer === 'false' && (
                    <CheckCircle size={16} className="text-green-500 ml-2" />
                  )}
                </motion.label>
              </div>
            </motion.div>
          )}
          
          {currentQuestion.type === 'short-answer' && (
            <motion.div 
              key="short-answer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2"
            >
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Type size={16} className="mr-2 text-indigo-500" />
                Expected Answer (Optional)
              </label>
              <input
                type="text"
                value={currentQuestion.correctAnswer}
                onChange={e => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                placeholder="Enter expected answer or keywords (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 italic">
                For short answers, you can leave this blank if multiple answers are acceptable or provide keywords for auto-grading.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Points allocation */}
        <div className="flex items-center pt-3">
          <div className="w-1/3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Award size={16} className="mr-2 text-indigo-500" />
              Points
            </label>
          </div>
          <div className="w-2/3">
            <input
              type="number"
              min="1"
              value={currentQuestion.points}
              onChange={e => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            />
          </div>
        </div>
        
        {/* Add question button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleAddQuestion}
          disabled={!currentQuestion.question.trim()}
          className="w-full mt-4 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Add Question to List
        </motion.button>
      </div>
    </motion.div>
    
    {/* Display added questions */}
    <AnimatePresence>
      {questions.length > 0 && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle size={18} className="mr-2 text-green-600" />
            Questions List
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {questions.map((question, index) => (
              <motion.div 
                key={index} 
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full mr-2">
                      Q{index + 1}
                    </span>
                    <h4 className="font-medium text-gray-800">{question.question}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                      <Award size={12} className="mr-1" />
                      {question.points} pts
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      question.type === 'multiple-choice' ? 'bg-blue-100 text-blue-800' :
                      question.type === 'true-false' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {question.type === 'multiple-choice' ? 'Multiple Choice' :
                       question.type === 'true-false' ? 'True/False' : 'Short Answer'}
                    </span>
                  </div>
                </div>
                
                {/* Show preview of options if multiple choice */}
                {question.type === 'multiple-choice' && question.options.length > 0 && (
                  <div className="mt-2 pl-6">
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`text-sm p-1.5 px-3 rounded ${
                          optIndex === question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {optIndex === question.correctAnswer && (
                            <CheckCircle size={12} className="inline mr-1 text-green-600" />
                          )}
                          {option || `Option ${optIndex + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show correct answer if true/false */}
                {question.type === 'true-false' && (
                  <div className="mt-2 pl-6">
                    <span className="text-sm bg-green-100 text-green-800 p-1.5 px-3 rounded">
                      Correct: {question.correctAnswer === 'true' ? 'True' : 'False'}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default QuestionBuilder;