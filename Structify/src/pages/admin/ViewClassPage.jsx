import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import { Users, ChevronLeft, UserCheck, GraduationCap, Search, BarChart } from 'lucide-react';

function ViewClassPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const location = useLocation();
  const navigate = useNavigate();

  const { section } = location.state;
  // ✅ Fetch students & instructor from users collection
  useEffect(() => {
    const fetchStudentsAndInstructor = async () => {
      setIsLoading(true);
      try {
        // ✅ Fetch students
        const qStudents = query(
          collection(db, 'users'),
          where('section', '==', section.sectionName),
          where('role', '==', 'student')
        );
        const studentSnapshot = await getDocs(qStudents);
        const studentData = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentData);
        setFilteredStudents(studentData);

        // ✅ Fetch instructor
        const qInstructor = query(
          collection(db, 'users'),
          where('section', '==', section.sectionName),
          where('role', '==', 'instructor')
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentsAndInstructor();
  }, [section.sectionName]);

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Class Details"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      {/* Class Details */}
      <div className="max-w-7xl mx-auto mt-7 mb-8">
        {/* Back Button and Navigation */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#141a35] hover:text-blue-700 transition-colors font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Class List
          </button>
          
          <div className="flex space-x-3 bg-white rounded-lg shadow-sm p-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                activeTab === 'overview' 
                  ? 'bg-[#141a35] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Overview
            </button>
            {/* <button 
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                activeTab === 'performance' 
                  ? 'bg-[#141a35] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Performance
            </button> */}
          </div>
        </div>

        {/* Class Header Card */}
        <div className="bg-gradient-to-r from-[#141a35] to-[#2a3363] rounded-xl shadow-md p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-5 pattern-grid-lg"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{section.sectionName}</h1>
                <div className="flex items-center">
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm flex items-center mr-3">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    <span>{students.length} Students</span>
                  </div>
                  {instructor && (
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                      <span>Instructor: {instructor.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <button className="bg-white text-[#141a35] font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                  Edit Class
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Instructor Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-[#141a35] mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Instructor
              </h2>
              
              {instructor ? (
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-[#141a35] text-white flex items-center justify-center font-bold text-lg mr-4">
                    {instructor.name ? instructor.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{instructor.name}</h3>
                    <p className="text-gray-600">{instructor.email}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700">
                  <p className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    No instructor assigned to this class yet.
                  </p>
                </div>
              )}
            </div>

            {/* Students Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-bold text-[#141a35] flex items-center mb-3 sm:mb-0">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Students
                </h2>
                
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#141a35]"></div>
                </div>
              ) : (
                <>
                  {/* Student table */}
                  {filteredStudents.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredStudents.map((student, index) => (
                            <tr key={student.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-[#141a35] text-white flex items-center justify-center font-medium text-sm">
                                    {student.name ? student.name.charAt(0) : '?'}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.name || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.email || 'No email'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {searchQuery ? 'No matching students' : 'No students in this class'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchQuery 
                          ? `No students matching "${searchQuery}" were found.` 
                          : 'There are no students assigned to this class yet.'}
                      </p>
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        // )}
        //   {activeTab === 'performance' && (
        //   <div className="space-y-6">
        //     {/* Class Performance Overview */}
        //     <div className="bg-white rounded-lg shadow-md p-6">
        //       <h2 className="text-xl font-bold text-[#141a35] mb-6 flex items-center">
        //         <BarChart className="h-5 w-5 mr-2 text-blue-600" />
        //         Class Performance Overview
        //       </h2>
              
        //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        //         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
        //           <div className="font-medium text-sm opacity-80 mb-1">Average Score</div>
        //           <div className="text-3xl font-bold">85%</div>
        //           <div className="mt-2 text-xs text-blue-100">+5% from previous week</div>
        //         </div>
                
        //         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
        //           <div className="font-medium text-sm opacity-80 mb-1">Completion Rate</div>
        //           <div className="text-3xl font-bold">76%</div>
        //           <div className="mt-2 text-xs text-green-100">27 of 35 activities</div>
        //         </div>
                
        //         <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
        //           <div className="font-medium text-sm opacity-80 mb-1">Engagement Rate</div>
        //           <div className="text-3xl font-bold">89%</div>
        //           <div className="mt-2 text-xs text-purple-100">+12% from last month</div>
        //         </div>
        //       </div>
              
        //       <div className="mt-6 pt-6 border-t border-gray-200">
        //         <div className="text-gray-500 text-sm mb-4">Modules Completion Progress</div>
        //         <div className="space-y-4">
        //           <div>
        //             <div className="flex justify-between mb-1">
        //               <span className="text-sm font-medium text-gray-700">Data Structures</span>
        //               <span className="text-sm font-medium text-gray-700">92%</span>
        //             </div>
        //             <div className="w-full bg-gray-200 rounded-full h-2.5">
        //               <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
        //             </div>
        //           </div>
                  
        //           <div>
        //             <div className="flex justify-between mb-1">
        //               <span className="text-sm font-medium text-gray-700">Algorithms</span>
        //               <span className="text-sm font-medium text-gray-700">78%</span>
        //             </div>
        //             <div className="w-full bg-gray-200 rounded-full h-2.5">
        //               <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "78%" }}></div>
        //             </div>
        //           </div>
                  
        //           <div>
        //             <div className="flex justify-between mb-1">
        //               <span className="text-sm font-medium text-gray-700">Problem Solving</span>
        //               <span className="text-sm font-medium text-gray-700">64%</span>
        //             </div>
        //             <div className="w-full bg-gray-200 rounded-full h-2.5">
        //               <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "64%" }}></div>
        //             </div>
        //           </div>
                  
        //           <div>
        //             <div className="flex justify-between mb-1">
        //               <span className="text-sm font-medium text-gray-700">System Design</span>
        //               <span className="text-sm font-medium text-gray-700">45%</span>
        //             </div>
        //             <div className="w-full bg-gray-200 rounded-full h-2.5">
        //               <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
        //             </div>
        //           </div>
        //         </div>
                
        //         <div className="text-xs text-gray-500 mt-4 text-center">
        //           Note: This is sample data for UI demonstration purposes.
        //         </div>
        //       </div>
        //     </div>
            
        //     {/* Individual Performance */}
        //     <div className="bg-white rounded-lg shadow-md p-6">
        //       <h2 className="text-xl font-bold text-[#141a35] mb-6 flex items-center">
        //         <Users className="h-5 w-5 mr-2 text-blue-600" />
        //         Individual Student Performance
        //       </h2>
              
        //       {students.length > 0 ? (
        //         <div className="overflow-hidden rounded-lg border border-gray-200">
        //           <table className="min-w-full divide-y divide-gray-200">
        //             <thead className="bg-gray-50">
        //               <tr>
        //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        //                   Student
        //                 </th>
        //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        //                   Overall Grade
        //                 </th>
        //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        //                   Activities Completed
        //                 </th>
        //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        //                   Last Active
        //                 </th>
        //               </tr>
        //             </thead>
        //             <tbody className="bg-white divide-y divide-gray-200">
        //               {students.map((student, index) => (
        //                 <tr key={student.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        //                   <td className="px-6 py-4 whitespace-nowrap">
        //                     <div className="flex items-center">
        //                       <div className="h-8 w-8 rounded-full bg-[#141a35] text-white flex items-center justify-center font-medium text-sm">
        //                         {student.name ? student.name.charAt(0) : '?'}
        //                       </div>
        //                       <div className="ml-3">
        //                         <div className="text-sm font-medium text-gray-900">
        //                           {student.name || 'N/A'}
        //                         </div>
        //                       </div>
        //                     </div>
        //                   </td>
        //                   <td className="px-6 py-4 whitespace-nowrap">
        //                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
        //                       ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 
        //                         index % 3 === 1 ? 'bg-blue-100 text-blue-800' : 
        //                         'bg-yellow-100 text-yellow-800'}`}>
        //                       {index % 3 === 0 ? 'A' : index % 3 === 1 ? 'B+' : 'B'}
        //                     </span>
        //                   </td>
        //                   <td className="px-6 py-4 whitespace-nowrap">
        //                     <div className="text-sm text-gray-900">
        //                       {Math.floor(Math.random() * 15) + 20}/35
        //                     </div>
        //                   </td>
        //                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        //                     {`${Math.floor(Math.random() * 24) + 1}h ago`}
        //                   </td>
        //                 </tr>
        //               ))}
        //             </tbody>
        //           </table>
        //         </div>
        //       ) : (
        //         <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        //           <p className="text-gray-700">
        //             No student data available to display performance metrics.
        //           </p>
        //         </div>
        //       )}
        //     </div>
        //   </div>
        )}
      </div>
    </div>
  );
}

export default ViewClassPage;
