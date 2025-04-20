import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewStudentLists() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { section } = location.state;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('section', '==', section),
          where('role', '==', 'student')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [section.sectionName]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Student List"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
          >
            Back
          </button>
        </div>

        <h1 className="text-3xl font-extrabold text-[#141a35] mb-4">
          Students in {section}
        </h1>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#141a35]">Student List</h2>
          <span className="text-sm text-[#141a35]">{students.length} students</span>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
          {students.length > 0 ? (
            students.map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b"
              >
                <p className="text-[#141a35] text-base">{student.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No students found in this section.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewStudentLists;
