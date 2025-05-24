import React from 'react';
import { Book, Calendar, AlignLeft, FileText, Upload, Image, Video, X, FileType, Check, Info, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const LessonForm = ({ lessonContent, setLessonContent, handleFileUpload, handleLessonSubmit, uploadProgress, onDeleteFile, isSubmitting = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <form id="lesson-form" onSubmit={handleLessonSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="lessonTitle" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Book size={16} className="mr-2 text-blue-500" />
              Title
            </label>
            <input
              id="lessonTitle"
              type="text"
              value={lessonContent.title}
              onChange={e => setLessonContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a descriptive lesson title"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="lessonWeek" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="mr-2 text-blue-500" />
              Week
            </label>
            <select
              id="lessonWeek"
              value={lessonContent.week}
              onChange={e => setLessonContent(prev => ({ ...prev, week: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
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
          <label htmlFor="lessonDescription" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <AlignLeft size={16} className="mr-2 text-blue-500" />
            Description
          </label>
          <textarea
            id="lessonDescription"
            value={lessonContent.description}
            onChange={e => setLessonContent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Summarize what students will learn in this lesson"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            rows="4"
            required
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <Upload size={18} className="mr-2 text-blue-600" />
            Upload Materials
          </h3>
          {lessonContent.media.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-3 rounded-full">
              {lessonContent.media.length} {lessonContent.media.length === 1 ? 'File' : 'Files'} Added
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
          >
            <label htmlFor="pptUpload" className="cursor-pointer flex flex-col items-center">
              <FileType className="w-10 h-10 text-blue-600 mb-2" />
              <span className="block text-sm font-medium text-blue-700">Upload Presentations</span>
              <span className="text-xs text-blue-500 mt-1">PPT, PDF, DOCX</span>
              <input
                id="pptUpload"
                type="file"
                accept=".ppt,.pptx,.pdf,.doc,.docx"
                onChange={e => handleFileUpload(e, 'lesson')}
                className="hidden"
              />
            </label>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
          >
            <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
              <Image className="w-10 h-10 text-blue-600 mb-2" />
              <span className="block text-sm font-medium text-blue-700">Upload Images</span>
              <span className="text-xs text-blue-500 mt-1">PNG, JPG, SVG, GIF</span>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                multiple
                onChange={e => handleFileUpload(e, 'lesson')}
                className="hidden"
              />
            </label>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
          >
            <label htmlFor="videoUpload" className="cursor-pointer flex flex-col items-center">
              <Video className="w-10 h-10 text-blue-600 mb-2" />
              <span className="block text-sm font-medium text-blue-700">Upload Videos</span>
              <span className="text-xs text-blue-500 mt-1">MP4, WEBM, MOV</span>
              <input
                id="videoUpload"
                type="file"
                accept="video/*"
                multiple
                onChange={e => handleFileUpload(e, 'lesson')}
                className="hidden"
              />
            </label>
          </motion.div>
        </div>
      </div>

      {/* Display uploaded files with improved styling */}
      {lessonContent.media.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <FileText size={16} className="mr-2 text-blue-600" />
            Uploaded Materials
          </h3>
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {lessonContent.media.map((file, index) => {
              const fileExtension = file.name.split('.').pop()?.toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension);
              const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension);
              const isDocument = ['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(fileExtension);
              
              return (
                <motion.li 
                  key={index} 
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center overflow-hidden">
                    {isImage && <Image size={16} className="text-blue-500 mr-2 flex-shrink-0" />}
                    {isVideo && <Video size={16} className="text-blue-500 mr-2 flex-shrink-0" />}
                    {isDocument && <FileType size={16} className="text-blue-500 mr-2 flex-shrink-0" />}
                    {!isImage && !isVideo && !isDocument && <FileText size={16} className="text-blue-500 mr-2 flex-shrink-0" />}
                    
                    <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Upload progress indicator */}
                    {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {uploadProgress[file.name] === 100 && (
                      <span className="text-green-500">
                        <Check size={16} />
                      </span>
                    )}
                    
                    <button
                      type="button"
                      className="p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                      onClick={() => onDeleteFile(file)}
                      title="Delete file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      )}

      {/* Text Content Section */}
      <div className="mt-6">
        <label htmlFor="lessonText" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <FileText size={16} className="mr-2 text-blue-500" />
          Learning Content
        </label>
        
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-3 flex items-start">
          <Info size={16} className="mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
          <p>Use this area to provide detailed lesson content, instructions, or additional resources for students.</p>
        </div>
        
        <textarea
          id="lessonText"
          value={lessonContent.text}
          onChange={e => setLessonContent(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Enter lesson content here. You can include explanations, examples, and detailed instructions..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          rows="8"
        />
      </div>
    </form>
  </motion.div>
);

export default LessonForm;