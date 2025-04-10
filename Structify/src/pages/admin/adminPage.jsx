import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import SectionCard from '../../components/AdminSectionCard';
import { serverTimestamp } from 'firebase/firestore'; 

function AdminPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // ✅ Updated to fetch from users collection with role filtering
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'classes'));
        const classData = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const updatedSections = await Promise.all(
          classData.map(async (section) => {
            // ✅ Fetch instructor from "users" where role is instructor
            const qInstructor = query(
              collection(db, 'users'),
              where('section', '==', section.sectionName),
              where('role', '==', 'instructor')
            );
            const instructorSnapshot = await getDocs(qInstructor);
            const instructorData = instructorSnapshot.docs.map((doc) => doc.data());
            const instructorName = instructorData.length > 0 ? instructorData[0].name : 'TBA';

            // ✅ Fetch students from "users" where role is student
            const qStudents = query(
              collection(db, 'users'),
              where('section', '==', section.sectionName),
              where('role', '==', 'student')
            );
            const studentSnapshot = await getDocs(qStudents);
            const studentCount = studentSnapshot.size;

            return {
              ...section,
              instructor: instructorName,
              studentCount: studentCount,
            };
          })
        );

        setSections(updatedSections);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  const handleAddClass = async () => {
    if (newClassName.trim() === '') {
      alert('Please enter a class name');
      return;
    }
  
    const newSection = {
      sectionName: newClassName,
      instructor: 'TBA',
      studentCount: 0,
      createdAt: serverTimestamp(), // ✅ timestamp for sorting
    };
  
    try {
      const docRef = await addDoc(collection(db, 'classes'), newSection);
      setSections([...sections, { id: docRef.id, ...newSection }]);
      setIsPopupOpen(false);
      setNewClassName('');
    } catch (error) {
      console.error('Error adding class: ', error);
    }
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
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 flex-grow">
          {sections.map((item, index) => (
            <SectionCard
              key={item.id}
              sectionName={item.sectionName}
              instructor={item.instructor}
              studentCount={item.studentCount}
              onClick={() => navigate('/ViewClassPage', { state: { section: item } })}
              onEdit={() => handleEditSection(item)}
              onDelete={() => handleDeleteSection(item)}
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
