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

import card1 from "../../assets/clip/string.mp4"
import card2 from "../../assets/clip/operation.mp4"
import card3 from "../../assets/clip/process.mp4"
import Challenges from "../../assets/clip/challenge.mp4"


export default function Week7Page() {   // PAPALITAN YUNG WEEK NUMBER KASI COPY PASTE LANG
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLearningPathOpen, setIsLearningPathOpen] = useState(false);

  const toggleLearningPath = () => {
    setIsLearningPathOpen(!isLearningPathOpen);
  };
  return (
    <div className=" min-h-screen bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] text-white flex flex-col">
      <Header />

      <SubHeading 
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        toggleLearningPath={() => setIsLearningPathOpen(!isLearningPathOpen)}
        title="String Processing"
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

        <main className=" flex-1 px-12 py-8 ">
          <div className=" flex items-start gap-8 ">
            {/* Left Section */}
            <div className="w-6/12 flex-shrink-0">
              <h2 className="text-2xl font-extrabold tracking-wide mb-2">SECTION</h2>
              <div className="border-t border-white/50 w-full mb-5"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">


                                                                                  {/*YUNG PATH LALAGYAN TO !!!!!!!*/}
                <CardSection title="What is a Stack?" subtitle="Lesson 1" progress={12.5} path="/week7Page1"  mediaSrc={card1} mediaType="video"/>
                <CardSection title=" What is a Queue?" subtitle="Lesson 2" progress={0} path="/week7L2Page1" mediaSrc={card2} mediaType="video"/>
                <CardSection title="Understanding Recursion" subtitle="Lesson 3" progress={0} path="/week7L3Page1" mediaSrc={card3} mediaType="video" />
                <CardSection title=" Build a Mini Task Manager" subtitle="Challenge" progress={0} path="/quizWeek7" mediaSrc={Challenges} mediaType="video"/>
              </div>
            </div>

            {/* Right Section */}
            <div className=" w-6/12 flex-shrink-0 bg-[#141a35] p-4 rounded-xl shadow-xl">
              <h2 className="text-2xl font-extrabold tracking-wide mb-2"> WEEK 7&8 GOALS</h2>{/*YUNG WEEK NUMBER LANG */}
              <div className="border-t border-white/50 w-full mb-5"></div>

              {/* Lessons */}
              <div className="space-y-4">
                                                                                     {/*YUNG PATH LALAGYAN TO !!!!!!! */}
                <WeekButton title="Lesson 1" status="LEARN" icon={CheckIcon} iconType={StudyIcon} path="/week7Page1"  />
                <WeekButton title="Lesson 2" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/week7L2Page1"/>
                <WeekButton title="Lesson 3" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/week7L3Page1" />
              </div>

              {/* Activities */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-yellow-300"> Activities</h3>
                                                                                                            {/*YUNG PATH LALAGYAN TO !!!!!!!!*/}
                <WeekButton title="Activity 1" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week7Activity1"/>
                <WeekButton title="Activity 2" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week7Activity2"/>
                <WeekButton title="Activity 3" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week7Activity3"/>
              </div>
            </div>
          </div>
        </main>
        <LearningPath isOpen={isLearningPathOpen} toggleLearningPath={toggleLearningPath} />
      </div>
    </div>
  );
}


