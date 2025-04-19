import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/SubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';

const weekLabels = [
  '1st Week',
  '2nd Week',
  '3rd Week',
  '4th–5th Week',
  '6th Week',
  '7th–8th Week',
  '10th–11th Week',
  '12th–13th Week',
  '14th–16th Week',
  '17th Week',
];

// Generate week data dynamically
const mockData = weekLabels.map((week) => ({
  week,
  activities: ['Activity 1', 'Activity 2', 'Activity 3', 'Quiz'],
}));

function ViewScoresPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const sectionName = location.state?.section;

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="View Scores" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        <div className="overflow-y-auto m-4 pr-2 space-y-6 flex-grow">
          {mockData.map((weekData, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-[#141a35] mb-2 py-1 border-b">
                {weekData.week}
              </h2>
              {weekData.activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-none"
                >
                  <span className="text-md text-[#141a35]">{activity}</span>
                  <button className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">
                    View Scores
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewScoresPage;
