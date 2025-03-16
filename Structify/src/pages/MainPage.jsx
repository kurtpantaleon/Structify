import { useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import SubHeading from '../components/SubHeading';
import Header from '../components/Header';
import CardSection from '../components/CardSection';

function MainPage() {
  const [isNavOpen, setIsNavOpen] = useState(false); // Sidebar toggle state

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">

      {/* Header on Top */}
      <Header />

      {/* Sub Heading Below Header */}
      <SubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} />

      {/* Main Layout Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (left) */}
        {isNavOpen && (
          <div className="w-20 border-r border-white/20">
            <NavigationBar />
          </div>
        )}
        {/* Main Content  */}
        <main className="flex-1 p-10 ml-10 overflow-y-auto bg-[#1F274D]">
          <h2 className="text-xl font-bold mb-4">SECTION</h2>
          <div className="border-t border-white/100 w-137 mb-4"></div>  
          {/* Cards  */}
          <div className="grid w-140 grid-cols-2 gap-4 p-1">
            <CardSection
              title="Introduction to Data Structures"
              subtitle="Lesson 1"
              progress="1/8"
            />
            <CardSection
              title="Computers and Data Structures"
              subtitle="Lesson 2"
              progress="0/8"
            />
            <CardSection
              title="Types of Data Structures?"
              subtitle="Lesson 3"
              progress="0/8" 
            />
            <CardSection
              title="Create a Mini Library"
              subtitle="Challenge"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainPage;
