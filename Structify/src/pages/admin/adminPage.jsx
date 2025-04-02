import React, { useState } from 'react';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import SectionCard from '../../components/SectionCard';

function AdminPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [sections, setSections] = useState([
    { sectionName: 'BSIT 3-1', instructor: 'Kurt Pantaleon', studentCount: 50 },
    { sectionName: 'BSIT 3-2', instructor: 'LeBron James', studentCount: 45 },
    { sectionName: 'BSIT 2-1', instructor: 'John Doe', studentCount: 35 },
    { sectionName: 'BSIT 1-2', instructor: 'Jane Smith', studentCount: 40 },
  ]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = () => {
    if (newClassName.trim() === '') {
      alert('Please enter a class name');
      return;
    }
    const newSection = { sectionName: newClassName, instructor: '', studentCount: '' };
    setSections([...sections, newSection]);
    setIsPopupOpen(false);
    setNewClassName('');
  };

  return (
    <div className="min-h-screen bg-gray-200 relative">
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

      <div className="max-w-7xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col relative">
        {/* Add Class Button */}
        <div className="flex justify-end py-3">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
          >
            Add Class
          </button>
        </div>

        {/* Scrollable Section Cards */}
        <div className="max-w-7xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 flex-grow">
          {sections.map((item, index) => (
            <SectionCard
              key={index}
              sectionName={item.sectionName}
              instructor={item.instructor}
              studentCount={item.studentCount}
            />
          ))}
        </div>

        {/* Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-80 space-y-4">
              <h2 className="text-lg font-semibold">Add Class</h2>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Enter Class Name"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
