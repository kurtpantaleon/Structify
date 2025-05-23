import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc,} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import { deleteDoc } from 'firebase/firestore';


function ViewStudentsPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });  // Bulk upload states
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkUploadErrors, setBulkUploadErrors] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

//multiple select
const [selectedStudents, setSelectedStudents] = useState([]);
const [multiAssignSection, setMultiAssignSection] = useState('');
const [showMultiAssignModal, setShowMultiAssignModal] = useState(false);

const toggleSelectStudent = (id) => {
  setSelectedStudents(prev => prev.includes(id)
    ? prev.filter(sid => sid !== id)
    : [...prev, id]);
};

const toggleSelectAll = () => {
  const allIds = students.map(s => s.id);
  const isAllSelected = allIds.every(id => selectedStudents.includes(id));
  setSelectedStudents(isAllSelected ? [] : allIds);
};

const handleMultiAssign = async () => {
  const newSection = multiAssignSection === '__unassign__' ? '' : multiAssignSection;
  const updates = [];

  for (const id of selectedStudents) {
    const student = students.find(s => s.id === id);
    if (!student) continue;

    updates.push(setDoc(doc(db, 'users', id), {
      ...student,
      section: newSection,
    }));
  }

  await Promise.all(updates);

  const updatedStudents = students.map(s =>
    selectedStudents.includes(s.id)
      ? { ...s, section: newSection }
      : s
  );

  setStudents(updatedStudents);
  setSelectedStudents([]);
  setShowMultiAssignModal(false);
};

//--- end of multiple select


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);
  // Load sections when bulk upload modal opens
  useEffect(() => {
    if (showBulkUploadModal) {
      const loadSections = async () => {
        setIsLoadingSections(true);
        try {
          const classesSnapshot = await getDocs(collection(db, 'classes'));
          const sections = classesSnapshot.docs.map(doc => doc.data().sectionName);
          setAvailableSections(sections);
        } catch (error) {
          console.error('Error loading sections:', error);
          setBulkUploadErrors(prev => [...prev, {
            name: 'System',
            email: '',
            error: 'Failed to load available sections. Please try again.'
          }]);
        } finally {
          setIsLoadingSections(false);
        }
      };
      loadSections();
    }
  }, [showBulkUploadModal]);

  const groupedBySection = students.reduce((acc, student) => {
    const section = student.section || 'Unassigned';
    if (!acc[section]) acc[section] = [];
    acc[section].push(student);
    return acc;
  }, {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createStudent = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;
  
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill out all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;
  
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        section: '',
        role: 'student',
      });
  
      await secondaryAuth.signOut(); // 🧼 Clean up secondary session
  
      setStudents((prev) => [...prev, { id: uid, name, email, section: '', role: 'student' }]);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setShowModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating student:', error.message);
      alert('Error: ' + error.message);
    }
  };  
  const openReassignModal = async (student) => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classList = classesSnapshot.docs.map((doc) => doc.data().sectionName);
      
      setAvailableSections(classList);
      setSelectedStudent(student);
      setSelectedSection('');
      setReassignModalOpen(true);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const handleReassignSection = async () => {
    if (!selectedStudent) return;
  
    try {
      const newSection = selectedSection === '__unassign__' ? '' : selectedSection;
  
      // Update user document
      await setDoc(doc(db, 'users', selectedStudent.id), {
        ...selectedStudent,
        section: newSection,
      });
  
      // 🔁 Update studentCount in the class document
      if (newSection) {
        const classQuery = query(
          collection(db, 'classes'),
          where('sectionName', '==', newSection)
        );
        const classSnapshot = await getDocs(classQuery);
  
        if (!classSnapshot.empty) {
          const classDoc = classSnapshot.docs[0];
          const classId = classDoc.id;
  
          const studentsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'student'),
            where('section', '==', newSection)
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          const studentCount = studentsSnapshot.size;
  
          await setDoc(doc(db, 'classes', classId), {
            ...classDoc.data(),
            studentCount: studentCount,
          });
        }
      }
  
      const updated = students.map((s) =>
        s.id === selectedStudent.id ? { ...s, section: newSection } : s
      );
  
      setStudents(updated);
      setReassignModalOpen(false);
      setSelectedStudent(null);
      setSelectedSection('');
    } catch (error) {
      console.error('Error updating student section:', error);
    }
  };  

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
  
    try {
      await deleteDoc(doc(db, 'users', studentToDelete.id));
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student.');
    }
  };  

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();    reader.onload = async (event) => {
      try {
        const csvData = event.target.result;
        const rows = csvData.split('\n').filter(row => row.trim());
        const total = rows.length - 1; // Exclude header row
        let success = 0;
        const errors = [];
        
        // Get available sections first
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        const existingSections = new Map(
          classesSnapshot.docs.map(doc => [doc.data().sectionName, doc.id])
        );

        // Create a map to track new sections and their student counts
        const newSections = new Map();
        
        // Skip header row and process each student
        for (let i = 1; i < rows.length; i++) {
          const [name, email, password, section] = rows[i].split(',').map(field => field.trim());
            // If section provided and doesn't exist, create it
          if (section && !existingSections.has(section)) {
            try {
              // Check if section name is valid
              if (!section.match(/^[A-Za-z0-9\s-]+$/)) {
                errors.push({
                  name,
                  email,
                  error: `Invalid section name: ${section}. Only letters, numbers, spaces, and hyphens are allowed.`
                });
                continue;
              }

              // Add new section to Firestore
              const newSectionRef = doc(collection(db, 'classes'));
              await setDoc(newSectionRef, {
                sectionName: section,
                studentCount: 0,
                createdAt: new Date().toISOString()
              });
              
              existingSections.set(section, newSectionRef.id);
              newSections.set(section, 0);
              console.log(`Created new section: ${section}`);
            } catch (error) {
              console.error(`Error creating section ${section}:`, error);
              errors.push({ 
                name, 
                email, 
                error: `Failed to create new section: ${section}. Error: ${error.message}` 
              });
              continue;
            }
          }

          try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'users', uid), {
              name,
              email,
              section: section || '',
              role: 'student',
            });            // Update section's student count if section is assigned
            if (section) {
              const classId = existingSections.get(section);
              if (classId) {
                // Update the count in our tracking map
                if (newSections.has(section)) {
                  newSections.set(section, newSections.get(section) + 1);
                } else {
                  const studentsQuery = query(
                    collection(db, 'users'),
                    where('role', '==', 'student'),
                    where('section', '==', section)
                  );
                  const studentsSnapshot = await getDocs(studentsQuery);
                  const currentCount = studentsSnapshot.size;
                  
                  // Update the class document with new count
                  await setDoc(doc(db, 'classes', classId), {
                    sectionName: section,
                    studentCount: currentCount + 1,
                  }, { merge: true });
                }
              }
            }

            await secondaryAuth.signOut();
            success++;
            setUploadProgress(Math.floor((success / total) * 100));
              setStudents(prev => [...prev, { 
              id: uid, 
              name, 
              email, 
              section: section || '', 
              role: 'student' 
            }]);
          } catch (error) {
            errors.push({ name, email, error: error.message });
          }
        }

        setBulkUploadErrors(errors);
        if (errors.length === 0) {
          setShowBulkUploadModal(false);
          setShowSuccessModal(true);
        }        // Update all new sections with their final counts
        for (const [section, count] of newSections.entries()) {
          const classId = existingSections.get(section);
          if (classId) {
            await setDoc(doc(db, 'classes', classId), {
              sectionName: section,
              studentCount: count,
            }, { merge: true });
          }
        }

      } catch (error) {
        console.error('Error processing CSV:', error);
        setBulkUploadErrors([{ name: 'CSV Processing', email: '', error: error.message }]);
      } finally {
        setUploadProgress(0);
        e.target.value = ''; // Reset file input
      }
    };

    reader.readAsText(file);
  };
  const downloadCsvTemplate = () => {
    const template = 'Name,Email,Password,Section\nJohn Doe,john@example.com,password123,Section A\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Students" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        <div className="flex justify-end mb-4 space-x-3">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center"
          >
            <i className="far fa-upload mr-2"></i>
            Bulk Upload
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
          >
            Add Student
          </button>
          {/* multiple button*/}
          <button
            onClick={() => setShowMultiAssignModal(true)}
            disabled={selectedStudents.length === 0}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            Assign Section to Selected
          </button>

        </div>

        <div className="overflow-y-scroll pr-2 space-y-6">
          {Object.entries(groupedBySection).sort(([a], [b]) => a.localeCompare(b)).map(([section, studentsInSection], index) => (
            <div key={index} className="mb-2">
              <h3 className="text-2xl font-bold text-[#141a35] mb-2 border-b pb-1">{section}</h3>
              {/* Section Group Header Row with Select All */}
<div className="flex items-center justify-between py-2 border-b font-semibold text-[#141a35] bg-gray-100">
  <input
    type="checkbox"
    onChange={toggleSelectAll}
    checked={students.length > 0 && selectedStudents.length === students.length}
    className="mr-2"
  />
  <span className="flex-1">Name</span>
  <span className="w-32 text-right">Actions</span>
</div>

              {/* Student Rows */}
              {studentsInSection.map((student, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between py-2 border-b last:border-b-0 ${selectedStudents.includes(student.id) ? 'bg-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelectStudent(student.id)}
                    />
                    <span className="text-[#141a35] text-base">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-3 w-32 justify-end">
                    <button
                      className="text-sm font-medium text-blue-700 hover:underline cursor-pointer"
                      onClick={() => openReassignModal(student)}
                    >
                      {student.section === '' ? 'Assign Section' : 'Re-assign Section'}
                    </button>
                    <button
                      className="text-sm font-medium text-red-500 hover:underline cursor-pointer"
                      onClick={() => { setStudentToDelete(student); setShowDeleteModal(true); }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              ))}

            </div>
          ))}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-[#141a35]">Add New Student</h2>
            <form onSubmit={createStudent} className="space-y-4">

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {passwordMismatch && (
                <p className="text-sm font-medium text-red-500 mt-1">Passwords do not match.</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setPasswordMismatch(false);
                  }}
                  className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#141a35] text-white px-4 py-2 rounded-md hover:bg-[#1f274d]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-6 py-4 rounded-lg shadow-md text-center w-full max-w-sm">
            <h2 className="text-xl font-semibold text-[#141a35] mb-2">Success</h2>
            <p className="text-gray-700">Student account has been created successfully!</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-[#141a35] text-white rounded hover:bg-[#1f274d]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Re-Assign Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-6 py-5 rounded-lg shadow-md w-full max-w-sm">
            <h3 className="text-lg font-bold text-[#141a35] mb-3">
              {selectedStudent?.section ? 'Re-assign Section' : 'Assign Section'}
            </h3>
            {availableSections.length > 0 ? (
              <>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                >
                  <option value="">Select Section</option>
                  {availableSections.map((section, idx) => (
                    <option key={idx} value={section}>
                      {section}
                    </option>
                  ))}
                  {selectedStudent?.section && (
                    <option value="__unassign__" className="text-red-600">
                      Unassign Section
                    </option>
                  )}
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setReassignModalOpen(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReassignSection}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">No available sections.</p>
                <button
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

{/*Multi select*/}
      {showMultiAssignModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm">
      <h3 className="text-lg font-bold text-[#141a35] mb-3">Assign Section</h3>
     <select
  value={multiAssignSection}
  onChange={(e) => setMultiAssignSection(e.target.value)}
  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
>
  <option value="">-- Select Section --</option>
  {availableSections.map((section, idx) => (
    <option key={idx} value={section}>
      {section}
    </option>
  ))}
  <option value="__unassign__" className="text-red-600">
    Unassign
  </option>
</select>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowMultiAssignModal(false)}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleMultiAssign}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Assign
        </button>
      </div>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-6 py-5 rounded-lg shadow-md w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-[#141a35] mb-2">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-medium">{studentToDelete?.name}</span>'s account?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-6 py-4 rounded-lg shadow-md text-center w-full max-w-sm">
            <h2 className="text-xl font-semibold text-[#141a35] mb-2">Success</h2>
            <p className="text-gray-700">Student account has been deleted successfully!</p>
            <button
              onClick={() => setShowDeleteSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-[#141a35] text-white rounded hover:bg-[#1f274d]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-[#141a35]">Bulk Upload Students</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  className="w-full"
                />                <p className="text-sm text-gray-500 mt-2">
                  Upload CSV file with columns: Name, Email, Password, Section (optional)
                </p>                <div className="mt-2 text-xs text-gray-600">
                  {isLoadingSections ? (
                    <p>Loading available sections...</p>
                  ) : (
                    <p>Available Sections: {availableSections.length > 0 ? availableSections.join(', ') : 'No sections found'}</p>
                  )}
                </div>
                <button
                  onClick={downloadCsvTemplate}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Download CSV Template
                </button>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}

              {bulkUploadErrors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-red-600 font-medium mb-2">Failed Uploads:</h3>
                  <div className="max-h-32 overflow-y-auto">
                    {bulkUploadErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-500">
                        {error.name} ({error.email}): {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setBulkUploadErrors([]);
                    setUploadProgress(0);
                  }}
                  className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewStudentsPage;
