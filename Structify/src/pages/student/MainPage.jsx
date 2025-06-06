import { useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import SubHeading from '../../components/SubHeading';
import Header from '../../components/Header';
import CardSection from '../../components/CardSection';
import WeekButton from '../../components/WeekButton';
import LearningPath from '../../components/LearningPath';

import CheckIcon from '../../assets/images/Check Icon.png';
import UncheckIcon from '../../assets/images/Uncheck Icon.png';
import PracticeIcon from '../../assets/images/Practice Icon.png';
import StudyIcon from '../../assets/images/Study Icon.png';

import RankStats from '../../components/RankStats';
import { useLessonProgress } from '../../context/lessonProgressContext';
import BackgroundSound from '../../components/BackgroundSound';

function MainPage() {
  const { completedLessons, completedActivities, activityScores } = useLessonProgress();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLearningPathOpen, setIsLearningPathOpen] = useState(false);

  const toggleLearningPath = () => {
    setIsLearningPathOpen(!isLearningPathOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] text-white flex flex-col">
      <Header />

      <SubHeading 
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        toggleLearningPath={() => setIsLearningPathOpen(!isLearningPathOpen)}
        title="Introduction to Data Structures"
      />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Navigation Bar: Hidden by default on mobile, toggleable */}
        {isNavOpen && (
          <div className="fixed inset-y-0 left-0 z-50 bg-[#141a35] flex flex-col items-center py-6 px-2 border-r border-white/20 transition-transform duration-300 ease-in-out w-64 md:w-16 md:static md:h-screen md:translate-x-0">
            <NavigationBar />
            {/* Close Button for Mobile */}
            <button
              className="md:hidden absolute top-4 right-4 text-white focus:ring-2 focus:ring-white"
              onClick={() => setIsNavOpen(false)}
              aria-label="Close Navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Backdrop for Mobile */}
        {isNavOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsNavOpen(false)}
          ></div>
        )}
        <main className="flex-1 px-4 sm:px-8 md:px-12 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8">
            {/* Left Section */}
            <RankStats/>

            {/* Right Section */}
            <div className="w-full lg:w-1/2 flex-shrink-0 bg-[#141a35] p-4 sm:p-6 rounded-lg shadow-xl mt-6 lg:mt-0 relative group overflow-hidden">

              {/* Glowing animated border */}
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 z-0" />

              {/* Moving background icon (optional shimmer object) */}
              <div className="absolute top-1/2 left-[-20%] w-72 h-72 bg-gradient-to-tr from-indigo-400 via-blue-500 to-transparent 
                              opacity-20 animate-move-slow rounded-full blur-3xl z-0" />

              {/* Content wrapper with z-index */}
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide mb-2 text-white">WEEK 1 GOALS</h2>
                <div className="border-t border-white/50 w-full mb-4 sm:mb-5"></div>

                {/* Lessons */}
                <div className="space-y-3 sm:space-y-4">
                  <WeekButton 
                    title="What is Data Structure?" 
                    status="LEARN" 
                    icon={completedLessons.includes("lesson1") ? CheckIcon : UncheckIcon}
                    iconType={StudyIcon} 
                    path="/page1"
                  />
                  <WeekButton 
                    title="Types of Basic Data Structures" 
                    status="LEARN" 
                    icon={completedLessons.includes("lesson2") ? CheckIcon : UncheckIcon}
                    iconType={StudyIcon} 
                    path="/l2page1"
                  />
                  <WeekButton 
                    title="How Computers use Data Structures" 
                    status="LEARN" 
                    icon={completedLessons.includes("lesson3") ? CheckIcon : UncheckIcon}
                    iconType={StudyIcon} 
                    path="/l3page1"
                  />
                </div>

                {/* Activities */}
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-300">Activities</h3>
                  <WeekButton 
                    title="Activity 1" 
                    status={`SCORE: ${activityScores["activity1"] ?? "-"}`}
                    icon={completedActivities.includes("activity1") ? CheckIcon : UncheckIcon}
                    iconType={PracticeIcon} 
                    path="/Week1Activity1"
                  />
                  <WeekButton 
                    title="Activity 2" 
                    status={`SCORE: ${activityScores["activity2"] ?? "-"}`}
                    icon={completedActivities.includes("activity2") ? CheckIcon : UncheckIcon}
                    iconType={PracticeIcon} 
                    path="/Week1Activity2"
                  />
                  <WeekButton 
                    title="Activity 3" 
                    status={`SCORE: ${activityScores["activity3"] ?? "-"}`}
                    icon={completedActivities.includes("activity3") ? CheckIcon : UncheckIcon}
                    iconType={PracticeIcon} 
                    path="/Week1Activity3"
                  />
                </div>
              </div>
            </div>

          </div>
        </main>
        

        {/* Learning Path: Full width on mobile */}
        <LearningPath 
          isOpen={isLearningPathOpen} 
          toggleLearningPath={toggleLearningPath} 
        />
      </div>
    </div>
    
  );
}

export default MainPage;