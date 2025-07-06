import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import Header from '../../components/admin/AdminHeader';
import AdminSubHeading from '../../components/admin/AdminSubHeading';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNavigationBar from '../../components/instructor/InstructorNavigationBar';
import SectionCard from '../../components/admin/AdminSectionCard';
import { BookOpen, Users, FileText, Menu, Plus, Calendar, Search } from 'lucide-react';

function InstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false); 
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorSections = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
    
      try {
        setLoading(true);
        setError(null);
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        const instructorName = docSnap.exists() ? docSnap.data().name : null;
  
        if (!instructorName) {
          setError("Instructor profile not found");
          setLoading(false);
          return;
        }
  
        const classSnapshot = await getDocs(collection(db, 'classes'));
        const classData = classSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((section) => section.instructor === instructorName);
  
        const updatedSections = await Promise.all(
          classData.map(async (section) => {
            const qStudents = query(
              collection(db, 'users'),
              where('section', '==', section.sectionName),
              where('role', '==', 'student')
            );
            const studentSnapshot = await getDocs(qStudents);
            const studentCount = studentSnapshot.size;
            
            // Get activities count
            const activitiesQuery = query(
              collection(db, 'activities'), 
              where('section', '==', section.sectionName)
            );
            const activitiesSnapshot = await getDocs(activitiesQuery);
            
            // Get lessons count
            const lessonsQuery = query(
              collection(db, 'lessons'), 
              where('section', '==', section.sectionName)
            );
            const lessonsSnapshot = await getDocs(lessonsQuery);
  
            return {
              ...section,
              studentCount,
              activitiesCount: activitiesSnapshot.size,
              lessonsCount: lessonsSnapshot.size,
              lastActive: section.lastUpdated || new Date().toISOString(),
              academicYear: section.academicYear || 'Not specified' // Ensure academic year is included
            };
          })
        );
  
        setSections(updatedSections);
      } catch (error) {
        console.error('Error fetching instructor sections:', error);
        setError("Failed to load class sections");
      } finally {
        setLoading(false);
      }
    };
  
    fetchInstructorSections();
  }, [currentUser]);  

  // Update filtered sections to include academic year in search
  const filteredSections = sections.filter(section =>
    section.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.academicYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSectionClick = (section) => {
    navigate('/viewScoresPage', { 
      state: { section: section.sectionName } 
    });
  };
  
  const handleClassMaterialsClick = (e, section) => {
    e.stopPropagation();
    navigate('/ClassField', { 
      state: { section: section.sectionName } 
    });
  };

 return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="My Classes" />
      
      <div className="flex min-h-[calc(100vh-120px)]">
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '16rem' }}
              exit={{ width: 0 }}
              className="h-full bg-[#141a35] text-white overflow-hidden transition-all duration-300"
            >
              <AdminNavigationBar />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={`flex-1 transition-all duration-300 ${isNavOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <BookOpen className="h-7 w-7 text-blue-500 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
                    <span className="ml-3 from-[#141a35] to-[#2a3363] text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {sections.length} {sections.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                                focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button 
                        className={`px-3 py-1.5 rounded-md flex items-center ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
                        onClick={() => setView('grid')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        className={`px-3 py-1.5 rounded-md flex items-center ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
                        onClick={() => setView('list')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                    
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 from-[#141a35] to-[#2a3363]"></div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    <p>{error}</p>
                  </div>
                )}
                
                {!loading && filteredSections.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No classes found</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      {searchTerm ? 
                        "No classes match your search criteria. Try a different search term." : 
                        "You haven't created any classes yet. Start by creating your first class."}
                    </p>
                    <button
                      onClick={() => navigate('/create-class')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 
                              px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Class
                    </button>
                  </div>
                )}
                
                {/* Grid View */}
                {!loading && filteredSections.length > 0 && view === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSections.map((section) => (
                      <div 
                        key={section.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
                        onClick={() => handleSectionClick(section)}
                      >
                        <div className="h-24 bg-gradient-to-r from-[#141a35] to-[#2a3363] p-4 flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
                            {section.sectionName}
                          </h3>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-center text-gray-700 mb-3">
                            <Users className="w-4 h-4 mr-2" />
                            <span className="text-sm">{section.studentCount} students</span>
                          </div>
                          <div className="flex items-center text-gray-700 mb-3">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">{section.academicYear}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {section.lessonsCount || 0} lessons
                            </span>
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              {section.activitiesCount || 0} activities
                            </span>
                          </div>
                        </div>
                        <div className="flex border-t border-gray-100">
                          <button 
                            onClick={(e) => handleSectionClick(section)}
                            className="flex-1 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            View Scores
                          </button>
                          <div className="w-px bg-gray-100"></div>
                          <button 
                            onClick={(e) => handleClassMaterialsClick(e, section)}
                            className="flex-1 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Materials
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* List View */}
                {!loading && filteredSections.length > 0 && view === 'list' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Academic Year
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Materials
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Active
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSections.map((section) => (
                          <tr key={section.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSectionClick(section)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{section.sectionName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-2" />
                                <div className="text-sm text-gray-900">{section.studentCount}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                  {section.academicYear}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {section.lessonsCount || 0}
                                </span>
                                <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {section.activitiesCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                {new Date(section.lastActive).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={(e) => handleClassMaterialsClick(e, section)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Materials
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSectionClick(section);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Scores
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorPage;
