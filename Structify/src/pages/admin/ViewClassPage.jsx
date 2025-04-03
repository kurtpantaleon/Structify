import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewClassPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { section } = location.state;

  // Fetch students & instructor based on section
  useEffect(() => {
    const fetchStudentsAndInstructor = async () => {
      try {
        // Fetch students
        const qStudents = query(
          collection(db, 'students'),
          where('section', '==', section.sectionName)
        );
        const studentSnapshot = await getDocs(qStudents);
        const studentData = studentSnapshot.docs.map((doc) => doc.data());
        setStudents(studentData);

        // Fetch instructor
        const qInstructor = query(
          collection(db, 'instructors'),
          where('section', '==', section.sectionName)
        );
        const instructorSnapshot = await getDocs(qInstructor);
        const instructorData = instructorSnapshot.docs.map((doc) => doc.data());

        if (instructorData.length > 0) {
          setInstructor(instructorData[0]); // Assuming 1 instructor per section
        } else {
          setInstructor(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchStudentsAndInstructor();
  }, [section.sectionName]);

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
          <button
            onClick={() => navigate(-1)}
            className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
          >
            Back to Class List
          </button>
        </div>

        {/* Class Info */}
        <h1 className="text-3xl font-extrabold text-[#141a35] mb-2">{section.sectionName}</h1>
        <hr className="border-gray-300 my-2" />

        <h2 className="text-lg font-semibold text-[#141a35] mb-1 mt-4">Instructor</h2>
        {instructor ? (
          <p className="text-[#141a35] text-base mb-4">{instructor.name}</p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No instructor assigned yet.</p>
        )}

        <hr className="border-gray-300 my-2" />

        {/* Students */}
        <div className="flex items-center justify-between mb-3 mt-4">
          <h2 className="text-lg font-semibold text-[#141a35]">Students</h2>
          <span className="text-sm text-[#141a35]">{students.length} students</span>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
          {students.length > 0 ? (
            students.map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b"
              >
                <p className="text-[#141a35] text-base font-medium">{student.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No students found in this class.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewClassPage;
