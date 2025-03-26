import { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import SubHeading from '../components/SubHeading';
import Header from '../components/Header';
import CardSection from '../components/CardSection';
import WeekButton from '../components/WeekButton';
import CheckIcon from '../assets/images/Check Icon.png';
import UncheckIcon from '../assets/images/Uncheck Icon.png';
import PracticeIcon from '../assets/images/Practice Icon.png';
import StudyIcon from '../assets/images/Study Icon.png';
import LearningPath from '../components/LearningPath';

import card1 from "../assets/clip/Algorithm.mp4"
import card2 from "../assets/clip/time.mp4"
import card3 from "../assets/clip/simple.mp4"

import Challenges from "../assets/clip/challenge.mp4"


export default function Week2Page() {
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
      />

      <div className="flex flex-1 ">
        {isNavOpen && (
          <div className="w-20 border-r border-white/20 bg-[#141a35]">
            <NavigationBar />
          </div>
        )}

        <main className=" flex-1 px-12 py-8 ">
          <div className=" flex items-start gap-8 ">
            {/* Left Section */}
            <div className="w-6/12 flex-shrink-0">
              <h2 className="text-2xl font-extrabold tracking-wide mb-2">SECTION</h2>
              <div className="border-t border-white/50 w-full mb-5"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CardSection title="What is an Algorithm?" subtitle="Lesson 1" progress={12.5} path="/week2Page1"  mediaSrc={card1} mediaType="video"/>
                <CardSection title="Time & Space Complexity (Efficiency)" subtitle="Lesson 2" progress={0} path="/week2L2Page1" mediaSrc={card2} mediaType="video"/>
                <CardSection title="Writing a Simple Algorithm" subtitle="Lesson 3" progress={0} path="/week2L3Page1" mediaSrc={card3} mediaType="video" />
                <CardSection title="Create Your Own Sorting Algorithm" subtitle="Challenge" progress={0} path="/quizWeek2" mediaSrc={Challenges} mediaType="video"/>
              </div>
            </div>

            {/* Right Section */}
            <div className=" w-6/12 flex-shrink-0 bg-[#141a35] p-4 rounded-xl shadow-xl">
              <h2 className="text-2xl font-extrabold tracking-wide mb-2"> WEEK 2 GOALS</h2>
              <div className="border-t border-white/50 w-full mb-5"></div>

              {/* Lessons */}
              <div className="space-y-4">
                <WeekButton title="Lesson 1" status="LEARN" icon={CheckIcon} iconType={StudyIcon} path="/week2Page1"  />
                <WeekButton title="Lesson 2" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/week2L2Page1"/>
                <WeekButton title="Lesson 3" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/week2L3Page1" />
              </div>

              {/* Activities */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-yellow-300"> Activities</h3>
                <WeekButton title="Activity 1" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week2Activity1"/>
                <WeekButton title="Activity 2" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week2Activity2"/>
                <WeekButton title="Activity 3" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week2Activity3"/>
              </div>
            </div>
          </div>
        </main>
        <LearningPath isOpen={isLearningPathOpen} toggleLearningPath={toggleLearningPath} />
      </div>
    </div>
  );
}


