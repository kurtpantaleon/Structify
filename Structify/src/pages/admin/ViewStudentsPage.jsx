import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

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
  });

  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        section: '',
        role: 'student',
      });

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

      const studentsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'student'))
      );
      const usedSections = studentsSnapshot.docs.map((doc) => doc.data().section);

      const available = classList.filter(
        (section) => section === student.section || !usedSections.includes(section)
      );

      setAvailableSections(available);
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

      await setDoc(doc(db, 'users', selectedStudent.id), {
        ...selectedStudent,
        section: newSection,
      });

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Students" />
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
            Add Student
          </button>
        </div>

        <div className="overflow-y-scroll pr-2 space-y-6">
          {Object.entries(groupedBySection).sort(([a], [b]) => a.localeCompare(b)).map(([section, studentsInSection], index) => (
            <div key={index} className="mb-2">
              <h3 className="text-2xl font-bold text-[#141a35] mb-2 border-b pb-1">{section}</h3>
              {studentsInSection.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-[#141a35] text-base">{student.name}</span>
                  <div className="flex items-center gap-3">
                    <button
                      className="text-sm font-medium text-blue-700 hover:underline cursor-pointer"
                      onClick={() => openReassignModal(student)}
                    >
                      {student.section === '' ? 'Assign Section' : 'Re-assign Section'}
                    </button>
                    <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer">
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
              <p className="text-sm text-gray-600">No available sections.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewStudentsPage;
