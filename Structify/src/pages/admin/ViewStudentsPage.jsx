import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc,} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth, adminDeleteUser } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import { deleteDoc } from 'firebase/firestore';
import { 
  UserPlus, Upload, Users, UserCheck, Trash2, Edit3, 
  CheckCircle, XCircle, AlertCircle, FileText, Download,
  Search, Mail, Book, Layers, UsersRound, GraduationCap,
  CheckSquare, Square, MoreHorizontal, UserMinus
} from 'lucide-react';

// Student Section Skeleton component for loading state
const StudentSectionSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm animate-pulse">
    <div className="p-3 bg-gray-50 rounded-t-lg border-b border-gray-100 flex items-center gap-2">
      <div className="bg-gray-200 rounded-md w-8 h-8"></div>
      <div className="bg-gray-200 rounded h-6 w-24"></div>
      <div className="ml-2 bg-gray-200 rounded-full h-4 w-8"></div>
    </div>
    <div className="divide-y divide-gray-100">
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-full h-10 w-10"></div>
            <div>
              <div className="bg-gray-200 rounded h-4 w-24 mb-2"></div>
              <div className="bg-gray-200 rounded h-3 w-32"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 rounded-full h-9 w-9"></div>
            <div className="bg-gray-200 rounded-full h-9 w-9"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

function ViewStudentsPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  // Bulk upload states
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkUploadErrors, setBulkUploadErrors] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  // Bulk selection states
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkActionType, setBulkActionType] = useState(null); // 'reassign' or 'delete'
  const [bulkReassignSection, setBulkReassignSection] = useState('');
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchStudents();
  }, []);
  
  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student => 
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.section && student.section.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }  
  }, [searchTerm, students]);

  // Move groupedBySection calculation here, before it's used in the next useEffect
  const groupedBySection = filteredStudents.reduce((acc, student) => {
    const section = student.section || 'Unassigned';
    if (!acc[section]) acc[section] = [];
    acc[section].push(student);
    return acc;
  }, {});
    // Initialize collapsed state for sections only on initial load or when new sections are added
  useEffect(() => {
    const sections = Object.keys(groupedBySection);
    const newSections = sections.filter(section => !(section in collapsedSections));
    
    if (newSections.length > 0) {
      setCollapsedSections(prev => ({
        ...prev,
        ...Object.fromEntries(newSections.map(section => [section, false]))
      }));
    }
  }, [groupedBySection, collapsedSections]);
  
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
  
  // Calculate statistics about the students and sections
  const totalSections = Object.keys(groupedBySection).filter(section => section !== 'Unassigned').length;
  const totalAssignedStudents = Object.entries(groupedBySection)
    .filter(([section]) => section !== 'Unassigned')
    .reduce((sum, [, students]) => sum + students.length, 0);
  const unassignedStudents = groupedBySection['Unassigned']?.length || 0;
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecial) {
      return 'Password must contain at least one special character';
    }
    
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const createStudent = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;
  
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert('Please fill out all fields.');
      return;
    }
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    } else {
      setPasswordError('');
    }
  
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    } else {
      setPasswordMismatch(false);
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;
      
      const fullName = `${firstName} ${lastName}`;
      const newStudent = {
        id: uid,
        name: fullName,
        firstName,
        lastName,
        email,
        section: '',
        role: 'student',
        hearts: 3,
        coins: 100,
        rankPoints: 0,
      };
      
      await setDoc(doc(db, 'users', uid), newStudent);
  
      await secondaryAuth.signOut(); // Clean up secondary session      setStudents((prev) => [...prev, newStudent]);
      setFilteredStudents((prev) => [...prev, newStudent]);
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setPasswordError('');
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
      }      const updatedStudent = { ...selectedStudent, section: newSection };
      
      // Update both arrays
      setStudents(students.map((s) =>
        s.id === selectedStudent.id ? updatedStudent : s
      ));
      
      setFilteredStudents(filteredStudents.map((s) =>
        s.id === selectedStudent.id ? updatedStudent : s
      ));
      setReassignModalOpen(false);
      setSelectedStudent(null);
      setSelectedSection('');
    } catch (error) {
      console.error('Error updating student section:', error);
    }
  };  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
  
    try {
      // Step 1: If student is assigned to a section, update class document's student count
      if (studentToDelete.section) {
        const classQuery = query(
          collection(db, 'classes'),
          where('sectionName', '==', studentToDelete.section)
        );
        const classSnapshot = await getDocs(classQuery);
        
        if (!classSnapshot.empty) {
          const classDoc = classSnapshot.docs[0];
          const classId = classDoc.id;
          
          // Calculate new student count (current count - 1)
          const currentCount = classDoc.data().studentCount || 0;
          const newCount = Math.max(0, currentCount - 1); // Ensure count doesn't go below 0
          
          // Update the class document with new count
          await setDoc(doc(db, 'classes', classId), {
            ...classDoc.data(),
            studentCount: newCount
          });
          
          console.log(`Updated student count for section ${studentToDelete.section}: ${newCount}`);
        }
      }
      
      // Step 2: Delete any submissions made by this student
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', studentToDelete.id)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      // Delete all submissions by this student
      const submissionDeletionPromises = submissionsSnapshot.docs.map(submissionDoc => 
        deleteDoc(doc(db, 'submissions', submissionDoc.id))
      );
      
      if (submissionDeletionPromises.length > 0) {
        await Promise.all(submissionDeletionPromises);
        console.log(`Deleted ${submissionDeletionPromises.length} submissions for student ${studentToDelete.name}`);
      }
      
      // Step 3: Delete any forum posts made by this student
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', studentToDelete.id)
      );
      const postsSnapshot = await getDocs(postsQuery);
      
      // Delete all posts by this student
      const postDeletionPromises = postsSnapshot.docs.map(postDoc => 
        deleteDoc(doc(db, 'posts', postDoc.id))
      );
      
      if (postDeletionPromises.length > 0) {
        await Promise.all(postDeletionPromises);
        console.log(`Deleted ${postDeletionPromises.length} forum posts by student ${studentToDelete.name}`);
      }
      
      // Step 4: Delete match history data for this student
      try {
        const userMatchesRef = collection(db, 'users', studentToDelete.id, 'matchHistory');
        const matchesSnapshot = await getDocs(userMatchesRef);
        
        // Delete all match history records for this student
        const matchHistoryDeletionPromises = matchesSnapshot.docs.map(matchDoc => 
          deleteDoc(doc(db, 'users', studentToDelete.id, 'matchHistory', matchDoc.id))
        );
        
        if (matchHistoryDeletionPromises.length > 0) {
          await Promise.all(matchHistoryDeletionPromises);
          console.log(`Deleted ${matchHistoryDeletionPromises.length} match history records for student ${studentToDelete.name}`);
        }
      } catch (matchError) {
        console.error('Error deleting match history:', matchError);
        // Continue with deletion even if match history deletion fails
      }
      
      // Step 5: Check for and delete any other subcollections
      try {
        // Get all subcollections for this student
        const subcollections = await db.collection('users').doc(studentToDelete.id).listCollections();
        
        // Delete all documents in each subcollection
        for (const subcollection of subcollections) {
          if (subcollection.id === 'matchHistory') continue; // Already handled above
          
          const subcollectionDocs = await getDocs(
            collection(db, 'users', studentToDelete.id, subcollection.id)
          );
          
          const subcollectionDeletionPromises = subcollectionDocs.docs.map(subdoc => 
            deleteDoc(doc(db, 'users', studentToDelete.id, subcollection.id, subdoc.id))
          );
          
          if (subcollectionDeletionPromises.length > 0) {
            await Promise.all(subcollectionDeletionPromises);
            console.log(`Deleted ${subcollectionDeletionPromises.length} documents from subcollection ${subcollection.id}`);
          }
        }
      } catch (subcollectionError) {
        console.error('Error deleting subcollections:', subcollectionError);
        // Continue with deletion even if subcollection deletion fails
      }
      
      // Step 6: Delete matches where this student is a participant
      try {
        // Check global matches collection where this student participated
        const participantMatchesQuery = query(
          collection(db, 'matches'),
          where('participants', 'array-contains', studentToDelete.id)
        );
        const participantMatchesSnapshot = await getDocs(participantMatchesQuery);
        
        const participantMatchDeletionPromises = participantMatchesSnapshot.docs.map(matchDoc => 
          deleteDoc(doc(db, 'matches', matchDoc.id))
        );
        
        if (participantMatchDeletionPromises.length > 0) {
          await Promise.all(participantMatchDeletionPromises);
          console.log(`Deleted ${participantMatchDeletionPromises.length} matches where ${studentToDelete.name} participated`);
        }
      } catch (matchError) {
        console.error('Error deleting match records:', matchError);
        // Continue with deletion even if match deletion fails
      }
        // Step 7: Delete the student document from users collection
      await deleteDoc(doc(db, 'users', studentToDelete.id));
      console.log(`Deleted student document for ${studentToDelete.name}`);
      
      // Step 8: Delete the Firebase Authentication record to allow email reuse
      try {
        const authDeleted = await adminDeleteUser(null, null, studentToDelete.id);
        
        if (authDeleted) {
          console.log(`Successfully deleted Firebase Auth record for ${studentToDelete.email}`);
        } else {
          console.warn(`Could not delete Firebase Auth record for ${studentToDelete.email}. Email may not be reusable.`);
        }
      } catch (authError) {
        console.error('Error deleting Firebase Auth record:', authError);
        // Continue with the process even if auth deletion fails
      }
      
      // Step 9: Update both students and filtered students
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setFilteredStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      
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
          const [lastName, firstName, email, password, section] = rows[i].split(',').map(field => field.trim());
          const name = `${firstName} ${lastName}`;
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
              hearts: 3,
              coins: 100,
              rankPoints: 0,
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
            setUploadProgress(Math.floor((success / total) * 100));              const newStudent = {
                id: uid, 
                name, 
                email, 
                section: section || '', 
                role: 'student'
              };
              
              // Update both arrays
              setStudents(prev => [...prev, newStudent]);
              setFilteredStudents(prev => [...prev, newStudent]);
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
    const template = 'Last Name,First Name,Email,Password,Section\nDoe,John,john@example.com,password123,Section A\n';
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

  // Add the toggleEditMode function
  const toggleEditMode = async () => {
    if (!isEditMode) {
      // Load available sections for reassignment when entering edit mode
      try {
        setIsLoading(true);
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        const sections = classesSnapshot.docs.map(doc => doc.data().sectionName);
        setAvailableSections(sections);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading sections:', error);
        setIsLoading(false);
      }
    }
    setIsEditMode(!isEditMode);
    setSelectedStudents([]);
  };
  
  // Select all students in a section
  const toggleSelectAllInSection = (sectionName) => {
    const sectionStudents = groupedBySection[sectionName] || [];
    const sectionStudentIds = sectionStudents.map(student => student.id);
    
    // Check if all students in section are already selected
    const allSelected = sectionStudentIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      // Remove all from selection
      setSelectedStudents(prev => prev.filter(id => !sectionStudentIds.includes(id)));
    } else {
      // Add all to selection
      setSelectedStudents(prev => {
        const newSelection = [...prev];
        sectionStudentIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Exit edit mode and clear selections
  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedStudents([]);
    setBulkActionType(null);
  };

  // Get selected student objects
  const getSelectedStudentObjects = () => {
    return students.filter(student => selectedStudents.includes(student.id));
  };

  // Bulk reassign students
  const handleBulkReassign = async () => {
    if (selectedStudents.length === 0 || !bulkReassignSection) return;
    
    setIsLoading(true);
    try {
      const selectedStudentObjects = getSelectedStudentObjects();
      const newSection = bulkReassignSection === '__unassign__' ? '' : bulkReassignSection;
      
      // Group students by their current section for batch updates
      const studentsBySection = {};
      selectedStudentObjects.forEach(student => {
        const currentSection = student.section || '';
        if (!studentsBySection[currentSection]) {
          studentsBySection[currentSection] = [];
        }
        studentsBySection[currentSection].push(student);
      });
      
      // Update each student document
      const updatePromises = selectedStudentObjects.map(student => 
        setDoc(doc(db, 'users', student.id), {
          ...student,
          section: newSection,
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update student counts for all affected classes
      const classUpdates = [];
      
      // 1. Update source classes (decrease counts)
      for (const [section, students] of Object.entries(studentsBySection)) {
        if (section) { // Only if section is not empty
          const sourceClassQuery = query(
            collection(db, 'classes'),
            where('sectionName', '==', section)
          );
          const sourceClassSnapshot = await getDocs(sourceClassQuery);
          
          if (!sourceClassSnapshot.empty) {
            const classDoc = sourceClassSnapshot.docs[0];
            const classId = classDoc.id;
            const currentCount = classDoc.data().studentCount || 0;
            const newCount = Math.max(0, currentCount - students.length);
            
            classUpdates.push(
              setDoc(doc(db, 'classes', classId), {
                ...classDoc.data(),
                studentCount: newCount
              })
            );
          }
        }
      }
      
      // 2. Update destination class (increase count)
      if (newSection) {
        const destClassQuery = query(
          collection(db, 'classes'),
          where('sectionName', '==', newSection)
        );
        const destClassSnapshot = await getDocs(destClassQuery);

        if (!destClassSnapshot.empty) {
          const classDoc = destClassSnapshot.docs[0];
          const classId = classDoc.id;
          const currentCount = classDoc.data().studentCount || 0;
          
          classUpdates.push(
            setDoc(doc(db, 'classes', classId), {
              ...classDoc.data(),
              studentCount: currentCount + selectedStudents.length
            })
          );
        }
      }
      
      // Execute all class updates
      await Promise.all(classUpdates);
      
      // Update local state
      const updatedStudents = students.map(student => {
        if (selectedStudents.includes(student.id)) {
          return { ...student, section: newSection };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      
      // Clear selection and reset UI
      setShowBulkConfirmModal(false);
      setSelectedStudents([]);
      setBulkActionType(null);
      setBulkReassignSection('');
      
      showSuccessToast(`Successfully reassigned ${selectedStudents.length} students`);
    } catch (error) {
      console.error('Error reassigning students:', error);
      showErrorToast('Failed to reassign students');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk delete students
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsLoading(true);
    try {
      const selectedStudentObjects = getSelectedStudentObjects();
      
      for (const student of selectedStudentObjects) {
        // Update class counts if needed
        if (student.section) {
          const classQuery = query(
            collection(db, 'classes'),
            where('sectionName', '==', student.section)
          );
          const classSnapshot = await getDocs(classQuery);
          
          if (!classSnapshot.empty) {
            const classDoc = classSnapshot.docs[0];
            const classId = classDoc.id;
            
            // Calculate new student count
            const currentCount = classDoc.data().studentCount || 0;
            const newCount = Math.max(0, currentCount - 1);
            
            await setDoc(doc(db, 'classes', classId), {
              ...classDoc.data(),
              studentCount: newCount
            });
          }
        }
        
        // Delete student document
        await deleteDoc(doc(db, 'users', student.id));
        
        // Delete auth record
        try {
          await adminDeleteUser(null, null, student.id);
        } catch (authError) {
          console.error('Error deleting auth record:', authError);
        }
      }
      
      // Update local state
      const remainingStudents = students.filter(student => !selectedStudents.includes(student.id));
      setStudents(remainingStudents);
      setFilteredStudents(remainingStudents);
      
      // Clear selection and reset UI
      setShowBulkConfirmModal(false);
      setSelectedStudents([]);
      setBulkActionType(null);
      
      showSuccessToast(`Successfully deleted ${selectedStudentObjects.length} students`);
    } catch (error) {
      console.error('Error deleting students:', error);
      showErrorToast('Failed to delete students');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success toast
  const showSuccessToast = (message) => {
    // Use existing toast state or implement new toast functionality
    console.log(message);
  };

  // Show error toast
  const showErrorToast = (message) => {
    // Use existing toast state or implement new toast functionality
    console.error(message);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Students" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}      <div className="max-w-6xl mx-auto mt-7 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md h-[75vh] flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#141a35]/10 p-1.5 rounded-md">
              <GraduationCap className="w-5 h-5 text-[#141a35]" />
            </div>
            <h2 className="text-xl font-semibold text-[#141a35]">Manage Students</h2>
            <div className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {students.length} Total
            </div>
          </div>
          {!isEditMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="bg-emerald-600 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Upload</span>
                <span className="sm:hidden">Upload</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#141a35] text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:bg-[#1f274d] transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button
                onClick={toggleEditMode} // Use the toggleEditMode function
                className="border border-gray-300 bg-white text-gray-700 text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {selectedStudents.length} selected
              </span>
              <button
                onClick={exitEditMode}
                className="px-3 py-1.5 text-gray-700 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <UsersRound className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h4 className="text-xl font-bold text-gray-800">{students.length}</h4>
              {students.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {totalAssignedStudents} assigned · {unassignedStudents} unassigned
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start">
            <div className="bg-emerald-100 rounded-full p-2 mr-3">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sections</p>
              <h4 className="text-xl font-bold text-gray-800">{totalSections}</h4>
              {totalSections > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Avg. {Math.round(totalAssignedStudents / Math.max(1, totalSections))} students per section
                </p>
              )}
            </div>
          </div>
          
          <div className="relative flex">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>        <div className="overflow-y-auto pr-3 flex-grow">
          {!isLoading && Object.keys(groupedBySection).length > 0 && (
            <div className="flex justify-between mb-3">
              <div>
                {isEditMode && selectedStudents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setBulkActionType('reassign');
                        setShowBulkConfirmModal(true);
                      }}
                      disabled={selectedStudents.length === 0}
                      className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-all flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Reassign
                    </button>
                    <button
                      onClick={() => {
                        setBulkActionType('delete');
                        setShowBulkConfirmModal(true);
                      }}
                      disabled={selectedStudents.length === 0}
                      className="bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-700 transition-all flex items-center gap-1.5"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  const sections = Object.keys(groupedBySection);
                  const anyExpanded = sections.some(section => !collapsedSections[section]);
                  
                  const newCollapsedState = {};
                  sections.forEach(section => {
                    newCollapsedState[section] = anyExpanded;
                  });
                  
                  setCollapsedSections(newCollapsedState);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
              >
                {Object.keys(collapsedSections).length > 0 && Object.values(collapsedSections).every(Boolean) ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-up"><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></svg>
                    Expand All
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-down"><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg>
                    Collapse All
                  </>
                )}
              </button>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, idx) => (
                <StudentSectionSkeleton key={idx} />
              ))}
            </div>
          ) : Object.keys(groupedBySection).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 mb-2 opacity-20" />
                  <p className="text-center font-medium">No matching students found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <GraduationCap className="w-16 h-16 mb-2 opacity-20" />
                  <p className="text-center font-medium">No students found</p>
                  <p className="text-sm mt-1">Add students using the buttons above</p>
                </>
              )}
            </div>
          ) : (            <div className="space-y-6">
              {Object.entries(groupedBySection)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([section, studentsInSection], index) => (                <div key={index} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div                    className={`flex items-center justify-between p-3 ${collapsedSections[section] ? 'bg-gray-50 rounded-lg' : 'bg-gray-50 rounded-t-lg'} border-b ${collapsedSections[section] ? 'border-b-0' : 'border-gray-100'} cursor-pointer hover:bg-gray-100 transition-colors relative group`}
                    onClick={() => {
                      setCollapsedSections(prev => ({
                        ...prev, 
                        [section]: !prev[section]
                      }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isEditMode && (
                        <div onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectAllInSection(section);
                        }} className="mr-1">
                          {studentsInSection.every(student => selectedStudents.includes(student.id)) ? (
                            <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
                          ) : studentsInSection.some(student => selectedStudents.includes(student.id)) ? (
                            <div className="h-4.5 w-4.5 border-2 border-blue-600 bg-blue-100 rounded-sm"></div>
                          ) : (
                            <Square className="h-4.5 w-4.5 text-gray-400" />
                          )}
                        </div>
                      )}
                      <div className={`p-1.5 rounded-md ${
                        section === 'Unassigned' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {section === 'Unassigned' ? 
                          <Users className="w-5 h-5" /> : 
                          <Layers className="w-5 h-5" />
                        }
                      </div>
                      <h3 className="text-lg font-bold text-[#141a35]">{section}</h3>
                      <div className="ml-2 bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {studentsInSection.length}
                      </div>
                    </div>
                    <div className={`text-gray-500 bg-white/50 rounded-full p-1 transition-transform duration-300 transform ${collapsedSections[section] ? 'rotate-180' : 'rotate-0'} group-hover:bg-white/80`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6"/></svg>
                    </div>
                  </div>
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsedSections[section] ? 'opacity-0 max-h-0' : 'opacity-100'}`}
                       style={{ maxHeight: collapsedSections[section] ? '0px' : `${studentsInSection.length * 80}px` }}>
                    <div className="divide-y divide-gray-100">
                      {studentsInSection.map((student, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            {isEditMode && (
                              <div 
                                onClick={() => toggleStudentSelection(student.id)}
                                className="cursor-pointer mr-1"
                              >
                                {selectedStudents.includes(student.id) ? (
                                  <CheckSquare className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            )}
                            <div className="bg-[#141a35]/5 p-2 rounded-full">
                              <UserCheck className="w-5 h-5 text-[#141a35]" />
                            </div>
                            <div>
                              <span className="font-medium text-[#141a35]">{student.name}</span>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <Mail className="w-3 h-3 mr-1" />
                                {student.email}
                              </div>
                            </div>
                          </div>
                          
                          {!isEditMode && (
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                                onClick={() => openReassignModal(student)}
                                title={student.section === '' ? 'Assign Section' : 'Re-assign Section'}
                              >
                                <Edit3 className="w-4.5 h-4.5" />
                              </button>
                              <button 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                onClick={() => { setStudentToDelete(student); setShowDeleteModal(true); }}
                                title="Delete Account"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#141a35]/10 p-2 rounded-full">
                <UserPlus className="h-6 w-6 text-[#141a35]" />
              </div>
              <h2 className="text-xl font-semibold text-[#141a35]">Add New Student</h2>
            </div>            <form onSubmit={createStudent} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#141a35]/20 focus:border-[#141a35] transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#141a35]/20 focus:border-[#141a35] transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#141a35]/20 focus:border-[#141a35] transition-all duration-200"
                  required
                />
              </div>
                <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 transition-all duration-200 ${
                    passwordError 
                      ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-[#141a35]/20 focus:border-[#141a35]'
                  }`}
                  required
                />
                {passwordError && (
                  <p className="flex items-start gap-1 text-xs text-red-500 mt-1.5">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" /> 
                    {passwordError}
                  </p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  Password must contain:
                  <ul className="list-disc pl-5 mt-1">
                    <li>At least 8 characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 transition-all duration-200 ${
                    passwordMismatch 
                      ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-[#141a35]/20 focus:border-[#141a35]'
                  }`}
                  required
                />
                {passwordMismatch && (
                  <p className="flex items-center gap-1 text-sm text-red-500 mt-1.5">
                    <AlertCircle className="h-4 w-4" /> 
                    Passwords do not match
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setPasswordMismatch(false);
                  }}
                  className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#141a35] text-white rounded-lg hover:bg-[#1f274d] transition-colors font-medium flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-xl shadow-lg text-center w-full max-w-sm animate-fade-scale">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600">Student account has been created successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 px-6 py-2.5 bg-[#141a35] text-white rounded-lg hover:bg-[#1f274d] transition-colors duration-200 font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}      {/* Re-Assign Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 p-2 rounded-full">
                <Edit3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedStudent?.section ? 'Reassign Section' : 'Assign Section'}
              </h3>
            </div>
            
            {selectedStudent && (
              <div className="bg-gray-50 rounded-lg p-3 mb-5 flex items-center">
                <UserCheck className="h-5 w-5 text-[#141a35] mr-2" />
                <div>
                  <p className="font-medium text-gray-800">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
            )}
            
            {availableSections.length > 0 ? (
              <>
                <div className="mb-5">
                  <label htmlFor="sectionSelect" className="text-sm font-medium text-gray-700 block mb-1.5">
                    Select Section
                  </label>
                  <select
                    id="sectionSelect"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">-- Select a Section --</option>
                    {availableSections.map((section, idx) => (
                      <option key={idx} value={section}>{section}</option>
                    ))}
                    {selectedStudent?.section && (
                      <option value="__unassign__" className="font-medium">Unassign Current Section</option>
                    )}
                  </select>
                  {selectedStudent?.section && selectedSection === '' && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Current section: {selectedStudent.section}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setReassignModalOpen(false)}
                    className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReassignSection}
                    disabled={!selectedSection}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                      ${selectedSection ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-200 text-white cursor-not-allowed'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-5">No available sections found.</p>
                <button
                  onClick={() => setReassignModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl w-full max-w-md animate-fade-scale">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-2 max-w-xs">
                Are you sure you want to delete this student account? This action cannot be undone.
              </p>
              {studentToDelete && (
                <div className="bg-gray-50 w-full rounded-lg p-3 my-3 text-left">
                  <p className="font-medium text-gray-800">{studentToDelete.name}</p>
                  <p className="text-sm text-gray-500">{studentToDelete.email}</p>
                  {studentToDelete.section && (
                    <div className="mt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {studentToDelete.section}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-4 w-full">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl text-center w-full max-w-sm animate-fade-scale">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Success</h2>
            <p className="text-gray-600">Student account has been deleted successfully.</p>
            <button
              onClick={() => setShowDeleteSuccessModal(false)}
              className="mt-6 px-6 py-2.5 bg-[#141a35] text-white rounded-lg hover:bg-[#1f274d] transition-colors font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Bulk Upload Students</h2>
            </div>
            
            <div className="space-y-5">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-50/80 transition-colors">
                <FileText className="h-10 w-10 text-gray-400 mb-2" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  className="hidden"
                  id="csvUpload"
                />
                <label
                  htmlFor="csvUpload"
                  className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1f274d] cursor-pointer transition-colors flex items-center gap-1 mb-3"
                >
                  <Upload className="w-4 h-4" />
                  Select CSV File
                </label>                <p className="text-sm text-gray-500 mb-1 text-center">
                  Upload CSV with columns: Last Name, First Name, Email, Password, Section (optional, will be created if doesn't exist)
                </p>
                <button
                  onClick={downloadCsvTemplate}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV Template
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 flex items-center gap-1 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Available Sections
                </h4>
                {isLoadingSections ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm">Loading available sections...</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {availableSections.length > 0 ? (
                      availableSections.map((section, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                          {section}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">No sections available</p>
                    )}
                  </div>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700">Uploading...</span>
                    <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {bulkUploadErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 flex items-center gap-1 mb-2">
                    <XCircle className="w-4 h-4" />
                    Upload Errors
                  </h3>
                  <div className="max-h-40 overflow-y-auto">
                    {bulkUploadErrors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 border-b border-red-100 pb-1.5 mb-1.5 last:border-0 last:mb-0 last:pb-0">
                        <span className="font-medium">{error.name}</span>
                        {error.email && <span> ({error.email})</span>}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setBulkUploadErrors([]);
                    setUploadProgress(0);
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Skeleton Loading Component */}
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-100 shadow-sm animate-pulse">
              <div className="p-3 bg-gray-50 rounded-t-lg border-b border-gray-100 flex items-center gap-2">
                <div className="bg-gray-200 rounded-md w-8 h-8"></div>
                <div className="bg-gray-200 rounded h-6 w-24"></div>
                <div className="ml-2 bg-gray-200 rounded-full h-4 w-8"></div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 rounded-full h-10 w-10"></div>
                      <div>
                        <div className="bg-gray-200 rounded h-4 w-24 mb-2"></div>
                        <div className="bg-gray-200 rounded h-3 w-32"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-9 w-9"></div>
                      <div className="bg-gray-200 rounded-full h-9 w-9"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Confirmation Modal */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl w-full max-w-md animate-fade-scale">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                {bulkActionType === 'delete' ? (
                  <Trash2 className="h-8 w-8 text-red-600" />
                ) : (
                  <Users className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {bulkActionType === 'delete' 
                  ? 'Confirm Bulk Deletion' 
                  : 'Reassign Students'}
              </h3>
              <p className="text-gray-600 mb-4">
                {bulkActionType === 'delete' 
                  ? `Are you sure you want to delete ${selectedStudents.length} selected students? This action cannot be undone.`
                  : `Select a class to reassign ${selectedStudents.length} students:`}
              </p>

              {bulkActionType === 'reassign' && (
                <div className="w-full mb-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-blue-500">Loading classes...</span>
                    </div>
                  ) : (
                    <select
                      value={bulkReassignSection}
                      onChange={(e) => setBulkReassignSection(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="">-- Select Class --</option>
                      {availableSections.map((section, idx) => (
                        <option key={idx} value={section}>{section}</option>
                      ))}
                      <option value="__unassign__" className="font-medium text-orange-600">
                        Remove from current class
                      </option>
                    </select>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Note: This will update student count in all affected classes
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-4 w-full">
                <button
                  onClick={() => {
                    setShowBulkConfirmModal(false);
                    setBulkActionType(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={bulkActionType === 'delete' ? handleBulkDelete : handleBulkReassign}
                  disabled={bulkActionType === 'reassign' && !bulkReassignSection}
                  className={`flex-1 px-4 py-2.5 ${
                    bulkActionType === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                    (bulkActionType === 'reassign' && !bulkReassignSection) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {bulkActionType === 'delete' ? (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Reassign
                    </>
                  )}
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
