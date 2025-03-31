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

function Week3Page() {
  const [isNavOpen, setIsNavOpen] = useState(false); // Sidebar toggle state
  const [isLearningPathOpen, setIsLearningPathOpen] = useState(false); // Learning Path toggle state

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">

      {/* Header on Top */}
      <Header />

      {/* Sub Heading Below Header */}
      <SubHeading 
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        toggleLearningPath={() => setIsLearningPathOpen(!isLearningPathOpen)}
        title="Linked Lists"
      />

      {/* Main Layout Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (left) */}
        {isNavOpen && (
          <div className="w-20 border-r border-white/20">
            <NavigationBar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 px-20 py-8 overflow-y-auto bg-[#1F274D]">
          
          {/* Flex container for aligning both sections */}
          <div className="flex items-start gap-8">
            
            {/* ✅ Left: Section Cards (Take most of the space) */}
            <div className="w-5/10 flex-shrink-0"> 
              <h2 className="text-xl font-bold mb-2">SECTION</h2>
              <div className="border-t border-white/100 w-full mb-5"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CardSection title="Introduction to Data Structures" subtitle="Lesson 1" progress="1/8" path="/week6Page1" />
                <CardSection title="Computers and Data Structures" subtitle="Lesson 2" progress="0/8" path="/week6L2Page1" />
                <CardSection title="Types of Data Structures?" subtitle="Lesson 3" progress="0/8" path="/week6L3Page1" />
                <CardSection title="Create a Mini Library" subtitle="Challenge" />
              </div>
            </div>

            {/* ✅ Right: Week 1 Section (Shrunk to remove excess space) */}
            <div className="w-5/10 flex-shrink-0"> 
              <h2 className="text-xl font-bold mb-2">WEEK 6</h2>
              <div className="border-t border-white/100 w-full mb-5"></div>

              {/* Lessons */}
              <div className="space-y-4">
                <WeekButton title="Lesson 1" status="LEARN" icon={CheckIcon} iconType={StudyIcon} path="/week6Page1"  />
                <WeekButton title="Lesson 2" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/week6L2Page1"/>
                <WeekButton title="Lesson 3" status="LEARN" icon={UncheckIcon} iconType={StudyIcon} path="/week6L3Page1" />
              </div>

              {/* Activities */}
              <div className="mt-4 space-y-4">
                <WeekButton title="Activity 1" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/week6Activity1"/>
                <WeekButton title="Activity 2" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/week6Activity2"/>
                <WeekButton title="Activity 3" status="PRACTICE" icon={UncheckIcon} iconType={PracticeIcon} path="/week6Activity3"/>
              </div>
            </div>

          </div>
        </main>
        {/* Show LearningPath only if toggled */}
        {isLearningPathOpen && <LearningPath />}
      </div>
    </div>
  )
}

export default Week3Page