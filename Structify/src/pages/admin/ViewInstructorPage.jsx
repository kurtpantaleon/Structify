import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewInstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const instructors = [
    { instructor: 'Kurt Pantaleon', section: 'BSIT 3-1' },
    { instructor: 'Lebron James', section: 'BSIT 3-2' }, 
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

      {/* Add Button */}
      <div className="max-w-4xl mx-auto mt-10 flex justify-end px-6">
        <button className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition cursor-pointer">
          Add Instructor
        </button>
      </div>

      {/* Instructor List */}
      <div className="max-w-4xl mx-auto mt-4 bg-white p-6 rounded-lg shadow">
        {instructors.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-4 border-b last:border-b-0"
          >
            {/* Instructor Name */}
            <span className="text-lg font-medium text-[#141a35]">
              {item.instructor}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="bg-[#5c70c8] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition">
                {item.section}
              </button>
              <button className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-600 transition">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewInstructorPage;
