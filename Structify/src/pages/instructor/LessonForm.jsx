import React from 'react';

const LessonForm = ({ lessonContent, setLessonContent, handleFileUpload, handleLessonSubmit, uploadProgress, onDeleteFile }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4">Create New Lesson</h2>
    <form onSubmit={handleLessonSubmit} className="space-y-4">
      <div>
        <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="lessonTitle"
          type="text"
          value={lessonContent.title}
          onChange={e => setLessonContent(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter lesson title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="lessonWeek" className="block text-sm font-medium text-gray-700 mb-1">
          Week
        </label>
        <select
          id="lessonWeek"
          value={lessonContent.week}
          onChange={e => setLessonContent(prev => ({ ...prev, week: e.target.value }))}
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
        <label htmlFor="lessonDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="lessonDescription"
          value={lessonContent.description}
          onChange={e => setLessonContent(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter lesson description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
          <label htmlFor="pptUpload" className="cursor-pointer">
            <span className="block text-sm text-gray-600">Upload PPT/PDF</span>
            <input
              id="pptUpload"
              type="file"
              accept=".ppt,.pptx,.pdf"
              onChange={e => handleFileUpload(e, 'lesson')}
              className="hidden"
            />
          </label>
        </div>
        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
          <label htmlFor="imageUpload" className="cursor-pointer">
            <span className="block text-sm text-gray-600">Upload Images</span>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileUpload(e, 'lesson')}
              className="hidden"
            />
          </label>
        </div>
        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
          <label htmlFor="videoUpload" className="cursor-pointer">
            <span className="block text-sm text-gray-600">Upload Videos</span>
            <input
              id="videoUpload"
              type="file"
              accept="video/*"
              multiple
              onChange={e => handleFileUpload(e, 'lesson')}
              className="hidden"
            />
          </label>
        </div>
      </div>
      {/* Display uploaded files */}
      {lessonContent.media.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
          <ul className="space-y-2">
            {lessonContent.media.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">{file.name}</span>
                <div className="flex items-center gap-2">
                  {uploadProgress[file.name] === 100 && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => onDeleteFile(file)}
                    title="Delete file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <label htmlFor="lessonText" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Text Content
        </label>
        <textarea
          id="lessonText"
          value={lessonContent.text}
          onChange={e => setLessonContent(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Enter additional text content"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Lesson
      </button>
    </form>
  </div>
);

export default LessonForm; 