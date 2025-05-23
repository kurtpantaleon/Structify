import React from 'react';
import QuestionBuilder from './QuestionBuilder';

const ActivityForm = ({ activityContent, setActivityContent, currentQuestion, setCurrentQuestion, handleAddQuestion, handleActivitySubmit }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4">Create New Activity</h2>
    <form onSubmit={handleActivitySubmit} className="space-y-4">
      <div>
        <label htmlFor="activityTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="activityTitle"
          type="text"
          value={activityContent.title}
          onChange={e => setActivityContent(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter activity title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="activityWeek" className="block text-sm font-medium text-gray-700 mb-1">
          Week
        </label>
        <select
          id="activityWeek"
          value={activityContent.week}
          onChange={e => setActivityContent(prev => ({ ...prev, week: e.target.value }))}
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
        <label htmlFor="activityDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="activityDescription"
          value={activityContent.description}
          onChange={e => setActivityContent(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter activity description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div 
          className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${activityContent.type === 'form' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setActivityContent(prev => ({ ...prev, type: 'form' }))}
        >
          <span className="block text-sm text-gray-600">Form Activity</span>
        </div>
        <div 
          className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${activityContent.type === 'code' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setActivityContent(prev => ({ ...prev, type: 'code' }))}
        >
          <span className="block text-sm text-gray-600">Code Activity</span>
        </div>
      </div>
      <QuestionBuilder
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        handleAddQuestion={handleAddQuestion}
        questions={activityContent.questions}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Activity
      </button>
    </form>
  </div>
);

export default ActivityForm; 