import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import { Search, ArrowLeft, User, Mail, Users, ChevronDown, Award, Activity } from 'lucide-react';

function ViewStudentLists() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { section } = location.state;
  const [expandedStudents, setExpandedStudents] = useState({});

  // Additional states for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('section', '==', section.sectionName),
          where('role', '==', 'student')
        );
        const snapshot = await getDocs(q);
        const data = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const studentData = docSnapshot.data();
          
          // Calculate average score
          let totalScore = 0;
          let scoreCount = 0;
          
          if (studentData.activityScores) {
            Object.values(studentData.activityScores).forEach(score => {
              if (!isNaN(score)) {
                totalScore += parseFloat(score);
                scoreCount++;
              }
            });
          }
          
          const averageScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 'N/A';
          
          return {
            id: docSnapshot.id,
            ...studentData,
            averageScore,
            scoreCount
          };
        }));
        
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [section.sectionName]);
  
  const toggleStudentExpand = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };
  
  // Get performance color based on score
  const getScoreColor = (score) => {
    if (score === 'N/A') return 'bg-gray-100 text-gray-800';
    const numScore = parseFloat(score);
    if (numScore >= 90) return 'bg-green-100 text-green-800';
    if (numScore >= 75) return 'bg-blue-100 text-blue-800';
    if (numScore >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Student List"
      />
      <div className="flex">
        {isNavOpen && (
          <div className="w-20 border-r border-white/20 bg-[#141a35]">
            <AdminNavigationBar />
          </div>
        )}
        
        <div className="flex-grow p-6">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={20} className="text-[#141a35]" />
                </button>
                <h1 className="text-2xl font-bold text-[#141a35]">
                  {section.sectionName} - Student List
                </h1>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
                  <p className="text-2xl font-bold text-[#141a35]">{students.length}</p>
                </div>
              </div>
              
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Loading students...</p>
                </div>
              </div>
            ) : (
              <>
                {filteredStudents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {currentStudents.map((student) => (
                      <div key={student.id || student.email} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="bg-white p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 cursor-pointer"
                          onClick={() => toggleStudentExpand(student.id)}
                        >
                          <div className="bg-gray-100 p-4 rounded-full">
                            <User size={24} className="text-[#141a35]" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-[#141a35]">{student.name}</h3>
                            {student.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Mail size={14} />
                                <span>{student.email}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${getScoreColor(student.averageScore)}`}>
                              <Award size={14} />
                              <span>Avg: {student.averageScore}</span>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {student.section}
                            </div>
                            <ChevronDown 
                              className={`transform transition-transform ${expandedStudents[student.id] ? 'rotate-180' : ''}`} 
                              size={16} 
                            />
                          </div>
                        </div>
                        
                        {expandedStudents[student.id] && (
                          <div className="bg-gray-50 p-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Activity size={16} className="text-blue-600" />
                              Activity Scores
                            </h4>
                            
                            {student.activityScores && Object.keys(student.activityScores).length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(student.activityScores).map(([activity, score]) => (
                                  <div 
                                    key={activity} 
                                    className="p-3 bg-white rounded-md border border-gray-200 flex justify-between items-center"
                                  >
                                    <span className="text-sm font-medium text-gray-700">
                                      {activity.replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase())
                                        .replace(/quiz/i, 'Quiz ')}
                                    </span>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getScoreColor(score)}`}>
                                      {score}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic p-2">No activity scores recorded yet.</p>
                            )}
                            
                            {student.completedQuizzes && student.completedQuizzes.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-700 mb-2">Completed Quizzes</h4>
                                <div className="flex flex-wrap gap-2">
                                  {student.completedQuizzes.map(quiz => (
                                    <span key={quiz} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                      {quiz}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {student.completedActivities && student.completedActivities.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-700 mb-2">Completed Activities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {student.completedActivities.map(activity => (
                                    <span key={activity} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {activity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No students found matching your search.</p>
                  </div>
                )}
                
                {/* Pagination */}
                {filteredStudents.length > 0 && totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2" aria-label="Pagination">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          className={`px-3 py-1 rounded-md ${currentPage === i + 1 ? 'bg-[#141a35] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewStudentLists;
