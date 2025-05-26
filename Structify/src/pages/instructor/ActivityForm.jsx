import React from 'react';
import QuestionBuilder from './QuestionBuilder';
import { FileText, Code, Calendar, AlignLeft, Loader, PlusCircle, HelpCircle } from 'lucide-react';
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
    </form>
  </motion.div>
);

export default ActivityForm;