import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewStudentsPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // ✅ Query students from the unified "users" collection
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'student')
        );
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map((doc) => doc.data());

        // ✅ Group students by section
        const grouped = studentsData.reduce((acc, student) => {
          if (!acc[student.section]) {
            acc[student.section] = [];
          }
          acc[student.section].push(student.name);
          return acc;
        }, {});

        // ✅ Convert to array format for rendering
        const sectionList = Object.keys(grouped).map((section) => ({
          section,
          students: grouped[section],
        }));

        setSections(sectionList);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

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
                  <span className="text-[#141a35] text-base">{student}</span>
                  <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">Re-Assign Section</button>
                    <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer">Delete Account</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-center text-sm text-gray-500">No students found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewStudentsPage;
