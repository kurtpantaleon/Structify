import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth, adminDeleteUser } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import { deleteDoc } from 'firebase/firestore';
import { 
  UserPlus, Upload, Users, UserCheck, Trash2, Edit3, 
  CheckCircle, XCircle, AlertCircle, FileText, Download, 
  Search, Mail, ShieldCheck, CheckSquare, Square, UserMinus
} from 'lucide-react';

function ViewInstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkUploadErrors, setBulkUploadErrors] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add new states for bulk selection
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [bulkActionType, setBulkActionType] = useState(null); // 'reassign' or 'delete'
  const [bulkReassignSection, setBulkReassignSection] = useState('');
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInstructors(data);
        setFilteredInstructors(data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, []);
  
  // Filter instructors based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(
        instructor => 
          instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (instructor.section && instructor.section.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  // Load sections when bulk upload modal opens
  useEffect(() => {
    if (showBulkUploadModal) {
      const loadSections = async () => {
        setIsLoadingSections(true);
        try {
          const classesSnapshot = await getDocs(collection(db, 'classes'));
          const classList = classesSnapshot.docs.map(doc => doc.data().sectionName);
          
          // Get sections that are not already assigned to instructors
          const instructorsSnapshot = await getDocs(
            query(collection(db, 'users'), where('role', '==', 'instructor'))
          );
          const usedSections = instructorsSnapshot.docs.map(doc => doc.data().section);
          const availableSections = classList.filter(section => !usedSections.includes(section));
          
          setAvailableSections(availableSections);
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

  const createInstructor = async (e) => {
    e.preventDefault();

    const { email, password, confirmPassword, firstName, lastName } = formData;
    if (!email || !password || !firstName || !lastName || !confirmPassword) {
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
      await secondaryAuth.signOut(); 

      const uid = userCredential.user.uid;
      const fullName = `${firstName} ${lastName}`;
      const newInstructor = {
        id: uid,
        email,
        name: fullName,
        firstName,
        lastName,
        role: 'instructor',
        section: '',
      };
      
      await setDoc(doc(db, 'users', uid), newInstructor);      setInstructors((prev) => [...prev, newInstructor]);
      setFilteredInstructors((prev) => [...prev, newInstructor]);
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setShowModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating instructor:', error.message);
      alert('Error: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openReassignModal = async (instructor) => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classList = classesSnapshot.docs.map((doc) => doc.data().sectionName);

      const instructorsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'instructor'))
      );
      const usedSections = instructorsSnapshot.docs.map((doc) => doc.data().section);

      const available = classList.filter(
        (section) => !usedSections.includes(section) || section === instructor.section
      );

      setAvailableSections(available);
      setSelectedInstructor(instructor);
      setSelectedSection('');
      setReassignModalOpen(true);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };
  const handleReassignSection = async () => {
    if (!selectedInstructor) return;
  
    try {
      const newSection = selectedSection === '__unassign__' ? '' : selectedSection;
  
      // 1. Update instructor document
      await setDoc(doc(db, 'users', selectedInstructor.id), {
        ...selectedInstructor,
        section: newSection,
      });
  
      // 2. Update class document
      if (newSection) {
        const classQuery = query(
          collection(db, 'classes'),
          where('sectionName', '==', newSection)
        );
        const classSnapshot = await getDocs(classQuery);
  
        if (!classSnapshot.empty) {
          const classDocId = classSnapshot.docs[0].id;
  
          await setDoc(doc(db, 'classes', classDocId), {
            ...classSnapshot.docs[0].data(),
            instructor: selectedInstructor.name, 
          });
        }
      }
  
      // 3. Update local state for both arrays
      const updatedInstructor = { ...selectedInstructor, section: newSection };
      
      setInstructors(instructors.map((inst) =>
        inst.id === selectedInstructor.id ? updatedInstructor : inst
      ));
      
      setFilteredInstructors(filteredInstructors.map((inst) =>
        inst.id === selectedInstructor.id ? updatedInstructor : inst
      ));
      
      // Show success feedback
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 flex items-center';
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Section ${newSection ? `assigned to ${newSection}` : 'unassigned'} successfully</span>
      `;
      document.body.appendChild(successMessage);
      
      // Remove after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
      setReassignModalOpen(false);
      setSelectedInstructor(null);
      setSelectedSection('');
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };  const handleDeleteInstructor = async () => {
    if (!instructorToDelete) return;
  
    try {
      // Step 1: If instructor has a section, update the class document to remove the instructor
      if (instructorToDelete.section) {
        const classQuery = query(
          collection(db, 'classes'),
          where('sectionName', '==', instructorToDelete.section)
        );
        const classSnapshot = await getDocs(classQuery);
        
        if (!classSnapshot.empty) {
          const classDoc = classSnapshot.docs[0];
          const classId = classDoc.id;
          
          // Update the class document to remove instructor reference
          await setDoc(doc(db, 'classes', classId), {
            ...classDoc.data(),
            instructor: '', // Remove instructor reference
          });
          
          console.log(`Removed instructor association from section: ${instructorToDelete.section}`);
        }
      }
      
      // Step 2: Delete all lessons created by this instructor
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('createdBy', '==', instructorToDelete.id)
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonDeletionPromises = lessonsSnapshot.docs.map(lessonDoc => 
        deleteDoc(doc(db, 'lessons', lessonDoc.id))
      );
      
      if (lessonDeletionPromises.length > 0) {
        await Promise.all(lessonDeletionPromises);
        console.log(`Deleted ${lessonDeletionPromises.length} lessons created by instructor ${instructorToDelete.name}`);
      }
      
      // Step 3: Delete all activities created by this instructor
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('createdBy', '==', instructorToDelete.id)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activityDeletionPromises = activitiesSnapshot.docs.map(activityDoc => 
        deleteDoc(doc(db, 'activities', activityDoc.id))
      );
      
      if (activityDeletionPromises.length > 0) {
        await Promise.all(activityDeletionPromises);
        console.log(`Deleted ${activityDeletionPromises.length} activities created by instructor ${instructorToDelete.name}`);
      }
      
      // Step 4: Delete all quizzes created by this instructor
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('createdBy', '==', instructorToDelete.id)
      );
      const quizzesSnapshot = await getDocs(quizzesQuery);
      const quizDeletionPromises = quizzesSnapshot.docs.map(quizDoc => 
        deleteDoc(doc(db, 'quizzes', quizDoc.id))
      );
      
      if (quizDeletionPromises.length > 0) {
        await Promise.all(quizDeletionPromises);
        console.log(`Deleted ${quizDeletionPromises.length} quizzes created by instructor ${instructorToDelete.name}`);
      }
      
      // Step 5: Delete forum posts by this instructor
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', instructorToDelete.id)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postDeletionPromises = postsSnapshot.docs.map(postDoc => 
        deleteDoc(doc(db, 'posts', postDoc.id))
      );
      
      if (postDeletionPromises.length > 0) {
        await Promise.all(postDeletionPromises);
        console.log(`Deleted ${postDeletionPromises.length} forum posts by instructor ${instructorToDelete.name}`);
      }
      
      // Step 6: Check for subcollections and delete them
      // Firestore doesn't automatically delete subcollections when a document is deleted
      try {
        // Get all subcollections for this instructor
        const subcollections = await db.collection('users').doc(instructorToDelete.id).listCollections();
        
        // Delete all documents in each subcollection
        for (const subcollection of subcollections) {
          const subcollectionDocs = await getDocs(
            collection(db, 'users', instructorToDelete.id, subcollection.id)
          );
          
          const subcollectionDeletionPromises = subcollectionDocs.docs.map(subdoc => 
            deleteDoc(doc(db, 'users', instructorToDelete.id, subcollection.id, subdoc.id))
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
      
      // Step 7: Delete the instructor document from users collection
      await deleteDoc(doc(db, 'users', instructorToDelete.id));
      console.log(`Deleted instructor document for ${instructorToDelete.name}`);
      
      // Step 8: Delete the Firebase Authentication record to allow email reuse
      try {
        const authDeleted = await adminDeleteUser(null, null, instructorToDelete.id);
        
        if (authDeleted) {
          console.log(`Successfully deleted Firebase Auth record for ${instructorToDelete.email}`);
        } else {
          console.warn(`Could not delete Firebase Auth record for ${instructorToDelete.email}. Email may not be reusable.`);
        }
      } catch (authError) {
        console.error('Error deleting Firebase Auth record:', authError);
        // Continue with the process even if auth deletion fails
      }
      
      // Step 9: Update both instructors and filtered instructors
      setInstructors((prev) => prev.filter((i) => i.id !== instructorToDelete.id));
      setFilteredInstructors((prev) => prev.filter((i) => i.id !== instructorToDelete.id));
      
      setShowDeleteModal(false);
      setInstructorToDelete(null);
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error('Error deleting instructor:', error);
      alert('Failed to delete instructor.');
    }
  };  

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
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

        // Get currently assigned sections
        const instructorsSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'instructor'))
        );
        const usedSections = instructorsSnapshot.docs.map(doc => doc.data().section);        // Skip header row and process each instructor
        for (let i = 1; i < rows.length; i++) {          const [firstName, lastName, email, password, section, role] = rows[i].split(',').map(field => field.trim());
          const fullName = `${firstName} ${lastName}`;

          // Validate role
          if (!role || role.toLowerCase() !== 'instructor') {
            errors.push({
              name: fullName,
              email,
              error: `Invalid role: ${role || 'missing'}. Role must be "instructor"`
            });
            continue;
          }          // Validate section assignment
          if (section) {
            // Check if section doesn't exist and create it
            if (!existingSections.has(section)) {
              try {
                // Check if section name is valid
                if (!section.match(/^[A-Za-z0-9\s-]+$/)) {
                  errors.push({
                    name: fullName,
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
                  instructor: fullName,
                  createdAt: new Date().toISOString()
                });
                
                existingSections.set(section, newSectionRef.id);
                console.log(`Created new section: ${section}`);
              } catch (error) {
                console.error(`Error creating section ${section}:`, error);
                errors.push({ 
                  name: fullName, 
                  email, 
                  error: `Failed to create new section: ${section}. Error: ${error.message}` 
                });
                continue;
              }
            }

            if (usedSections.includes(section)) {
              errors.push({
                name: fullName,
                email,
                error: `Section "${section}" is already assigned to another instructor`
              });
              continue;
            }
          }try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const uid = userCredential.user.uid;            const newInstructor = {
              id: uid,
              name: fullName,
              firstName,
              lastName,
              email,
              section: section || '',
              role: 'instructor',
            };
            
            await setDoc(doc(db, 'users', uid), newInstructor);            // Update the class document with instructor info if section is provided
            if (section) {
              const classId = existingSections.get(section);
              await setDoc(doc(db, 'classes', classId), {
                sectionName: section,
                instructor: fullName,
              }, { merge: true });
              
              // Add section to used sections to prevent double assignment
              usedSections.push(section);
            }

            await secondaryAuth.signOut();
            success++;
            setUploadProgress(Math.floor((success / total) * 100));

            // Update both arrays
            setInstructors(prev => [...prev, newInstructor]);
            setFilteredInstructors(prev => [...prev, newInstructor]);          } catch (error) {
            errors.push({ name: fullName, email, error: error.message });
          }
        }

        setBulkUploadErrors(errors);
        if (errors.length === 0) {
          setShowBulkUploadModal(false);
          setShowSuccessModal(true);
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
  };  const downloadCsvTemplate = () => {
    const template = 'FirstName,LastName,Email,Password,Section,Role\nJohn,Smith,john.smith@example.com,Password123!,Section A,instructor\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instructor_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Toggle edit mode with selection
  const toggleEditMode = async () => {
    if (!isEditMode) {
      // Load available sections when entering edit mode
      try {
        setIsLoading(true);
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        const classList = classesSnapshot.docs.map((doc) => doc.data().sectionName);
        
        const instructorsSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'instructor'))
        );
        const usedSections = instructorsSnapshot.docs.map((doc) => doc.data().section);

        const available = classList.filter(section => 
          !usedSections.includes(section) || !section // Include empty sections
        );
        
        setAvailableSections(available);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading sections:', error);
        setIsLoading(false);
      }
    }
    setIsEditMode(!isEditMode);
    setSelectedInstructors([]);
  };

  // Toggle instructor selection
  const toggleInstructorSelection = (instructorId) => {
    setSelectedInstructors(prev => {
      if (prev.includes(instructorId)) {
        return prev.filter(id => id !== instructorId);
      } else {
        return [...prev, instructorId];
      }
    });
  };

  // Select all instructors
  const selectAllInstructors = () => {
    if (selectedInstructors.length === filteredInstructors.length) {
      // Deselect all
      setSelectedInstructors([]);
    } else {
      // Select all
      setSelectedInstructors(filteredInstructors.map(instructor => instructor.id));
    }
  };
  
  // Exit edit mode and clear selections
  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedInstructors([]);
    setBulkActionType(null);
  };

  // Get selected instructor objects
  const getSelectedInstructorObjects = () => {
    return instructors.filter(instructor => selectedInstructors.includes(instructor.id));
  };
  
  // Bulk reassign instructors
  const handleBulkReassign = async () => {
    if (selectedInstructors.length === 0 || !bulkReassignSection) return;
    
    setIsLoading(true);
    try {
      const selectedInstructorObjects = getSelectedInstructorObjects();
      const newSection = bulkReassignSection === '__unassign__' ? '' : bulkReassignSection;
      
      // Update each instructor document and associated class
      for (const instructor of selectedInstructorObjects) {
        // 1. If instructor has a section, update the class document to remove instructor
        if (instructor.section) {
          const oldClassQuery = query(
            collection(db, 'classes'),
            where('sectionName', '==', instructor.section)
          );
          const oldClassSnapshot = await getDocs(oldClassQuery);
          
          if (!oldClassSnapshot.empty) {
            const oldClassId = oldClassSnapshot.docs[0].id;
            await setDoc(doc(db, 'classes', oldClassId), {
              ...oldClassSnapshot.docs[0].data(),
              instructor: '', // Remove instructor reference
            });
          }
        }
        
        // 2. Update instructor document
        await setDoc(doc(db, 'users', instructor.id), {
          ...instructor,
          section: newSection,
        });
        
        // 3. If new section is specified, update the class document
        if (newSection) {
          const newClassQuery = query(
            collection(db, 'classes'),
            where('sectionName', '==', newSection)
          );
          const newClassSnapshot = await getDocs(newClassQuery);
          
          if (!newClassSnapshot.empty) {
            const newClassId = newClassSnapshot.docs[0].id;
            await setDoc(doc(db, 'classes', newClassId), {
              ...newClassSnapshot.docs[0].data(),
              instructor: instructor.name, 
            });
          }
        }
      }
      
      // Update local state
      const updatedInstructors = instructors.map(instructor => {
        if (selectedInstructors.includes(instructor.id)) {
          return { ...instructor, section: newSection };
        }
        return instructor;
      });
      
      setInstructors(updatedInstructors);
      setFilteredInstructors(updatedInstructors);
      
      // Clear selection and reset UI
      setShowBulkConfirmModal(false);
      setSelectedInstructors([]);
      setBulkActionType(null);
      setBulkReassignSection('');
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 flex items-center';
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Successfully reassigned ${selectedInstructorObjects.length} instructors</span>
      `;
      document.body.appendChild(successMessage);
      
      // Remove after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error reassigning instructors:', error);
      alert('Failed to reassign instructors');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk delete instructors
  const handleBulkDelete = async () => {
    if (selectedInstructors.length === 0) return;
    
    setIsLoading(true);
    try {
      const selectedInstructorObjects = getSelectedInstructorObjects();
      
      for (const instructor of selectedInstructorObjects) {
        // 1. If instructor has a section, update the class document to remove instructor
        if (instructor.section) {
          const classQuery = query(
            collection(db, 'classes'),
            where('sectionName', '==', instructor.section)
          );
          const classSnapshot = await getDocs(classQuery);
          
          if (!classSnapshot.empty) {
            const classDoc = classSnapshot.docs[0];
            const classId = classDoc.id;
            
            // Update the class document to remove instructor reference
            await setDoc(doc(db, 'classes', classId), {
              ...classDoc.data(),
              instructor: '', // Remove instructor reference
            });
          }
        }
        
        // 2. Delete instructor content (lessons, activities, etc)
        const contentCollections = ['lessons', 'activities', 'quizzes', 'posts'];
        
        for (const collectionName of contentCollections) {
          const contentQuery = query(
            collection(db, collectionName),
            where('createdBy', '==', instructor.id)
          );
          const contentSnapshot = await getDocs(contentQuery);
          
          const contentDeletionPromises = contentSnapshot.docs.map(contentDoc => 
            deleteDoc(doc(db, collectionName, contentDoc.id))
          );
          
          if (contentDeletionPromises.length > 0) {
            await Promise.all(contentDeletionPromises);
          }
        }
        
        // 3. Delete instructor document
        await deleteDoc(doc(db, 'users', instructor.id));
        
        // 4. Delete auth record
        try {
          await adminDeleteUser(null, null, instructor.id);
        } catch (authError) {
          console.error('Error deleting auth record:', authError);
        }
      }
      
      // Update local state
      const remainingInstructors = instructors.filter(instructor => !selectedInstructors.includes(instructor.id));
      setInstructors(remainingInstructors);
      setFilteredInstructors(remainingInstructors);
      
      // Clear selection and reset UI
      setShowBulkConfirmModal(false);
      setSelectedInstructors([]);
      setBulkActionType(null);
      
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error('Error deleting instructors:', error);
      alert('Failed to delete instructors');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Instructors" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}      <div className="max-w-6xl mx-auto mt-7 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md h-[75vh] flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#141a35]/10 p-1.5 rounded-md">
              <Users className="w-5 h-5 text-[#141a35]" />
            </div>
            <h2 className="text-xl font-semibold text-[#141a35]">Manage Instructors</h2>
            <div className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {instructors.length} Total
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
                <span className="hidden sm:inline">Add Instructor</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button
                onClick={toggleEditMode}
                className="border border-gray-300 bg-white text-gray-700 text-sm font-medium px-3 sm:px-4 py-2 rounded-md hover:bg-gray-50 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {selectedInstructors.length} selected
              </span>
              <button
                onClick={exitEditMode}
                className="px-3 py-1.5 text-gray-700 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="relative mb-4 flex">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-1 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search instructors by name, email, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-4 h-1" />
            </button>
          )}
        </div>
        
        {/* Bulk actions toolbar */}
        {isEditMode && selectedInstructors.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2 ml-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{selectedInstructors.length} instructors selected</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBulkActionType('reassign');
                  setShowBulkConfirmModal(true);
                }}
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
                className="bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-700 transition-all flex items-center gap-1.5"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto pr-3 flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#141a35]"></div>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 mb-2 opacity-20" />
                  <p className="text-center font-medium">No matching instructors found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <Users className="w-16 h-16 mb-2 opacity-20" />
                  <p className="text-center font-medium">No instructors found</p>
                  <p className="text-sm mt-1">Add instructors using the buttons above</p>
                </>
              )}
            </div>
          ) : (            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInstructors
                .sort((a, b) => {
                  // First sort by whether they have sections (assigned first)
                  if (Boolean(a.section) !== Boolean(b.section)) {
                    return Boolean(b.section) - Boolean(a.section);
                  }
                  // Then sort alphabetically by section
                  return (a.section || '').localeCompare((b.section || ''));
                })
                .map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isEditMode && (
                        <div 
                          className="mr-3 cursor-pointer"
                          onClick={() => toggleInstructorSelection(item.id)}
                        >
                          {selectedInstructors.includes(item.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      )}
                      <div className={`rounded-full p-2 mr-3 ${
                        item.section 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100'
                      }`}>
                        <UserCheck className={`w-6 h-6 ${
                          item.section 
                            ? 'text-blue-700' 
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#141a35]">{item.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3 h-3 mr-1" />
                          {item.email}
                        </div>
                        <div className="flex items-center mt-1.5">
                          {item.section ? (
                            <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                              {item.section}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isEditMode && (
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-2 rounded-full transition-colors ${
                            item.section === '' 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          onClick={() => openReassignModal(item)}
                          title={item.section === '' ? 'Assign Section' : 'Re-assign Section'}
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          onClick={() => { setInstructorToDelete(item); setShowDeleteModal(true); }}
                          title="Delete Account"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>      {/* Add Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#141a35]/10 p-2 rounded-full">
                <UserPlus className="h-6 w-6 text-[#141a35]" />
              </div>
              <h2 className="text-xl font-semibold text-[#141a35]">Add New Instructor</h2>
            </div>            <form onSubmit={createInstructor} className="space-y-5">
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
                  placeholder="instructor@example.com"
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
                  type="button"                  onClick={() => {
                    setShowModal(false);
                    setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
                    setPasswordMismatch(false);
                    setPasswordError('');
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
                  Create Instructor
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
            <p className="text-gray-600">Instructor account has been created successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 px-6 py-2.5 bg-[#141a35] text-white rounded-lg hover:bg-[#1f274d] transition-colors duration-200 font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}      {/* Reassign Section Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 p-2 rounded-full">
                <Edit3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedInstructor?.section ? 'Reassign Section' : 'Assign Section'}
              </h3>
            </div>
            
            {selectedInstructor && (
              <div className="bg-gray-50 rounded-lg p-3 mb-5 flex items-center">
                <UserCheck className="h-5 w-5 text-[#141a35] mr-2" />
                <div>
                  <p className="font-medium text-gray-800">{selectedInstructor.name}</p>
                  <p className="text-sm text-gray-500">{selectedInstructor.email}</p>
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
                    {selectedInstructor?.section && (
                      <option value="__unassign__" className="font-medium">Unassign Current Section</option>
                    )}
                  </select>
                  {selectedInstructor?.section && selectedSection === '' && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Current section: {selectedInstructor.section}
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
      )}      {/* Delete Instructor Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-xl shadow-xl w-full max-w-md animate-fade-scale">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-2 max-w-xs">
                Are you sure you want to delete this instructor account? This action cannot be undone.
              </p>
              {instructorToDelete && (
                <div className="bg-gray-50 w-full rounded-lg p-3 my-3 text-left">
                  <p className="font-medium text-gray-800">{instructorToDelete.name}</p>
                  <p className="text-sm text-gray-500">{instructorToDelete.email}</p>
                  {instructorToDelete.section && (
                    <div className="mt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {instructorToDelete.section}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-4 w-full">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setInstructorToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInstructor}
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
            <p className="text-gray-600">Instructor account has been deleted successfully.</p>
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
              <h2 className="text-xl font-semibold text-gray-800">Bulk Upload Instructors</h2>
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
                  Upload CSV with columns: FirstName, LastName, Email, Password, Section (optional, will be created if doesn't exist), Role
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
                  : 'Reassign Instructors'}
              </h3>
              <p className="text-gray-600 mb-4">
                {bulkActionType === 'delete' 
                  ? `Are you sure you want to delete ${selectedInstructors.length} selected instructors? This action cannot be undone.`
                  : `Select a section to assign for ${selectedInstructors.length} instructors:`}
              </p>

              {bulkActionType === 'reassign' && (
                <div className="w-full mb-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-blue-500">Loading sections...</span>
                    </div>
                  ) : (
                    <select
                      value={bulkReassignSection}
                      onChange={(e) => setBulkReassignSection(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="">-- Select Section --</option>
                      {availableSections.map((section, idx) => (
                        <option key={idx} value={section}>{section}</option>
                      ))}
                      <option value="__unassign__" className="font-medium text-orange-600">
                        Remove from current section
                      </option>
                    </select>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Note: Only one instructor can be assigned to a section.
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

export default ViewInstructorPage;
