import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

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

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => doc.data());
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        name,
        role: 'instructor',
        section: ''
      });

      setInstructors((prev) => [...prev, { email, name, role: 'instructor', section: '' }]);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setShowModal(false);
      setShowSuccessModal(true); // 🎉 Show success modal
    } catch (error) {
      console.error('Error creating instructor:', error.message);
      alert('Error: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Instructors"
      />
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
          {instructors.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1 border-b"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#141a35]">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">{item.section}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm font-medium text-blue-700 hover:underline cursor-pointer">
                  Re-assign Section
                </button>
                <button className="text-sm font-medium text-red-500 hover:underline cursor-pointer">
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
                <p className="text-sm font-medium text-red-500 mt-1">
                  Passwords do not match.
                </p>
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
    </div>
  );
}

export default ViewInstructorPage;
