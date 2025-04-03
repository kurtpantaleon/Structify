import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewInstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'instructors'));
        const data = querySnapshot.docs.map((doc) => doc.data());
        setInstructors(data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };

    fetchInstructors();
  }, []);

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
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">{item.section}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">
                  Re-assign Section
                </button>
                <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer">
                  Delete Account
                </button>
              </div>
            </div>
          ))}
          {instructors.length === 0 && (
            <p className="text-center text-sm text-gray-500">No instructors found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewInstructorPage;
