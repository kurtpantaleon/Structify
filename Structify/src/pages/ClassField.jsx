import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Header from '../components/ProfileHeader ';
import { useAuth } from '../context/authContextProvider';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';


const ClassField = () => {
    const [activeTab, setActiveTab] = useState('lessons');
    const [lessons, setLessons] = useState([]);
    const [activities, setActivities] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const section = location.state?.section;
    const { currentUser, role } = useAuth();
    const [editingLesson, setEditingLesson] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', week: '', text: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!section) {
                setError('No section selected. Please select a section first.');
                setLoading(false);
                return;
            }

            console.log('Fetching data for section:', section); // Debug log
            setLoading(true);
            setError(null);
            try {
                // Fetch lessons
                const lessonsQuery = query(collection(db, 'lessons'), where('section', '==', section));
                const lessonsSnap = await getDocs(lessonsQuery);
                const lessonsData = lessonsSnap.docs.map(doc => {
                    const data = doc.data();
                    console.log('Lesson data:', { id: doc.id, ...data }); // Debug log for each lesson
                    return { id: doc.id, ...data };
                });
                console.log('All fetched lessons:', lessonsData); // Debug log
                setLessons(lessonsData);

                // Fetch activities
                const activitiesQuery = query(collection(db, 'activities'), where('section', '==', section));
                const activitiesSnap = await getDocs(activitiesQuery);
                setActivities(activitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch quizzes
                const quizzesQuery = query(collection(db, 'quizzes'), where('section', '==', section));
                const quizzesSnap = await getDocs(quizzesQuery);
                setQuizzes(quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error('Error fetching data:', err); // Debug log
                setError('Failed to fetch class materials.');
            }
            setLoading(false);
        };
        fetchData();
    }, [section]);

    // Debug log for rendered lessons
    useEffect(() => {
        if (lessons.length > 0) {
            console.log('Current lessons state:', lessons);
        }
    }, [lessons]);

    // Update delete handler
    const handleDeleteClick = (lesson) => {
        setLessonToDelete(lesson);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'lessons', lessonToDelete.id));
            setLessons(prev => prev.filter(lesson => lesson.id !== lessonToDelete.id));
            setShowDeleteModal(false);
            setLessonToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Error deleting lesson:', err);
            setError('Failed to delete lesson. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setLessonToDelete(null);
    };

    // Edit lesson
    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setEditForm({
            title: lesson.title,
            description: lesson.description,
            week: lesson.week,
            text: lesson.text || ''
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const lessonRef = doc(db, 'lessons', editingLesson.id);
            
            // Prepare update data
            const updateData = {
                title: editForm.title,
                description: editForm.description,
                week: editForm.week,
                text: editForm.text,
                lastUpdated: serverTimestamp(), // Add last updated timestamp
            };

            // Update the lesson document
            await updateDoc(lessonRef, updateData);
            
            // Update local state
            setLessons(prev => prev.map(l => 
                l.id === editingLesson.id 
                ? { 
                    ...l, 
                    ...updateData,
                    lastUpdated: new Date().toISOString() // Use current time for immediate UI update
                  } 
                : l
            ));
            
            // Clear edit state
            setEditingLesson(null);
            setEditForm({ title: '', description: '', week: '', text: '' });
            setError(null);
        } catch (err) {
            console.error('Error updating lesson:', err);
            setError('Failed to update lesson. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-blue-100 min-h-screen">
            <Header />
            {/* Exit Button */}
            <div className="flex justify-end m-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition duration-200"
>
                    <X className="w-6 h-6 text-white" />
                </button>
            </div>
            <div className="max-w-7xl mx-auto mt-6 bg-white p-6 rounded-lg shadow h-[75vh] overflow-y-auto">
                <h1 className="text-3xl font-bold mb-6">Class Materials</h1>
                <div className="mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'lessons' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('lessons')}
                        >
                            Lessons
                        </button>
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('activities')}
                        >
                            Activities
                        </button>
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'quizzes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('quizzes')}
                        >
                            Quizzes
                        </button>
                    </div>
                </div>
                {loading && <div>Loading...</div>}
                {error && <div className="text-red-600 mb-4">{error}</div>}
                {/* Lessons Tab */}
                {activeTab === 'lessons' && !loading && (
                    <div>
                        {lessons.length === 0 ? (
                            <div className="text-gray-500">No lessons available.</div>
                        ) : (
                            lessons.map(lesson => (
                                <div key={lesson.id} className="mb-6 p-4 bg-white rounded shadow relative">
                                    {/* Instructor-only controls - positioned on the right */}
                                    {currentUser?.uid === lesson.instructorId && role === 'instructor' && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1 text-sm"
                                                onClick={() => handleDeleteClick(lesson)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                            <button
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1 text-sm"
                                                onClick={() => handleEditLesson(lesson)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold mb-2 pr-24">{lesson.title}</h2>
                                    <div className="text-gray-700 mb-2">{lesson.description}</div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Week:</span> {lesson.week}
                                    </div>
                                    {lesson.media && lesson.media.length > 0 && (
                                        <div className="mb-2">
                                            <span className="font-semibold">Files:</span>
                                            <ul className="list-disc ml-6">
                                                {lesson.media.map((file, idx) => (
                                                    <li key={idx}>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{file.name}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {lesson.text && (
                                        <div className="mt-2 text-gray-800 whitespace-pre-line">{lesson.text}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
                {/* Edit Modal */}
                {editingLesson && (
                    <>
                        {/* Blurred transparent overlay */}
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"></div>
                        {/* Slide-in modal on the right */}
                        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transition-transform duration-300 transform translate-x-0 flex flex-col">
                            <div className="p-6 flex-1 overflow-y-auto">
                                <h2 className="text-xl font-bold mb-4">Edit Lesson</h2>
                                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input type="text" name="title" value={editForm.title} onChange={handleEditFormChange} className="w-full border px-2 py-1 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea name="description" value={editForm.description} onChange={handleEditFormChange} className="w-full border px-2 py-1 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Week</label>
                                        <input type="text" name="week" value={editForm.week} onChange={handleEditFormChange} className="w-full border px-2 py-1 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Text</label>
                                        <textarea name="text" value={editForm.text} onChange={handleEditFormChange} className="w-full border px-2 py-1 rounded" />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            type="button" 
                                            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition-colors duration-200"
                                            onClick={() => setEditingLesson(null)}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
                {/* Activities Tab */}
                {activeTab === 'activities' && !loading && (
                    <div>
                        {activities.length === 0 ? (
                            <div className="text-gray-500">No activities available.</div>
                        ) : (
                            activities.map(activity => (
                                <div key={activity.id} className="mb-6 p-4 bg-white rounded shadow">
                                    <h2 className="text-xl font-bold mb-2">{activity.title}</h2>
                                    <div className="text-gray-700 mb-2">{activity.description}</div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Week:</span> {activity.week}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Type:</span> {activity.type}
                                    </div>
                                    {activity.questions && activity.questions.length > 0 && (
                                        <div className="mt-2">
                                            <span className="font-semibold">Questions:</span>
                                            <ul className="list-decimal ml-6">
                                                {activity.questions.map((q, idx) => (
                                                    <li key={idx} className="mb-2">
                                                        <div className="font-medium">{q.question}</div>
                                                        <div className="text-sm text-gray-600">Type: {q.type} | Points: {q.points}</div>
                                                        {q.type === 'multiple-choice' && q.options && (
                                                            <ul className="list-disc ml-6">
                                                                {q.options.map((opt, i) => (
                                                                    <li key={i}>{opt}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {q.type === 'true-false' && (
                                                            <div className="text-sm">Correct Answer: {q.correctAnswer}</div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && !loading && (
                    <div>
                        {quizzes.length === 0 ? (
                            <div className="text-gray-500">No quizzes available.</div>
                        ) : (
                            quizzes.map(quiz => (
                                <div key={quiz.id} className="mb-6 p-4 bg-white rounded shadow">
                                    <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
                                    <div className="text-gray-700 mb-2">{quiz.description}</div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Week:</span> {quiz.week}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">Time Limit:</span> {quiz.timeLimit} minutes
                                    </div>
                                    {quiz.questions && quiz.questions.length > 0 && (
                                        <div className="mt-2">
                                            <span className="font-semibold">Questions:</span>
                                            <ul className="list-decimal ml-6">
                                                {quiz.questions.map((q, idx) => (
                                                    <li key={idx} className="mb-2">
                                                        <div className="font-medium">{q.question}</div>
                                                        <div className="text-sm text-gray-600">Type: {q.type} | Points: {q.points}</div>
                                                        {q.type === 'multiple-choice' && q.options && (
                                                            <ul className="list-disc ml-6">
                                                                {q.options.map((opt, i) => (
                                                                    <li key={i}>{opt}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {q.type === 'true-false' && (
                                                            <div className="text-sm">Correct Answer: {q.correctAnswer}</div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold mb-4">Delete Lesson</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200 flex items-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClassField;