import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider'; // You must have an auth context set up
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import SectionCard from '../../components/AdminSectionCard'; // Reusing SectionCard

function InstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false); 
  const [sections, setSections] = useState([]);
  const { currentUser } = useAuth(); // From context: contains Firebase user info
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorSections = async () => {
      if (!currentUser) return;
    
      try {
        const docRef = doc(db, 'users', currentUser.uid); // fixed
        const docSnap = await getDoc(docRef);
        const instructorName = docSnap.exists() ? docSnap.data().name : null;
  
        if (!instructorName) return;
  
        //console.log("👨‍🏫 Instructor name:", instructorName);
  
        const classSnapshot = await getDocs(collection(db, 'classes'));
        const classData = classSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((section) => section.instructor === instructorName); // match by name
  
        //console.log("📚 Matched classes:", classData);
  
        const updatedSections = await Promise.all(
          classData.map(async (section) => {
            const qStudents = query(
              collection(db, 'users'),
              where('section', '==', section.sectionName),
              where('role', '==', 'student')
            );
            const studentSnapshot = await getDocs(qStudents);
            const studentCount = studentSnapshot.size;
  
            return {
              ...section,
              studentCount,
            };
          })
        );
  
        setSections(updatedSections);
      } catch (error) {
        console.error('Error fetching instructor sections:', error);
      }
    };
  
    fetchInstructorSections();
  }, [currentUser]);  

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="My Classes" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-6 bg-white p-6 rounded-lg shadow h-[75vh] overflow-y-auto">
        
        <div className="grid grid-cols-1 m-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              sectionName={section.sectionName}
              instructor={section.instructor}
              studentCount={section.studentCount}
              hideMenu={true}
              onClick={() =>
                navigate('/viewScoresPage', { state: { section: section.sectionName } })
              }
            />          
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstructorPage;
