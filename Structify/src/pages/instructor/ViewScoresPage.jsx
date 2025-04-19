import React, {useState} from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/SubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';

const mockData = [
  {
    week: 'Week 1',
    activities: ['Activity 1', 'Activity 2', 'Activity 3', 'Quiz'],
  },
  {
    week: 'Week 2',
    activities: ['Activity 1'],
  },
];

function ViewScoresPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const sectionName = location.state?.section;

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="My Classes" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-6 bg-white p-6 rounded-lg shadow h-[75vh] overflow-y-auto">
        {mockData.map((weekData, idx) => (
            <div key={idx} className="m-5">
                <h2 className="text-3xl font-bold mb-2">{weekData.week}</h2>
                <hr className="border-t border-[#141a35]/30 mb-4" />
                {weekData.activities.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-lg">{activity}</span>
                    <button className="text-[#141a35] font-medium hover:underline">
                        View Scores
                    </button>
                    </div>
                ))}
            </div>
        ))}
      </div>
    </div>
  );
}

export default ViewScoresPage;
