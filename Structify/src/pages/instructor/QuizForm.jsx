import React from 'react';
import QuestionBuilder from './QuestionBuilder';

const QuizForm = ({ quizContent, setQuizContent, currentQuestion, setCurrentQuestion, handleAddQuestion, handleQuizSubmit }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>
    <form onSubmit={handleQuizSubmit} className="space-y-4">
      <div>
        <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="quizTitle"
          type="text"
          value={quizContent.title}
          onChange={e => setQuizContent(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter quiz title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="quizWeek" className="block text-sm font-medium text-gray-700 mb-1">
          Week
        </label>
        <select
          id="quizWeek"
          value={quizContent.week}
          onChange={e => setQuizContent(prev => ({ ...prev, week: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div>
        <label htmlFor="quizDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="quizDescription"
          value={quizContent.description}
          onChange={e => setQuizContent(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter quiz description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          required
        />
      </div>
      <div>
        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
          Time Limit (minutes)
        </label>
        <input
          id="timeLimit"
          type="number"
          min="1"
          value={quizContent.timeLimit}
          onChange={e => setQuizContent(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <QuestionBuilder
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        handleAddQuestion={handleAddQuestion}
        questions={quizContent.questions}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Quiz
      </button>
    </form>
  </div>
);

export default QuizForm; 