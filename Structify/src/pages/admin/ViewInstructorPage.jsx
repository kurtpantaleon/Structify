import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';
import { deleteDoc } from 'firebase/firestore';

function ViewInstructorPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInstructors(data);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };

    fetchInstructors();
  }, []);

  const createInstructor = async (e) => {
    e.preventDefault();

    const { email, password, confirmPassword, name } = formData;
    if (!email || !password || !name || !confirmPassword) {
      alert('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    } else {
      setPasswordMismatch(false);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await secondaryAuth.signOut(); // Prevent session memory bloat

      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        name,
        role: 'instructor',
        section: '',
      });

      setInstructors((prev) => [...prev, { email, name, role: 'instructor', section: '' }]);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
  
      await setDoc(doc(db, 'users', selectedInstructor.id), {
        ...selectedInstructor,
        section: newSection,
      });
  
      const updated = instructors.map((inst) =>
        inst.id === selectedInstructor.id
          ? { ...inst, section: newSection }
          : inst
      );
  
      setInstructors(updated);
      setReassignModalOpen(false);
      setSelectedInstructor(null);
      setSelectedSection('');
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };  

  const handleDeleteInstructor = async () => {
    if (!instructorToDelete) return;
  
    try {
      await deleteDoc(doc(db, 'users', instructorToDelete.id));
      setInstructors((prev) => prev.filter((i) => i.id !== instructorToDelete.id));
      setShowDeleteModal(false);
      setInstructorToDelete(null);
      setShowDeleteSuccessModal(true); // Show modal instead of alert
    } catch (error) {
      console.error('Error deleting instructor:', error);
      alert('Failed to delete instructor.');
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
      )}

      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
          >
            Add Instructor
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
          {[...instructors].sort((a, b) => a.section.localeCompare(b.section)).map((item, index) => (
            <div key={index} className="flex items-center justify-between py-1 border-b">
              <div>
                <h3 className="text-lg font-semibold text-[#141a35]">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.section || 'Unassigned'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="text-sm font-medium text-blue-700 hover:underline cursor-pointer"
                  onClick={() => openReassignModal(item)}
                >
                  {item.section === '' ? 'Assign Section' : 'Re-assign Section'}
                </button>
                <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer" onClick={() => { setInstructorToDelete(item); setShowDeleteModal(true); }}>
                  Delete Account
                </button>
              </div>
            </div>
          ))}
          {instructors.length === 0 && (
            <p className="text-center text-sm text-gray-500">No instructors found.</p>
          )}
        </div>
      </div>

      {/* Add Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-[#141a35]">Add New Instructor</h2>
            <form onSubmit={createInstructor} className="space-y-4">
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
            <p className="text-gray-700">Instructor account has been created successfully!</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-[#141a35] text-white rounded hover:bg-[#1f274d]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Reassign Section Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-6 py-5 rounded-lg shadow-md w-full max-w-sm">
            <h3 className="text-lg font-bold text-[#141a35] mb-3">Re-assign Section</h3>
            {availableSections.length > 0 ? (
              <>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                >
                  <option value="">Select Section</option>
                  {availableSections.map((section, idx) => (
                    <option key={idx} value={section}>{section}</option>
                  ))}
                  {selectedInstructor?.section && (
                    <option value="__unassign__" className="text-red-600">Unassign Section</option>
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

      {/* Delete Instructor Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white px-6 py-5 rounded-lg shadow-md w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-[#141a35] mb-2">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-medium">{instructorToDelete?.name}</span>'s account?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInstructorToDelete(null);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInstructor}
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
            <p className="text-gray-700">Instructor account has been deleted successfully!</p>
            <button
              onClick={() => setShowDeleteSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-[#141a35] text-white rounded hover:bg-[#1f274d]"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ViewInstructorPage;
