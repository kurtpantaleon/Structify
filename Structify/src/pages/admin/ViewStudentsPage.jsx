import React from 'react';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewStudentsPage() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const sections = [
    {
      section: 'BSIT 3-1',
      students: ['Kurt Pantaleon', 'Kurt Pantaleon', 'Kurt Pantaleon', 'Kurt Pantaleon', 'Kurt Pantaleon', 'Kurt Pantaleon'],
    },
    {
      section: 'BSIT 3-2',
      students: ['Kurt Pantaleon', 'Kurt Pantaleon', 'Kurt Pantaleon', 'Kurt Pantaleon'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Students"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      {/* Students List */}
      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        {/* Add Student Button */}
        <div className="flex justify-end mb-4">
          <button className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition">
            Add Student
          </button>
        </div>

        {/* Scrollable Student List */}
        <div className="overflow-y-scroll pr-2 space-y-6">
          {sections.map((item, index) => (
            <div key={index} className="mb-2">
              {/* Section Heading */}
              <h3 className="text-2xl font-bold text-[#141a35] mb-2 border-b pb-1">
                {item.section}
              </h3>

              {/* Students */}
              {item.students.map((student, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-[#141a35] text-base font-medium">{student}</span>
                  <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">Remove</button>
                    <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewStudentsPage;
