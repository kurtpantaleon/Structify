import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import WeekButton from './WeekButton';
import CheckIcon from '../assets/images/Check Icon.png';
import UncheckIcon from '../assets/images/Uncheck Icon.png';
import StudyIcon from '../assets/images/Study Icon.png';

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
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white mb-3">INSTRUCTOR EDITED LESSONS</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <select 
              className="bg-[#1F274D] text-white border border-white/20 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {learningPathData.map((item, index) => (
                <option key={index} value={item.week}>
                  {item.week} - {item.topic}
                </option>
              ))}
            </select>
            <select 
              className="bg-[#1F274D] text-white border border-white/20 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={lessonType}
              onChange={onLessonTypeChange}
            >
              <option value="structify">Structify Lessons</option>
              <option value="instructor">Instructor Lessons</option>
            </select>
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
