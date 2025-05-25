import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import SectionCard from '../../components/AdminSectionCard';
import AcademicYearEditor from '../../components/AcademicYearEditor';
import { Search, Plus, RefreshCw, AlertTriangle, CheckCircle, XCircle, Calendar, Filter, X, Layers } from 'lucide-react';
 
function AdminPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newAcademicYear, setNewAcademicYear] = useState(''); // Add state for new academic year
  const [academicYears, setAcademicYears] = useState([]); // Store available academic years

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedSection, setEditedSection] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedAcademicYear, setEditedAcademicYear] = useState(''); // Add state for edited academic year

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [isYearEditorOpen, setIsYearEditorOpen] = useState(false);
  const [yearToEdit, setYearToEdit] = useState(null);
  const [newYearName, setNewYearName] = useState('');

  const [activeTab, setActiveTab] = useState('classes'); // Add state for active tab

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const classSnapshot = await getDocs(collection(db, 'classes'));
        const classData = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const updatedSections = await Promise.all(
          classData.map(async (section) => {
            const qInstructor = query(
              collection(db, 'users'),
              where('section', '==', section.sectionName),
              where('role', '==', 'instructor')
            );
            const instructorSnapshot = await getDocs(qInstructor);
            const instructorData = instructorSnapshot.docs.map((doc) => doc.data());
            const instructorName = instructorData.length > 0 ? instructorData[0].name : 'TBA';

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
              academicYear: section.academicYear || 'Not specified', // Default value if not present
            };
          })
        );

        // Extract unique academic years for filtering
        const years = [...new Set(updatedSections.map(section => 
          section.academicYear || 'Not specified'
        ))];
        setAcademicYears(years);

        // Sort sections by name
        updatedSections.sort((a, b) => a.sectionName.localeCompare(b.sectionName));
        
        setSections(updatedSections);
        setFilteredSections(updatedSections);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data: ', error);
        setIsLoading(false);
        showToast('Failed to load classes', 'error');
      }
    };

    fetchData();
  }, []);
  
  // Search filter effect - updated to include academic year filtering
  useEffect(() => {
    let filtered = sections;
    
    // First filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(section => 
        section.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.academicYear.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Then filter by academic year if selected
    if (academicYearFilter !== '' && academicYearFilter !== 'all') {
      filtered = filtered.filter(section => 
        section.academicYear === academicYearFilter
      );
    }
    
    setFilteredSections(filtered);
  }, [searchQuery, sections, academicYearFilter]);
  
  // Toast notification handler
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };
  const handleAddClass = async () => {
    if (newClassName.trim() === '') {
      showToast('Please enter a class name', 'error');
      return;
    }
    
    // Check if class name already exists
    const classExists = sections.some(section => 
      section.sectionName.toLowerCase() === newClassName.toLowerCase()
    );
    
    if (classExists) {
      showToast('A class with this name already exists', 'error');
      return;
    }

    const newSection = {
      sectionName: newClassName,
      instructor: 'TBA',
      studentCount: 0,
      createdAt: serverTimestamp(),
      academicYear: newAcademicYear.trim() || 'Not specified', // Add academic year
    };

    try {
      const docRef = await addDoc(collection(db, 'classes'), newSection);
      const sectionWithId = { id: docRef.id, ...newSection };
      setSections(prev => [...prev, sectionWithId].sort((a, b) => a.sectionName.localeCompare(b.sectionName)));
      setIsPopupOpen(false);
      setNewClassName('');
      setNewAcademicYear('');
      showToast('Class added successfully', 'success');
    } catch (error) {
      console.error('Error adding class: ', error);
      showToast('Failed to add class', 'error');
    }
  };

  const handleEditSection = (section) => {
    setEditedSection(section);
    setEditedName(section.sectionName);
    setEditedAcademicYear(section.academicYear || 'Not specified');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedSection || editedName.trim() === '') {
      showToast('Class name cannot be empty', 'error');
      return;
    }
    
    // Check if the name is unchanged and academic year is unchanged
    if (editedName === editedSection.sectionName && editedAcademicYear === editedSection.academicYear) {
      setIsEditModalOpen(false);
      setEditedSection(null);
      return;
    }
    
    // Check if name already exists
    const nameExists = sections.some(
      section => section.id !== editedSection.id && section.sectionName.toLowerCase() === editedName.toLowerCase()
    );
    
    if (nameExists) {
      showToast('A class with this name already exists', 'error');
      return;
    }

    try {
      const sectionRef = doc(db, 'classes', editedSection.id);
      await updateDoc(sectionRef, { 
        sectionName: editedName,
        academicYear: editedAcademicYear || 'Not specified'
      });

      // Update local state
      const updatedSections = sections.map((sec) =>
        sec.id === editedSection.id ? { 
          ...sec, 
          sectionName: editedName,
          academicYear: editedAcademicYear || 'Not specified'
        } : sec
      ).sort((a, b) => a.sectionName.localeCompare(b.sectionName));
      
      setSections(updatedSections);
      setIsEditModalOpen(false);
      setEditedSection(null);
      setEditedName('');
      setEditedAcademicYear('');
      showToast('Class updated successfully', 'success');
    } catch (error) {
      console.error('Error updating section name:', error);
      showToast('Failed to update class', 'error');
    }
  };const [affectedUsers, setAffectedUsers] = useState({ students: 0, instructor: null });
  const [deleteStudents, setDeleteStudents] = useState(false);
  const handleDeleteSection = async (section) => {
    // Get count of affected users
    try {
      const studentQuery = query(
        collection(db, 'users'),
        where('section', '==', section.sectionName),
        where('role', '==', 'student')
      );
      const instructorQuery = query(
        collection(db, 'users'),
        where('section', '==', section.sectionName),
        where('role', '==', 'instructor')
      );

      const [studentSnapshot, instructorSnapshot] = await Promise.all([
        getDocs(studentQuery),
        getDocs(instructorQuery)
      ]);

      setAffectedUsers({
        students: studentSnapshot.size,
        instructor: instructorSnapshot.docs[0]?.data()?.name || null
      });
      
      setSectionToDelete(section);
      setShowDeleteModal(true);
    } catch (error) {
      console.error('Error checking affected users:', error);
      showToast('Error checking affected users', 'error');
    }
  };
  
  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;
  
    try {
      // Show loading indicator
      setIsLoading(true);
      
      // 1. Get all users in this section
      const studentsQuery = query(
        collection(db, 'users'),
        where('section', '==', sectionToDelete.sectionName),
        where('role', '==', 'student')
      );
      const instructorsQuery = query(
        collection(db, 'users'),
        where('section', '==', sectionToDelete.sectionName),
        where('role', '==', 'instructor')
      );
      
      const [studentSnapshot, instructorSnapshot] = await Promise.all([
        getDocs(studentsQuery),
        getDocs(instructorsQuery)
      ]);

      // 2. Handle students based on deleteStudents option
      const studentUpdates = deleteStudents
        ? studentSnapshot.docs.map(doc => deleteDoc(doc.ref))
        : studentSnapshot.docs.map(doc => updateDoc(doc.ref, { section: '' }));

      // 3. Always unassign instructors
      const instructorUpdates = instructorSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { section: '' })
      );
      
      // 4. Execute all updates and delete the section
      await Promise.all([
        ...studentUpdates,
        ...instructorUpdates,
        deleteDoc(doc(db, 'classes', sectionToDelete.id))
      ]);

      setSections((prev) => prev.filter((s) => s.id !== sectionToDelete.id));
      setShowDeleteModal(false);
      setSectionToDelete(null);
      setAffectedUsers({ students: 0, instructor: null });
      setDeleteStudents(false);
      setIsLoading(false);
      
      showToast(
        `${sectionToDelete.sectionName} has been deleted successfully`, 
        'success'
      );
    } catch (error) {
      console.error('Error deleting section:', error);
      setIsLoading(false);
      showToast('Failed to delete section', 'error');
    }
  };
  const handleRefresh = () => {
    // Re-fetch data
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'classes'));
        const classData = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const updatedSections = await Promise.all(
          classData.map(async (section) => {
            const qInstructor = query(
              collection(db, 'users'),
              where('section', '==', section.sectionName),
              where('role', '==', 'instructor')
            );
            const instructorSnapshot = await getDocs(qInstructor);
            const instructorData = instructorSnapshot.docs.map((doc) => doc.data());
            const instructorName = instructorData.length > 0 ? instructorData[0].name : 'TBA';

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
              academicYear: section.academicYear || 'Not specified',
            };
          })
        );

        updatedSections.sort((a, b) => a.sectionName.localeCompare(b.sectionName));
        setSections(updatedSections);
        setFilteredSections(updatedSections);
        setSearchQuery('');
        showToast('Data refreshed successfully', 'success');
      } catch (error) {
        console.error('Error refreshing data: ', error);
        showToast('Failed to refresh data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  };
  
  // Handle bulk update of academic year
  const handleUpdateAcademicYear = async () => {
    if (!yearToEdit || !newYearName.trim()) {
      showToast('Please enter a valid academic year', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get all sections with the selected academic year
      const sectionsToUpdate = sections.filter(section => section.academicYear === yearToEdit);
      
      if (sectionsToUpdate.length === 0) {
        showToast('No classes to update', 'warning');
        setIsYearEditorOpen(false);
        setIsLoading(false);
        return;
      }
      
      // Update each section document
      const updatePromises = sectionsToUpdate.map(section => 
        updateDoc(doc(db, 'classes', section.id), {
          academicYear: newYearName.trim()
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const updatedSections = sections.map(section => {
        if (section.academicYear === yearToEdit) {
          return { ...section, academicYear: newYearName.trim() };
        }
        return section;
      });
      
      // Update academic years list
      const updatedYears = [...new Set(updatedSections.map(section => 
        section.academicYear || 'Not specified'
      ))];
      
      setSections(updatedSections);
      setAcademicYears(updatedYears);
      
      // If currently filtering by the edited year, update the filter
      if (academicYearFilter === yearToEdit) {
        setAcademicYearFilter(newYearName.trim());
      }
      
      showToast(`Successfully updated ${sectionsToUpdate.length} classes`, 'success');
      setIsYearEditorOpen(false);
      setYearToEdit(null);
      setNewYearName('');
    } catch (error) {
      console.error('Error updating academic years:', error);
      showToast('Failed to update academic years', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new academic year
  const handleAddAcademicYear = async (yearName) => {
    if (!yearName.trim()) return;
    
    // Check if year already exists
    if (academicYears.includes(yearName.trim())) {
      showToast('This academic year already exists', 'error');
      return;
    }
    
    // Just add to the list - no need to create documents for years by themselves
    setAcademicYears([...academicYears, yearName.trim()].sort());
    showToast(`Academic year "${yearName}" created successfully`, 'success');
  };
  
  // Delete academic year
  const handleDeleteAcademicYear = async (year) => {
    // Check if there are classes in this year
    const classesInYear = sections.filter(s => s.academicYear === year);
    
    if (classesInYear.length > 0) {
      showToast(`Cannot delete: ${classesInYear.length} classes are assigned to this year`, 'error');
      return;
    }
    
    // Remove from list since it's not used
    setAcademicYears(academicYears.filter(y => y !== year));
    showToast(`Academic year "${year}" removed`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Class Management" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-7 bg-white p-6 rounded-lg shadow-lg h-[75vh] flex flex-col relative border border-gray-200">
        {/* Top section with actions */}
        <div className="flex flex-col md:flex-row justify-between items-center py-4 px-2 gap-4 border-b pb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <h2 className="text-lg font-bold text-[#141a35]">Manage Classes</h2>
            <span className="bg-[#141a35] text-white text-xs px-2 py-1 rounded-full">
              {filteredSections.length} Total
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'classes' 
                  ? 'bg-white shadow text-[#141a35]' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-1.5" />
                Classes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('years')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'years' 
                  ? 'bg-white shadow text-[#141a35]' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                Academic Years
              </div>
            </button>
          </div>
          
          {activeTab === 'classes' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="border border-gray-300 rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-md transition"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#141a35] to-[#2a3363] text-white text-sm font-medium px-3 py-2 rounded-lg hover:from-[#1f274d] hover:to-[#354080] transition shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Class</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {activeTab === 'classes' && (
          <>
            {/* Academic Year Filter Section */}
            <div className="py-3 px-2 border-b">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                  <span>Academic Year:</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAcademicYearFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      academicYearFilter === '' || academicYearFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    All Years
                  </button>
                  
                  {academicYears.map((year, index) => (
                    <button
                      key={index}
                      onClick={() => setAcademicYearFilter(year)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                        academicYearFilter === year
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <span>{year}</span>
                      {academicYearFilter === year && (
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setAcademicYearFilter('all');
                          }} 
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {academicYearFilter && academicYearFilter !== 'all' && (
                <div className="mt-2 pl-6 flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Showing classes for year:</span>
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                    {academicYearFilter}
                  </span>
                  <span className="mx-2 text-xs text-gray-500">({filteredSections.length} classes)</span>
                </div>
              )}
            </div>

            {/* Loading state - Classes View */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#141a35]"></div>
                  <p className="mt-3 text-gray-600">Loading classes...</p>
                </div>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center bg-gray-50 p-8 rounded-lg border border-dashed border-gray-300 max-w-md">
                  <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    {searchQuery ? (
                      <Search className="h-8 w-8 text-gray-400" />
                    ) : (
                      <Plus className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchQuery ? 'No matching classes' : 'No classes available'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 mb-4">
                    {searchQuery 
                      ? `No classes matching "${searchQuery}" were found.` 
                      : 'Start by creating your first class to manage students and instructors.'}
                  </p>
                  {searchQuery ? (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Clear search
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPopupOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#141a35] hover:bg-[#1f274d]"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Class
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pr-2 flex-grow">
                {filteredSections.map((item) => (
                  <SectionCard
                    key={item.id}
                    sectionName={item.sectionName}
                    instructor={item.instructor}
                    studentCount={item.studentCount}
                    academicYear={item.academicYear}
                    onClick={() => navigate('/ViewClassPage', { state: { section: item } })}
                    onEdit={() => handleEditSection(item)}
                    onDelete={() => handleDeleteSection(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Academic Years Tab */}
        {activeTab === 'years' && !isLoading && (
          <div className="flex-1 overflow-y-auto p-4">
            <AcademicYearEditor 
              sections={sections}
              academicYears={academicYears}
              onUpdateYear={handleUpdateAcademicYear}
              onDeleteYear={handleDeleteAcademicYear}
              onAddYear={handleAddAcademicYear}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'years' && isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#141a35]"></div>
              <p className="mt-3 text-gray-600">Loading academic years...</p>
            </div>
          </div>
        )}
        
        {/* Toast notification */}
        {toast.show && (
          <div 
            className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 max-w-md
            ${toast.type === 'error' ? 'bg-red-50 text-red-800' : 
              toast.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 
              'bg-green-50 text-green-800'} 
            rounded-lg shadow-md transition-all duration-300 transform translate-x-0 opacity-100`}
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
              {toast.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <button
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={() => setToast({ show: false, message: '', type: '' })}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      
        {/* Add Class Modal */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl space-y-4 relative">
              <h2 className="text-xl font-bold text-[#141a35] border-b pb-3">Add New Class</h2>
              <div className="space-y-4 pt-2">
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    id="className"
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Enter Class Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    id="academicYear"
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    placeholder="e.g., 2023-2024"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsPopupOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClass}
                    className="px-4 py-2 bg-gradient-to-r from-[#141a35] to-[#2a3363] text-white rounded-lg hover:from-[#1f274d] hover:to-[#354080] transition font-medium"
                  >
                    Add Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Section Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl space-y-4 relative">
              <h2 className="text-xl font-bold text-[#141a35] border-b pb-3">Edit Class</h2>
              <div>
                <label htmlFor="editClassName" className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  id="editClassName"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="editAcademicYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <input
                  id="editAcademicYear"
                  type="text"
                  value={editedAcademicYear}
                  onChange={(e) => setEditedAcademicYear(e.target.value)}
                  placeholder="e.g., 2023-2024"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-gradient-to-r from-[#141a35] to-[#2a3363] text-white rounded-lg hover:from-[#1f274d] hover:to-[#354080] transition font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Section Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white px-8 py-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-600 mb-4">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Delete {sectionToDelete?.sectionName}</h3>
                <p className="text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
              
              {(affectedUsers.students > 0 || affectedUsers.instructor) && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium mb-1">This will affect:</p>
                      <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                        {affectedUsers.students > 0 && (
                          <li>{affectedUsers.students} student{affectedUsers.students !== 1 ? 's' : ''} will be {deleteStudents ? 'deleted' : 'unassigned'}</li>
                        )}
                        {affectedUsers.instructor && (
                          <li>Instructor {affectedUsers.instructor} will be unassigned</li>
                        )}
                      </ul>
                      
                      {affectedUsers.students > 0 && (
                        <div className="flex items-center mt-3 p-2 bg-white rounded border border-amber-300">
                          <input
                            type="checkbox"
                            id="deleteStudents"
                            checked={deleteStudents}
                            onChange={(e) => setDeleteStudents(e.target.checked)}
                            className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                          />
                          <label htmlFor="deleteStudents" className="ml-2 text-sm font-medium text-red-700">
                            Also delete student accounts
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 border-t pt-4 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSectionToDelete(null);
                    setAffectedUsers({ students: 0, instructor: null });
                    setDeleteStudents(false);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSection}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium"
                >
                  Delete Class
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Academic Year Editor Modal */}
        {isYearEditorOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[450px] shadow-xl space-y-4 relative">
              <h2 className="text-xl font-bold text-[#141a35] border-b pb-3">Academic Year Manager</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Current Academic Years</h3>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-[200px] overflow-y-auto">
                    {academicYears.length > 0 ? (
                      <ul className="space-y-2">
                        {academicYears.map((year, index) => (
                          <li 
                            key={index} 
                            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                          >
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{year}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">
                                {sections.filter(s => s.academicYear === year).length} classes
                              </span>
                              <button
                                onClick={() => {
                                  setYearToEdit(year);
                                  setNewYearName(year);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-2">No academic years defined</p>
                    )}
                  </div>
                </div>
                
                {yearToEdit && (
                  <div className="space-y-4 pt-2 border-t">
                    <h3 className="font-medium text-gray-700 pt-2">Update Academic Year</h3>
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4">
                      <p>Changing <span className="font-semibold">"{yearToEdit}"</span> to a new name will update all {sections.filter(s => s.academicYear === yearToEdit).length} classes assigned to this year.</p>
                    </div>
                    <div>
                      <label htmlFor="newYearName" className="block text-sm font-medium text-gray-700 mb-1">
                        New Year Name
                      </label>
                      <input
                        id="newYearName"
                        type="text"
                        value={newYearName}
                        onChange={(e) => setNewYearName(e.target.value)}
                        placeholder="e.g., 2023-2024"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setYearToEdit(null);
                          setNewYearName('');
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateAcademicYear}
                        disabled={!newYearName.trim() || isLoading}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:bg-blue-300 flex items-center"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-1.5" />
                        )}
                        Update Year
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end border-t pt-4 mt-2">
                <button
                  onClick={() => setIsYearEditorOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
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
