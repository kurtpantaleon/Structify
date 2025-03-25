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
import Data from "../assets/clip/data.mp4"
import Computer from "../assets/clip/Computer.mp4"
import Type from "../assets/clip/types.mp4"
import Challenges from "../assets/clip/challenge.mp4"


function MainPage() {
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
          <div className="w-20 border-r border-r border-white/20 bg-[#141a35]">
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
                <CardSection title="Introduction to Data Structures" subtitle="Lesson 1" progress={12.5} path="/page1"  mediaSrc={Data} mediaType="video"/>
                <CardSection title="Computers and Data Structures" subtitle="Lesson 2" progress={0} path="/l2page1" mediaSrc={Computer} mediaType="video"/>
                <CardSection title="Types of Data Structures?" subtitle="Lesson 3" progress={0} path="/l3page1" mediaSrc={Type} mediaType="video" />
                <CardSection title="Create a Mini Library" subtitle="Challenge" progress={0} path="/quizWeek1" mediaSrc={Challenges} mediaType="video"/>
              </div>
            </div>

            {/* Right Section */}
            <div className=" w-6/12 flex-shrink-0 bg-[#141a35] p-4 rounded-xl shadow-xl">
              <h2 className="text-2xl font-extrabold tracking-wide mb-2"> WEEK 1 GOALS</h2>
              <div className="border-t border-white/50 w-full mb-5"></div>

              {/* Lessons */}
              <div className="space-y-4">
                <WeekButton title="Lesson 1" status="LEARN" icon={CheckIcon} iconType={StudyIcon} path="/page1"  />
                <WeekButton title="Lesson 2" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/l2page1"/>
                <WeekButton title="Lesson 3" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/l3page1" />
              </div>

              {/* Activities */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-yellow-300"> Activities</h3>
                <WeekButton title="Activity 1" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week1Activity1"/>
                <WeekButton title="Activity 2" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week1Activity2"/>
                <WeekButton title="Activity 3" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/Week1Activity3"/>
              </div>
            </div>
          </div>
        </main>
        <LearningPath isOpen={isLearningPathOpen} toggleLearningPath={toggleLearningPath} />
      </div>
    </div>
  );
}

export default MainPage;
