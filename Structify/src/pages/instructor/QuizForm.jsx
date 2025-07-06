import React, { useEffect } from 'react';
import QuestionBuilder from './QuestionBuilder';
import { Book, Calendar, AlignLeft, Clock, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizForm = ({ quizContent, setQuizContent, currentQuestion, setCurrentQuestion, handleAddQuestion, handleQuizSubmit, isSubmitting = false }) => {
  // Validate and fix form fields if necessary
  useEffect(() => {
    if (!quizContent.timeLimit) {
      setQuizContent(prev => ({ ...prev, timeLimit: 30 })); // Default time limit
    }
    
    // Initialize optional settings if they don't exist
    if (quizContent.randomizeQuestions === undefined) {
      setQuizContent(prev => ({ ...prev, randomizeQuestions: false }));
    }
    if (quizContent.showResultsImmediately === undefined) {
      setQuizContent(prev => ({ ...prev, showResultsImmediately: false }));
    }
  }, []);

  // Handle time limit change with proper validation
  const handleTimeLimitChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuizContent(prev => ({ ...prev, timeLimit: '' }));
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        setQuizContent(prev => ({ ...prev, timeLimit: numValue }));
      }
    }
  };

  // Handle form submission with validation
  const onSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!quizContent.title?.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    if (!quizContent.week) {
      alert('Please select a week');
      return;
    }
    if (!quizContent.description?.trim()) {
      alert('Please enter a quiz description');
      return;
    }
    if (!quizContent.timeLimit || quizContent.timeLimit <= 0) {
      alert('Please set a valid time limit');
      return;
    }
    if (!quizContent.questions || quizContent.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // If all validations pass, call the submit handler
    handleQuizSubmit(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form id="quiz-form" onSubmit={onSubmit} className="space-y-6">
        {/* Basic Quiz Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="quizTitle" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Book size={16} className="mr-2 text-green-500" />
                Quiz Title
              </label>
              <input
                id="quizTitle"
                type="text"
                value={quizContent.title || ''}
                onChange={e => setQuizContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive quiz title"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="quizWeek" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="mr-2 text-green-500" />
                Week
              </label>
              <select
                id="quizWeek"
                value={quizContent.week || ''}
                onChange={e => setQuizContent(prev => ({ ...prev, week: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-all duration-200"
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
            <label htmlFor="quizDescription" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <AlignLeft size={16} className="mr-2 text-green-500" />
              Description
            </label>
            <textarea
              id="quizDescription"
              value={quizContent.description || ''}
              onChange={e => setQuizContent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what students should expect in this quiz"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              rows="4"
              required
            />
          </div>
        </div>

        {/* Quiz Settings Panel */}
        <motion.div 
          className="bg-green-50 rounded-xl p-5 border border-green-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
            <Settings size={18} className="mr-2 text-green-600" />
            Quiz Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center mb-3">
                <Clock size={18} className="text-green-600 mr-2" />
                <label htmlFor="timeLimit" className="text-sm font-medium text-gray-700">
                  Time Limit (minutes)
                </label>
              </div>
              <input
                id="timeLimit"
                type="number"
                min="1"
                value={quizContent.timeLimit || ''}
                onChange={handleTimeLimitChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Set a reasonable time based on quiz length and difficulty.
              </p>
            </div>
            
            {/* Add an option for randomizing questions */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 flex flex-col justify-between">
              <div className="flex items-center mb-3">
                <HelpCircle size={18} className="text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Randomize Questions</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={quizContent.randomizeQuestions || false}
                  onChange={e => setQuizContent(prev => ({ ...prev, randomizeQuestions: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {quizContent.randomizeQuestions ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Shuffles questions for each student.
              </p>
            </div>
            
            {/* Add an option for showing results immediately */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 flex flex-col justify-between">
              <div className="flex items-center mb-3">
                <AlertCircle size={18} className="text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Show Results Immediately</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={quizContent.showResultsImmediately || false} 
                  onChange={e => setQuizContent(prev => ({ ...prev, showResultsImmediately: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {quizContent.showResultsImmediately ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Students see results right after each answer.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Quiz summary panel */}
        <motion.div 
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <HelpCircle size={20} className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-xl font-semibold text-gray-800">{quizContent.questions?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Time Limit</p>
                <p className="text-xl font-semibold text-gray-800">{quizContent.timeLimit || 0} min</p>
              </div>
            </div>
            
            <div className="flex items-center ml-auto">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                {calculateDifficulty(quizContent.questions || [])}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question builder */}
        <QuestionBuilder
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          handleAddQuestion={handleAddQuestion}
          questions={quizContent.questions || []}
        />

        {/* Submit button */}
        {/* <div className="flex justify-end mt-8">
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} 
            text-white rounded-lg shadow-md flex items-center space-x-2 transition-colors`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Quiz</span>
            )}
          </button>
        </div> */}
      </form>
    </motion.div>
  );
};

// Helper function to calculate quiz difficulty based on questions
const calculateDifficulty = (questions) => {
  if (!questions || questions.length === 0) return "Not enough questions";
  
  // This is a simple algorithm - you can make it more sophisticated
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const avgPoints = totalPoints / questions.length;
  
  if (questions.length < 5) return "Basic Quiz";
  if (questions.length >= 10 && avgPoints > 2) return "Advanced Quiz";
  return "Intermediate Quiz";
};

export default QuizForm;