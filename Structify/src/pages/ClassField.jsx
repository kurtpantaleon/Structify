import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Header from '../components/ProfileHeader ';
import { useAuth } from '../context/authContextProvider';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { X, Book, Activity, FileQuestion, Clock, Calendar, Edit3, Trash2, Save } from 'lucide-react';


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
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
            <Header />
            {/* Exit Button with improved styling */}
            <div className="flex justify-end m-4 md:m-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2.5 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    aria-label="Return to previous page"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>
            <div className="max-w-7xl mx-auto mt-2 px-4 sm:px-6">
                <div className="bg-white p-6 rounded-xl shadow-lg h-[75vh] overflow-hidden flex flex-col">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                        <span className="inline-block w-2 h-8 bg-blue-500 rounded mr-2"></span>
                        Class Materials
                        {section && (
                            <span className="text-lg bg-blue-100 text-blue-700 py-1 px-3 rounded-full ml-2">
                                {section}
                            </span>
                        )}
                    </h1>
                    
                    {/* Improved tab navigation */}
                    <div className="mb-6">
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`flex items-center px-4 py-3 font-medium transition-all duration-200 ${
                                    activeTab === 'lessons' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                                onClick={() => setActiveTab('lessons')}
                            >
                                <Book className="w-4 h-4 mr-2" />
                                Lessons {lessons.length > 0 && <span className="ml-2 bg-blue-100 text-blue-600 rounded-full px-2 text-xs">{lessons.length}</span>}
                            </button>
                            <button
                                className={`flex items-center px-4 py-3 font-medium transition-all duration-200 ${
                                    activeTab === 'activities' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                                onClick={() => setActiveTab('activities')}
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                Activities {activities.length > 0 && <span className="ml-2 bg-blue-100 text-blue-600 rounded-full px-2 text-xs">{activities.length}</span>}
                            </button>
                            <button
                                className={`flex items-center px-4 py-3 font-medium transition-all duration-200 ${
                                    activeTab === 'quizzes' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                                onClick={() => setActiveTab('quizzes')}
                            >
                                <FileQuestion className="w-4 h-4 mr-2" />
                                Quizzes {quizzes.length > 0 && <span className="ml-2 bg-blue-100 text-blue-600 rounded-full px-2 text-xs">{quizzes.length}</span>}
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}
                    
                    {/* Content container with overflow */}
                    <div className="overflow-y-auto flex-1 pr-2">
                        {/* Lessons Tab */}
                        {activeTab === 'lessons' && !loading && (
                            <div>
                                {lessons.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                        <Book className="w-12 h-12 mb-2 text-gray-300" />
                                        <p>No lessons available.</p>
                                        {role === 'instructor' && (
                                            <button 
                                                onClick={() => navigate('/add-lesson', { state: { section } })}
                                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                                            >
                                                Add New Lesson
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {lessons.map(lesson => (
                                            <div 
                                                key={lesson.id} 
                                                className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                                            >
                                                {/* Instructor-only controls */}
                                                {currentUser?.uid === lesson.instructorId && role === 'instructor' && (
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1 text-sm"
                                                            onClick={() => handleDeleteClick(lesson)}
                                                            title="Delete lesson"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </button>
                                                        <button
                                                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1 text-sm"
                                                            onClick={() => handleEditLesson(lesson)}
                                                            title="Edit lesson"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-start">
                                                    <div className="bg-blue-100 p-3 rounded-md mr-4">
                                                        <Book className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 pr-16">
                                                        <h2 className="text-xl font-bold mb-2 text-gray-800">{lesson.title}</h2>
                                                        
                                                        <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                                            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                Week {lesson.week}
                                                            </span>
                                                            {lesson.lastUpdated && (
                                                                <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                                                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                                                    Updated: {new Date(lesson.lastUpdated.seconds ? lesson.lastUpdated.seconds * 1000 : lesson.lastUpdated).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-gray-700 mb-3">{lesson.description}</div>
                                                        
                                                        {lesson.media && lesson.media.length > 0 && (
                                                            <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                                                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Attachments:</h4>
                                                                <ul className="space-y-1">
                                                                    {lesson.media.map((file, idx) => (
                                                                        <li key={idx} className="flex items-center">
                                                                            <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">{file.name}</a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        {lesson.text && (
                                                            <div className="mt-3 text-gray-800 whitespace-pre-line border-t border-gray-100 pt-3 text-sm">{lesson.text}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Activities Tab */}
                        {activeTab === 'activities' && !loading && (
                            <div>
                                {activities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                        <Activity className="w-12 h-12 mb-2 text-gray-300" />
                                        <p>No activities available.</p>
                                        {role === 'instructor' && (
                                            <button 
                                                onClick={() => navigate('/add-activity', { state: { section } })}
                                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                                            >
                                                Add New Activity
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {activities.map(activity => (
                                            <div 
                                                key={activity.id} 
                                                className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                                            >
                                                <div className="flex items-start">
                                                    <div className="bg-green-100 p-3 rounded-md mr-4">
                                                        <Activity className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold mb-2 text-gray-800">{activity.title}</h2>
                                                        
                                                        <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                                            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                Week {activity.week}
                                                            </span>
                                                            <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full text-green-800">
                                                                {activity.type}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="text-gray-700 mb-3">{activity.description}</div>
                                                        
                                                        {activity.questions && activity.questions.length > 0 && (
                                                            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                                                <h4 className="font-semibold text-gray-700 mb-3">Questions ({activity.questions.length})</h4>
                                                                <ul className="space-y-4">
                                                                    {activity.questions.map((q, idx) => (
                                                                        <li key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                                                                            <div className="font-medium mb-1">{idx + 1}. {q.question}</div>
                                                                            <div className="flex space-x-2 text-xs mb-2">
                                                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                                                    Type: {q.type}
                                                                                </span>
                                                                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                                                    Points: {q.points}
                                                                                </span>
                                                                            </div>
                                                                            {q.type === 'multiple-choice' && q.options && (
                                                                                <ul className="text-sm ml-4 mt-1 space-y-1">
                                                                                    {q.options.map((opt, i) => (
                                                                                        <li key={i} className="flex items-center">
                                                                                            <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full mr-2 text-xs">
                                                                                                {String.fromCharCode(65 + i)}
                                                                                            </span>
                                                                                            {opt}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                            {q.type === 'true-false' && (
                                                                                <div className="text-sm ml-4 text-gray-700">
                                                                                    Correct Answer: <span className="font-medium">{q.correctAnswer}</span>
                                                                                </div>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Quizzes Tab */}
                        {activeTab === 'quizzes' && !loading && (
                            <div>
                                {quizzes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                        <FileQuestion className="w-12 h-12 mb-2 text-gray-300" />
                                        <p>No quizzes available.</p>
                                        {role === 'instructor' && (
                                            <button 
                                                onClick={() => navigate('/add-quiz', { state: { section } })}
                                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                                            >
                                                Add New Quiz
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {quizzes.map(quiz => (
                                            <div 
                                                key={quiz.id} 
                                                className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                                            >
                                                <div className="flex items-start">
                                                    <div className="bg-purple-100 p-3 rounded-md mr-4">
                                                        <FileQuestion className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold mb-2 text-gray-800">{quiz.title}</h2>
                                                        
                                                        <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                                            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                Week {quiz.week}
                                                            </span>
                                                            <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full text-red-800">
                                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                                {quiz.timeLimit} minutes
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="text-gray-700 mb-3">{quiz.description}</div>
                                                        
                                                        {quiz.questions && quiz.questions.length > 0 && (
                                                            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                                                <h4 className="font-semibold text-gray-700 mb-3">Questions ({quiz.questions.length})</h4>
                                                                <ul className="space-y-4">
                                                                    {quiz.questions.map((q, idx) => (
                                                                        <li key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                                                                            <div className="font-medium mb-1">{idx + 1}. {q.question}</div>
                                                                            <div className="flex space-x-2 text-xs mb-2">
                                                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                                                    Type: {q.type}
                                                                                </span>
                                                                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                                                    Points: {q.points}
                                                                                </span>
                                                                            </div>
                                                                            {q.type === 'multiple-choice' && q.options && (
                                                                                <ul className="text-sm ml-4 mt-1 space-y-1">
                                                                                    {q.options.map((opt, i) => (
                                                                                        <li key={i} className="flex items-center">
                                                                                            <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full mr-2 text-xs">
                                                                                                {String.fromCharCode(65 + i)}
                                                                                            </span>
                                                                                            {opt}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                            {q.type === 'true-false' && (
                                                                                <div className="text-sm ml-4 text-gray-700">
                                                                                    Correct Answer: <span className="font-medium">{q.correctAnswer}</span>
                                                                                </div>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Edit Modal with improved UI */}
            {editingLesson && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"></div>
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 transform translate-x-0 flex flex-col overflow-hidden">
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center">
                                <Edit3 className="w-5 h-5 mr-2" />
                                Edit Lesson
                            </h2>
                            <button 
                                onClick={() => setEditingLesson(null)}
                                className="text-white hover:text-blue-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto">
                            <form onSubmit={handleEditFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={editForm.title} 
                                        onChange={handleEditFormChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        value={editForm.description} 
                                        onChange={handleEditFormChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        rows="3" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                                    <input 
                                        type="text" 
                                        name="week" 
                                        value={editForm.week} 
                                        onChange={handleEditFormChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea 
                                        name="text" 
                                        value={editForm.text} 
                                        onChange={handleEditFormChange} 
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        rows="6"
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 justify-end">
                            <button 
                                type="button" 
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                                onClick={() => setEditingLesson(null)}
                                disabled={isSaving}
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button 
                                onClick={handleEditFormSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
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
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
            
            {/* Delete Confirmation Modal with improved UI */}
            {showDeleteModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
                            <div className="bg-red-50 p-4 border-b border-red-100">
                                <div className="flex items-center">
                                    <div className="bg-red-100 rounded-full p-2 mr-3">
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Lesson</h3>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to delete <span className="font-semibold">"{lessonToDelete?.title}"</span>?
                                </p>
                                <p className="text-sm text-red-600 mb-6">
                                    This action cannot be undone.
                                </p>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleDeleteCancel}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm"
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2 text-sm"
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
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete Permanently
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClassField;