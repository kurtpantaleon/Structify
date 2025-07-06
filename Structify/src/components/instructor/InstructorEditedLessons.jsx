import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import WeekButton from '../WeekButton';
import CheckIcon from '../../assets/images/Check Icon.png';
import UncheckIcon from '../../assets/images/Uncheck Icon.png';
import StudyIcon from '../../assets/images/Study Icon.png';

function InstructorEditedLessons({ lessonType, onLessonTypeChange }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('Week 1');

  // Learning path data for week selection
  const learningPathData = [
    { week: "Week 1", topic: "Introduction to Data Structures" },
    { week: "Week 2", topic: "Algorithms & Complexity" },
    { week: "Week 3", topic: "String Processing" },
    { week: "Week 4 and 5", topic: "Array, Records, and Pointers" },
    { week: "Week 6", topic: "Linked Lists" },
    { week: "Week 7 and 8", topic: "Stacks, Queues, and Recursion" },
    { week: "Week 10 and 11", topic: "Trees" },
    { week: "Week 12 and 13", topic: "Graph Algorithms" },
    { week: "Week 14 and 16", topic: "Sorting and Searching" },
    { week: "Week 17", topic: "Hashing" }
  ];

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const lessonsRef = collection(db, 'structifyLessons');
        const q = query(
          lessonsRef,
          where('week', '==', selectedWeek)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedLessons = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => {
            // Sort by createdAt timestamp in descending order
            return b.createdAt?.seconds - a.createdAt?.seconds;
          });
        
        setLessons(fetchedLessons);
        setError(null);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [selectedWeek]);

  return (
    <div className="w-full lg:w-1/2 flex-shrink-0 bg-[#141a35] p-4 sm:p-6 rounded-lg shadow-xl mt-6 lg:mt-0 relative group overflow-hidden">
      {/* Glowing animated border */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 z-0" />

      {/* Moving background icon */}
      <div className="absolute top-1/2 left-[-20%] w-72 h-72 bg-gradient-to-tr from-indigo-400 via-blue-500 to-transparent 
                    opacity-20 animate-move-slow rounded-full blur-3xl z-0" />

      {/* Content wrapper with z-index */}
      <div className="relative z-10">
        <div className="mb-2">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white mb-3">UPLOADED LESSONS</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative w-full sm:w-auto flex-grow group/select">
              <select 
                className="appearance-none bg-gradient-to-r from-[#1a2142] to-[#232d5d] text-white border border-blue-500/50 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full shadow-md hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {learningPathData.map((item, index) => (
                  <option key={index} value={item.week} className="bg-[#1F274D] text-white py-3 px-4 hover:bg-[#2a3566] cursor-pointer transition-colors duration-150">
                    {item.week} - {item.topic}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-blue-400 group-hover/select:text-blue-300 transition-colors duration-200">
                <div className="rounded-full bg-blue-500/10 p-1 group-hover/select:bg-blue-500/20 transition-all duration-300 ml-2">
                  <svg className="h-4 w-4 fill-current transform transition-transform duration-300 group-hover/select:translate-y-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pointer-events-none group-hover/select:from-blue-600/15 group-hover/select:to-indigo-600/15 transition-all duration-300"></div>
              <div className="absolute -inset-[0.5px] rounded-md bg-gradient-to-r from-blue-400/30 to-indigo-400/30 opacity-0 group-hover/select:opacity-100 blur-[1px] transition-opacity duration-300 pointer-events-none"></div>
              <label className="absolute -top-2 left-2 px-1 text-xs bg-[#141a35] pointer-events-none z-10 font-medium">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300 group-hover/select:from-blue-200 group-hover/select:to-indigo-200 transition-all duration-300">Week</span>
              </label>
            </div>
            <div className="relative w-full sm:w-auto group/select">
              <select 
                className="appearance-none bg-gradient-to-r from-[#1a2142] to-[#232d5d] text-white border border-blue-500/50 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full shadow-md hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 pr-10"
                value={lessonType}
                onChange={onLessonTypeChange}
                aria-label="Select lesson type"
              >
                <option value="structify" className="bg-[#1F274D] text-white py-3 px-4 hover:bg-[#2a3566] cursor-pointer border-b border-blue-400/10">Structify Lessons</option>
                <option value="instructor" className="bg-[#1F274D] text-white py-3 px-4 hover:bg-[#2a3566] cursor-pointer">Instructor Lessons</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-blue-400 group-hover/select:text-blue-300 transition-colors duration-200">
                <div className="rounded-full bg-blue-500/10 p-1.5 group-hover/select:bg-blue-500/20 transition-all duration-300 ml-1">
                  <svg className="h-3.5 w-3.5 fill-current transform transition-transform duration-300 group-hover/select:translate-y-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pointer-events-none group-hover/select:from-blue-600/15 group-hover/select:to-indigo-600/15 transition-all duration-300"></div>
              <div className="absolute -inset-[0.5px] rounded-md bg-gradient-to-r from-blue-400/30 to-indigo-400/30 opacity-0 group-hover/select:opacity-100 blur-[1px] transition-opacity duration-300 pointer-events-none"></div>
              <label className="absolute -top-2 left-2 px-1 text-xs bg-[#141a35] pointer-events-none z-10 font-medium">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300 group-hover/select:from-blue-200 group-hover/select:to-indigo-200 transition-all duration-300">Lesson Type</span>
              </label>
            </div>
          </div>
        </div>
        <div className="border-t border-white/50 w-full mb-4 sm:mb-5"></div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-red-400 text-center py-4">
            {error}
          </div>
        )}

        {/* Lessons */}
        {!loading && !error && (
          <div className="space-y-3 sm:space-y-4">
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <WeekButton 
                  key={lesson.id}
                  title={lesson.title} 
                  status="LEARN" 
                  icon={UncheckIcon}
                  iconType={StudyIcon} 
                  path={`/instructor-lesson/${lesson.id}`}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No lessons available for this week
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorEditedLessons;
