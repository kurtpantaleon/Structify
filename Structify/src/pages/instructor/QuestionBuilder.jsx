import React from 'react';

const QuestionBuilder = ({ currentQuestion, setCurrentQuestion, handleAddQuestion, questions }) => (
  <div className="mt-6 border-t pt-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Add Questions</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Type
        </label>
        <select
          value={currentQuestion.type}
          onChange={e => setCurrentQuestion(prev => ({
            ...prev,
            type: e.target.value,
            options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : [],
            correctAnswer: e.target.value === 'multiple-choice' ? 0 : ''
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="short-answer">Short Answer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <textarea
          value={currentQuestion.question}
          onChange={e => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
          placeholder="Enter your question"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </div>
      {currentQuestion.type === 'multiple-choice' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options
          </label>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={currentQuestion.correctAnswer === index}
                onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                className="h-4 w-4 text-blue-600"
              />
              <input
                type="text"
                value={option}
                onChange={e => setCurrentQuestion(prev => ({
                  ...prev,
                  options: prev.options.map((opt, i) => i === index ? e.target.value : opt)
                }))}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      )}
      {currentQuestion.type === 'true-false' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="correctAnswer"
                checked={currentQuestion.correctAnswer === 'true'}
                onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">True</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="correctAnswer"
                checked={currentQuestion.correctAnswer === 'false'}
                onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2">False</span>
            </label>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          min="1"
          value={currentQuestion.points}
          onChange={e => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="button"
        onClick={handleAddQuestion}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Add Question
      </button>
    </div>
    {/* Display added questions */}
    {questions.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Added Questions</h3>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{question.question}</p>
              <p className="text-sm text-gray-500 mt-1">
                Type: {question.type} | Points: {question.points}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default QuestionBuilder; 