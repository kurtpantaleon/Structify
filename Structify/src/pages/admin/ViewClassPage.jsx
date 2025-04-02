import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewClassPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const students = [
    'Kurt Pantaleon',
    'LeBron James',
    'Steph Curry',
    'Kevin Durant',
    'Luka Doncic',
    'Anthony Edwards',
    'Nikola Jokic',
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Class"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      {/* Class Details */}
      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        {/* Back Button */}
        <div className="flex justify-end mb-4">
          <button className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition">
            Back to Class List
          </button>
        </div>

        {/* Class Info */}
        <h1 className="text-3xl font-extrabold text-[#141a35] mb-2">BSIT 3-1</h1>
        <hr className="border-gray-300 my-2" />

        <h2 className="text-lg font-semibold text-[#141a35] mb-1 mt-4">Instructor</h2>
        <p className="text-[#141a35] text-base mb-4">Kurt Pantaleon</p>

        <hr className="border-gray-300 my-2" />

        {/* Students */}
        <div className="flex items-center justify-between mb-3 mt-4">
          <h2 className="text-lg font-semibold text-[#141a35]">Students</h2>
          <span className="text-sm text-[#141a35]">50 students</span>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
          {students.map((student, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b"
            >
              <p className="text-[#141a35] text-base font-medium">{student}</p>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewClassPage;
