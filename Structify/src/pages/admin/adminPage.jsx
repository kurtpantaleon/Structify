import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import Confetti from 'react-confetti';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/AdminNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function Badge({ text }) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg animate-pulse select-none z-50 font-semibold tracking-wide flex items-center space-x-2">
      <span className="text-xl">🔥</span>
      <span>{text}</span>
    </div>
  );
}

function Modal({ children, onClose, title, small = false }) {
  return (
    <div
      className="fixed inset-0 bg-[#1e2a5e]/90 flex justify-center items-center z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative p-6 rounded-xl shadow-xl w-full max-w-${small ? 'sm' : 'md'} bg-gradient-to-tr from-blue-800 to-blue-900 animated-border`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInScale 0.3s ease forwards' }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ModalButtons({ onCancel, onConfirm, confirmText, confirmClass }) {
  return (
    <div className="flex justify-end space-x-4 mt-6">
      <button
        onClick={onCancel}
        className="relative overflow-hidden px-5 py-2 rounded font-semibold shadow-md transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 bg-blue-700 hover:bg-blue-800 text-white"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className={`relative overflow-hidden px-5 py-2 rounded font-semibold shadow-md transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 text-white ${confirmClass}`}
      >
        {confirmText}
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedSection, setEditedSection] = useState(null);
  const [editedName, setEditedName] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const [affectedUsers, setAffectedUsers] = useState({ students: 0, instructor: null });
  const [deleteStudents, setDeleteStudents] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [badgeText, setBadgeText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'classes'));
        const classData = classSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
              studentCount,
            };
          })
        );

        updatedSections.sort((a, b) => a.sectionName.localeCompare(b.sectionName));
        setSections(updatedSections);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, []);

  const triggerSuccess = (text) => {
    setBadgeText(text);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      setBadgeText('');
    }, 3000);
  };

  const handleAddClass = async () => {
    if (newClassName.trim() === '') {
      alert('Please enter a class name');
      return;
    }
    const newSection = {
      sectionName: newClassName,
      instructor: 'TBA',
      studentCount: 0,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'classes'), newSection);
      setSections([...sections, { id: docRef.id, ...newSection }]);
      setIsPopupOpen(false);
      setNewClassName('');
      triggerSuccess('Class Added!');
    } catch (error) {
      console.error('Error adding class: ', error);
    }
  };

  const handleEditSection = (section) => {
    setEditedSection(section);
    setEditedName(section.sectionName);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedSection || editedName.trim() === '') return;
    try {
      const sectionRef = doc(db, 'classes', editedSection.id);
      await updateDoc(sectionRef, { sectionName: editedName });

      setSections((prev) =>
        prev.map((sec) => (sec.id === editedSection.id ? { ...sec, sectionName: editedName } : sec))
      );
      setIsEditModalOpen(false);
      setEditedSection(null);
      setEditedName('');
      triggerSuccess('Section Edited!');
    } catch (error) {
      console.error('Error updating section name:', error);
    }
  };

  const handleDeleteSection = async (section) => {
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
        getDocs(instructorQuery),
      ]);

      setAffectedUsers({
        students: studentSnapshot.size,
        instructor: instructorSnapshot.docs[0]?.data()?.name || null,
      });
    } catch (error) {
      console.error('Error checking affected users:', error);
    }

    setSectionToDelete(section);
    setShowDeleteModal(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;

    try {
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
        getDocs(instructorsQuery),
      ]);

      const studentUpdates = deleteStudents
        ? studentSnapshot.docs.map((doc) => deleteDoc(doc.ref))
        : studentSnapshot.docs.map((doc) => updateDoc(doc.ref, { section: '' }));

      const instructorUpdates = instructorSnapshot.docs.map((doc) =>
        updateDoc(doc.ref, { section: '' })
      );

      await Promise.all([
        ...studentUpdates,
        ...instructorUpdates,
        deleteDoc(doc(db, 'classes', sectionToDelete.id)),
      ]);

      setSections((prev) => prev.filter((s) => s.id !== sectionToDelete.id));
      setShowDeleteModal(false);
      setSectionToDelete(null);
      setAffectedUsers({ students: 0, instructor: null });
      setDeleteStudents(false);
      triggerSuccess('Section Deleted!');
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section.');
    }
  };

  return (
    <div className="min-h-screen relative font-sans bg-gradient-to-br from-blue-900 to-blue-700 overflow-hidden text-white flex flex-col">
      {/* Crystal animated background */}
      <div className="fixed inset-0 pointer-events-none crystal-bg -z-10" />

      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Class" />
      {isNavOpen && (
        <div className="w-20 border-r border-blue-700 bg-blue-800 shadow-lg animated-border">
          <AdminNavigationBar />
        </div>
      )}

      <main className="w-mx-auto mt-7 p-6 rounded-2xl shadow-2xl flex-grow relative bg-gradient-to-tr from-blue-800 to-blue-900 animated-border">
        <div className="flex justify-end pb-3">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="relative overflow-hidden px-4 py-2 rounded-md font-semibold shadow-lg bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition-transform duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_5px_rgba(34,197,94,0.8)]"
          >
            Add Class
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => navigate('/ViewClassPage', { state: { section } })}
              className="relative cursor-pointer rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.04] hover:shadow-[0_0_25px_8px_rgba(59,130,246,0.75)] animated-border"
            >
              <div className="absolute inset-0 pointer-events-none shimmer-overlay rounded-xl" />
              <div className="p-5 space-y-2 relative z-10">
                <h3 className="text-white font-semibold text-lg">{section.sectionName}</h3>
                <p className="text-blue-200 text-sm">Instructor: {section.instructor}</p>
                <p className="text-blue-200 text-sm">Students: {section.studentCount}</p>
              </div>

              <div className="absolute top-3 right-3 flex flex-col space-y-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSection(section);
                  }}
                  className="p-1 rounded bg-blue-600/70 hover:bg-blue-700 transition-colors text-white"
                  aria-label="Edit Section"
                >
                  &#9998;
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSection(section);
                  }}
                  className="p-1 rounded bg-red-600/70 hover:bg-red-700 transition-colors text-white"
                  aria-label="Delete Section"
                >
                  &#128465;
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Class Modal */}
      {isPopupOpen && (
        <Modal onClose={() => setIsPopupOpen(false)} title="Add Class" small>
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Enter Class Name"
            className="w-full border border-green-400 rounded px-3 py-2 bg-blue-900 text-white font-semibold"
            autoFocus
          />
          <ModalButtons
            onCancel={() => setIsPopupOpen(false)}
            onConfirm={handleAddClass}
            confirmText="Add"
            confirmClass="bg-green-600 hover:bg-green-700"
          />
        </Modal>
      )}

      {/* Edit Section Modal */}
      {isEditModalOpen && (
        <Modal onClose={() => setIsEditModalOpen(false)} title="Edit Section Name" small>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full border border-green-400 rounded px-3 py-2 bg-blue-900 text-white font-semibold"
            autoFocus
          />
          <ModalButtons
            onCancel={() => setIsEditModalOpen(false)}
            onConfirm={handleSaveEdit}
            confirmText="Save"
            confirmClass="bg-green-600 hover:bg-green-700"
          />
        </Modal>
      )}

      {/* Delete Section Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Delete Section" small>
          <p className="text-white mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-orange-400">{sectionToDelete?.sectionName}</span>?
          </p>
          {(affectedUsers.students > 0 || affectedUsers.instructor) && (
            <div className="bg-orange-400 bg-opacity-20 border border-orange-400 rounded-md p-3 mb-4 text-orange-400 text-sm">
              <p className="font-semibold mb-1">Warning: This will affect:</p>
              <ul className="list-disc list-inside">
                {affectedUsers.students > 0 && (
                  <li>
                    {affectedUsers.students} student
                    {affectedUsers.students !== 1 ? 's' : ''} will be{' '}
                    {deleteStudents ? 'deleted' : 'unassigned'}
                  </li>
                )}
                {affectedUsers.instructor && (
                  <li>Instructor {affectedUsers.instructor} will be unassigned</li>
                )}
              </ul>
              {affectedUsers.students > 0 && (
                <label className="flex items-center mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteStudents}
                    onChange={(e) => setDeleteStudents(e.target.checked)}
                    className="h-4 w-4 text-orange-400 rounded border-blue-800 focus:ring-orange-400"
                  />
                  <span className="ml-2 text-orange-400 text-sm">Also delete student accounts</span>
                </label>
              )}
            </div>
          )}
          <ModalButtons
            onCancel={() => {
              setShowDeleteModal(false);
              setSectionToDelete(null);
              setAffectedUsers({ students: 0, instructor: null });
              setDeleteStudents(false);
            }}
            onConfirm={confirmDeleteSection}
            confirmText="Delete"
            confirmClass="bg-orange-400 hover:bg-orange-500"
          />
        </Modal>
      )}

      {badgeText && <Badge text={badgeText} />}
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
      )}

      {/* Animations keyframes */}
      <style>{`
        /* Animated glowing moving border */
        .animated-border {
          position: relative;
          border-radius: 1rem;
          z-index: 0;
          padding: 4px; /* for border space */
        }
        .animated-border::before {
          content: '';
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 4px;
          background: linear-gradient(270deg, #3b82f6, #2563eb, #3b82f6, #2563eb);
          background-size: 600% 600%;
          animation: borderShift 10s linear infinite;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          z-index: -1;
        }
        @keyframes borderShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        /* Shimmer effect for crystal card */
        .shimmer-overlay {
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.15) 20%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.15) 80%
          );
          background-size: 200% 200%;
          animation: shimmerMove 3s ease-in-out infinite;
          border-radius: inherit;
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes shimmerMove {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
}
