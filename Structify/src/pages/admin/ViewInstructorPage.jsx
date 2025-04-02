import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewInstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const instructors = [
    { instructor: 'Kurt Pantaleon', section: 'BSIT 3-1' },
    { instructor: 'LeBron James', section: 'BSIT 3-2' },
    { instructor: 'Stephen Curry', section: 'BSIT 3-3' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Instructors"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      {/* Instructor List */}
      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        {/* Add Instructor Button */}
        <div className="flex justify-end mb-4">
          <button className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition">
            Add Instructor
          </button>
        </div>

        {/* Scrollable Instructor List */}
        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
          {instructors.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#141a35]">
                  {item.instructor}
                </h3>
                <p className="text-sm text-gray-600">{item.section}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">
                  Remove
                </button>
                <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewInstructorPage;
