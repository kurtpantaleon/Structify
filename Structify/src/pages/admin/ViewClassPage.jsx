import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, adminDeleteUser } from '../../services/firebaseConfig';
import Header from '../../components/admin/AdminHeader';
import AdminNavigationBar from '../../components/admin/AdminNavigationBar';
import AdminSubHeading from '../../components/admin/AdminSubHeading';
import { Users, ChevronLeft, UserCheck, GraduationCap, Search, BarChart, Edit3, Trash2, X, Save, AlertTriangle, CheckCircle } from 'lucide-react';

function ViewClassPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit mode related states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToManage, setStudentToManage] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState({ visible: false, message: '' });
  
  // Add bulk selection state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState(null); // 'delete' or 'reassign'
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [bulkTargetSection, setBulkTargetSection] = useState('');
  
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

  // Initialize edit class name with current name
  useEffect(() => {
    if (section) {
      setEditClassName(section.sectionName);
    }
  }, [section]);

  // Load available sections for reassignment
  const fetchAvailableSections = async () => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const sections = classesSnapshot.docs
        .map((doc) => doc.data().sectionName)
        .filter((name) => name !== section.sectionName);
      setAvailableSections(sections);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isEditMode) {
      fetchAvailableSections();
      setEditClassName(section.sectionName);
    }
    setIsEditMode(!isEditMode);
  };

  // Open edit class name modal
  const openEditClassNameModal = () => {
    setEditClassName(section.sectionName);
    setIsEditModalOpen(true);
  };

  // Update class name
  const updateClassName = async () => {
    if (editClassName.trim() === '') return;

    try {
      setIsLoading(true);
      
      // Update the class document
      const classQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', section.sectionName)
      );
      const classSnapshot = await getDocs(classQuery);
      
      if (!classSnapshot.empty) {
        const classDoc = classSnapshot.docs[0];
        const classId = classDoc.id;
        
        await updateDoc(doc(db, 'classes', classId), {
          sectionName: editClassName,
        });
        
        // Update all students assigned to this section
        const qUsers = query(
          collection(db, 'users'),
          where('section', '==', section.sectionName)
        );
        const usersSnapshot = await getDocs(qUsers);
        
        const userUpdates = usersSnapshot.docs.map((userDoc) =>
          updateDoc(doc(db, 'users', userDoc.id), {
            section: editClassName,
          })
        );
        
        await Promise.all(userUpdates);
        
        // Update location state and navigate
        const updatedSection = { ...section, sectionName: editClassName };
        
        // Show success message
        setShowSuccessToast({
          visible: true,
          message: 'Class name updated successfully'
        });
        setTimeout(() => {
          setShowSuccessToast({ visible: false, message: '' });
        }, 3000);
        
        // Navigate to the same page with updated state
        navigate('/ViewClassPage', { 
          state: { section: updatedSection },
          replace: true
        });
      }
    } catch (error) {
      console.error('Error updating class name:', error);
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
    }
  };

  // Open reassign student modal
  const openReassignModal = (student) => {
    setStudentToManage(student);
    setSelectedSection('');
    setIsReassignModalOpen(true);
  };

  // Handle student reassignment
  const handleReassignStudent = async () => {
    if (!studentToManage || !selectedSection) return;
    
    try {
      setIsLoading(true);
      
      // Update student document
      await updateDoc(doc(db, 'users', studentToManage.id), {
        section: selectedSection
      });
      
      // Update student count in old section (current section)
      const currentClassQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', section.sectionName)
      );
      const currentClassSnapshot = await getDocs(currentClassQuery);
      
      if (!currentClassSnapshot.empty) {
        const currentClassDoc = currentClassSnapshot.docs[0];
        const currentClassId = currentClassDoc.id;
        
        // Update count (current count - 1)
        await updateDoc(doc(db, 'classes', currentClassId), {
          studentCount: Math.max(0, (currentClassDoc.data().studentCount || 0) - 1)
        });
      }
      
      // Update student count in new section
      const newClassQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', selectedSection)
      );
      const newClassSnapshot = await getDocs(newClassQuery);
      
      if (!newClassSnapshot.empty) {
        const newClassDoc = newClassSnapshot.docs[0];
        const newClassId = newClassDoc.id;
        
        // Update count (current count + 1)
        await updateDoc(doc(db, 'classes', newClassId), {
          studentCount: (newClassDoc.data().studentCount || 0) + 1
        });
      }
      
      // Update the lists
      setStudents(students.filter(s => s.id !== studentToManage.id));
      setFilteredStudents(filteredStudents.filter(s => s.id !== studentToManage.id));
      
      setShowSuccessToast({
        visible: true,
        message: `Student reassigned to ${selectedSection}`
      });
      setTimeout(() => {
        setShowSuccessToast({ visible: false, message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error reassigning student:', error);
    } finally {
      setIsLoading(false);
      setIsReassignModalOpen(false);
      setStudentToManage(null);
    }
  };

  // Open delete student modal
  const openDeleteModal = (student) => {
    setStudentToManage(student);
    setIsDeleteModalOpen(true);
  };

  // Handle student deletion
  const handleDeleteStudent = async () => {
    if (!studentToManage) return;
    
    try {
      setIsLoading(true);
      
      // Delete student document
      await deleteDoc(doc(db, 'users', studentToManage.id));
      
      // Update class document student count
      const classQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', section.sectionName)
      );
      const classSnapshot = await getDocs(classQuery);
      
      if (!classSnapshot.empty) {
        const classDoc = classSnapshot.docs[0];
        const classId = classDoc.id;
        
        await updateDoc(doc(db, 'classes', classId), {
          studentCount: Math.max(0, (classDoc.data().studentCount || 0) - 1)
        });
      }
      
      // Delete Firebase Auth record to allow email reuse
      try {
        await adminDeleteUser(null, null, studentToManage.id);
      } catch (authError) {
        console.error('Error deleting Firebase Auth record:', authError);
      }
      
      // Update lists
      setStudents(students.filter(s => s.id !== studentToManage.id));
      setFilteredStudents(filteredStudents.filter(s => s.id !== studentToManage.id));
      
      setShowSuccessToast({
        visible: true,
        message: 'Student deleted successfully'
      });
      setTimeout(() => {
        setShowSuccessToast({ visible: false, message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setStudentToManage(null);
    }
  };

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
  
  // Toggle selection of a student
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  // Toggle all students selection
  const toggleAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      // Deselect all
      setSelectedStudents([]);
    } else {
      // Select all
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };
  
  // Reset student selection when edit mode changes
  useEffect(() => {
    if (!isEditMode) {
      setSelectedStudents([]);
      setShowBulkActions(false);
      setBulkAction(null);
    }
  }, [isEditMode]);
  
  // Show bulk actions when students are selected
  useEffect(() => {
    setShowBulkActions(selectedStudents.length > 0);
  }, [selectedStudents]);
  
  // Bulk reassign students
  const handleBulkReassign = async () => {
    if (selectedStudents.length === 0 || !bulkTargetSection) return;
    
    try {
      setIsLoading(true);
      
      // Selected student objects
      const studentsToReassign = filteredStudents.filter(student => 
        selectedStudents.includes(student.id)
      );
      
      // Update each student document
      const updatePromises = studentsToReassign.map(student => 
        updateDoc(doc(db, 'users', student.id), {
          section: bulkTargetSection
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update student count in current section
      const currentClassQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', section.sectionName)
      );
      const currentClassSnapshot = await getDocs(currentClassQuery);
      
      if (!currentClassSnapshot.empty) {
        const currentClassDoc = currentClassSnapshot.docs[0];
        const currentClassId = currentClassDoc.id;
        
        // Update count (current count - selected students)
        await updateDoc(doc(db, 'classes', currentClassId), {
          studentCount: Math.max(0, (currentClassDoc.data().studentCount || 0) - selectedStudents.length)
        });
      }
      
      // Update student count in new section
      const newClassQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', bulkTargetSection)
      );
      const newClassSnapshot = await getDocs(newClassQuery);
      
      if (!newClassSnapshot.empty) {
        const newClassDoc = newClassSnapshot.docs[0];
        const newClassId = newClassDoc.id;
        
        // Update count (current count + selected students)
        await updateDoc(doc(db, 'classes', newClassId), {
          studentCount: (newClassDoc.data().studentCount || 0) + selectedStudents.length
        });
      }
      
      // Update local state
      const remainingStudents = students.filter(student => !selectedStudents.includes(student.id));
      setStudents(remainingStudents);
      setFilteredStudents(remainingStudents);
      
      setShowBulkConfirmModal(false);
      setSelectedStudents([]);
      setBulkAction(null);
      setBulkTargetSection('');
      
      setShowSuccessToast({
        visible: true,
        message: `${selectedStudents.length} students reassigned successfully`
      });
      setTimeout(() => {
        setShowSuccessToast({ visible: false, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error in bulk reassignment:', error);
      alert('Failed to reassign students');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bulk delete students
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Selected student objects
      const studentsToDelete = filteredStudents.filter(student => 
        selectedStudents.includes(student.id)
      );
      
      // Delete each student document and auth record
      for (const student of studentsToDelete) {
        // Delete student document
        await deleteDoc(doc(db, 'users', student.id));
        
        // Delete auth record
        try {
          await adminDeleteUser(null, null, student.id);
        } catch (authError) {
          console.error('Error deleting auth record:', authError);
        }
      }
      
      // Update class document student count
      const classQuery = query(
        collection(db, 'classes'),
        where('sectionName', '==', section.sectionName)
      );
      const classSnapshot = await getDocs(classQuery);
      
      if (!classSnapshot.empty) {
        const classDoc = classSnapshot.docs[0];
        const classId = classDoc.id;
        
        await updateDoc(doc(db, 'classes', classId), {
          studentCount: Math.max(0, (classDoc.data().studentCount || 0) - selectedStudents.length)
        });
      }
      
      // Update local state
      const remainingStudents = students.filter(student => !selectedStudents.includes(student.id));
      setStudents(remainingStudents);
      setFilteredStudents(remainingStudents);
      
      setShowBulkConfirmModal(false);
      setSelectedStudents([]);
      setBulkAction(null);
      
      setShowSuccessToast({
        visible: true,
        message: `${selectedStudents.length} students deleted successfully`
      });
      setTimeout(() => {
        setShowSuccessToast({ visible: false, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error in bulk deletion:', error);
      alert('Failed to delete students');
    } finally {
      setIsLoading(false);
    }
  };

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
                <div className="flex items-center">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{section.sectionName}</h1>
                  {isEditMode && (
                    <button 
                      onClick={openEditClassNameModal}
                      className="ml-3 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
                      title="Edit Class Name"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
              </div>              <div className="mt-4 md:mt-0">
                <button 
                  onClick={toggleEditMode} 
                  className={`${isEditMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white text-[#141a35] hover:bg-blue-50'} font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center`}
                >
                  {isEditMode ? (
                    <>
                      <X className="h-4 w-4 mr-1.5" />
                      {selectedStudents.length > 0 ? 'Cancel Selection' : 'Cancel Editing'}
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-1.5" />
                      Edit Class
                    </>
                  )}
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

            {/* Bulk Actions Bar */}
            {isEditMode && selectedStudents.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-blue-700" />
                  </div>
                  <span className="font-medium text-blue-900">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBulkAction('reassign');
                      setShowBulkConfirmModal(true);
                    }}
                    className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-all flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Reassign
                  </button>
                  <button
                    onClick={() => {
                      setBulkAction('delete');
                      setShowBulkConfirmModal(true);
                    }}
                    className="bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-700 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            )}

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
                            {isEditMode && (
                              <th className="px-6 py-3 text-left">
                                <div className="flex items-center">
                                  <div
                                    onClick={toggleAllStudents}
                                    className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center cursor-pointer"
                                    style={{
                                      backgroundColor: 
                                        selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
                                          ? '#141a35' 
                                          : 'transparent',
                                    }}
                                  >
                                    {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 && (
                                      <div className="text-white text-xs">✓</div>
                                    )}
                                  </div>
                                </div>
                              </th>
                            )}
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
                            <tr key={student.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className="px-6 py-4 whitespace-nowrap">
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
                              </td><td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.email || 'No email'}</div>
                              </td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {isEditMode ? (
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => openReassignModal(student)}
                                      className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium flex items-center"
                                    >
                                      <Users className="h-3.5 w-3.5 mr-1" />
                                      Reassign
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal(student)}
                                      className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium flex items-center"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                                      Delete
                                    </button>
                                  </div>
                                ) : (
                                  <button className="text-indigo-600 hover:text-indigo-900">
                                    View Details
                                  </button>
                                )}
                              </td></tr>
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
        )}
        
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Class Performance Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#141a35] mb-6 flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                Class Performance Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
                  <div className="font-medium text-sm opacity-80 mb-1">Average Score</div>
                  <div className="text-3xl font-bold">85%</div>
                  <div className="mt-2 text-xs text-blue-100">+5% from previous week</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
                  <div className="font-medium text-sm opacity-80 mb-1">Completion Rate</div>
                  <div className="text-3xl font-bold">76%</div>
                  <div className="mt-2 text-xs text-green-100">27 of 35 activities</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
                  <div className="font-medium text-sm opacity-80 mb-1">Engagement Rate</div>
                  <div className="text-3xl font-bold">89%</div>
                  <div className="mt-2 text-xs text-purple-100">+12% from last month</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-gray-500 text-sm mb-4">Modules Completion Progress</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Data Structures</span>
                      <span className="text-sm font-medium text-gray-700">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Algorithms</span>
                      <span className="text-sm font-medium text-gray-700">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Problem Solving</span>
                      <span className="text-sm font-medium text-gray-700">64%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "64%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">System Design</span>
                      <span className="text-sm font-medium text-gray-700">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-4 text-center">
                  Note: This is sample data for UI demonstration purposes.
                </div>
              </div>
            </div>
            
            {/* Individual Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#141a35] mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Individual Student Performance
              </h2>
              
              {students.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Overall Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activities Completed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student, index) => (
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
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 
                                index % 3 === 1 ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {index % 3 === 0 ? 'A' : index % 3 === 1 ? 'B+' : 'B'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {Math.floor(Math.random() * 15) + 20}/35
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {`${Math.floor(Math.random() * 24) + 1}h ago`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-700">
                    No student data available to display performance metrics.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Edit Class Name Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Class Name</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                Class Name
              </label>
              <input
                type="text"
                id="className"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter class name"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={updateClassName}
                disabled={!editClassName.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center disabled:bg-blue-300"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reassign Student Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Reassign Student</h2>
              <button 
                onClick={() => setIsReassignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {studentToManage && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#141a35] text-white flex items-center justify-center font-medium mr-3">
                    {studentToManage.name ? studentToManage.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <div className="font-semibold">{studentToManage.name}</div>
                    <div className="text-sm text-gray-600">{studentToManage.email}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="sectionSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select New Class
              </label>
              {availableSections.length > 0 ? (
                <select
                  id="sectionSelect"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a class...</option>
                  {availableSections.map((sectionName, index) => (
                    <option key={index} value={sectionName}>
                      {sectionName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-gray-100 rounded-md text-gray-600 text-sm">
                  No other classes available for reassignment
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button 
                onClick={() => setIsReassignModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignStudent}
                disabled={!selectedSection || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center disabled:bg-blue-300"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <UserCheck className="h-4 w-4 mr-1.5" />
                )}
                Reassign Student
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Student Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Student</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
            </div>
            
            {studentToManage && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#141a35] text-white flex items-center justify-center font-medium mr-3">
                    {studentToManage.name ? studentToManage.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <div className="font-semibold">{studentToManage.name}</div>
                    <div className="text-sm text-gray-600">{studentToManage.email}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center disabled:bg-red-300"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="h-4 w-4 mr-1.5" />
                )}
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Toast */}
      {showSuccessToast.visible && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-lg flex items-center z-50">
          <div className="mr-3 bg-white bg-opacity-20 rounded-full p-1">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span>{showSuccessToast.message}</span>
        </div>
      )}

      {/* Bulk Confirm Modal */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                {bulkAction === 'delete' ? (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                ) : (
                  <Users className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {bulkAction === 'delete' ? 'Delete Students' : 'Reassign Students'}
              </h2>
              <p className="text-gray-600 mb-6">
                {bulkAction === 'delete'
                  ? `Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`
                  : `Choose a new class for ${selectedStudents.length} students:`}
              </p>
            </div>
            
            {bulkAction === 'reassign' && (
              <div className="mb-6">
                <label htmlFor="bulkSectionSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select New Class
                </label>
                <select
                  id="bulkSectionSelect"
                  value={bulkTargetSection}
                  onChange={(e) => setBulkTargetSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a class...</option>
                  {availableSections.map((sectionName, index) => (
                    <option key={index} value={sectionName}>
                      {sectionName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowBulkConfirmModal(false);
                  setBulkAction(null);
                  setBulkTargetSection('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={bulkAction === 'delete' ? handleBulkDelete : handleBulkReassign}
                disabled={isLoading || (bulkAction === 'reassign' && !bulkTargetSection)}
                className={`px-4 py-2 ${
                  bulkAction === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-md flex items-center ${
                  (bulkAction === 'reassign' && !bulkTargetSection) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                ) : bulkAction === 'delete' ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete Students
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-1.5" />
                    Reassign Students
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewClassPage;
