import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Header from '../components/ProfileHeader ';
import { useAuth } from '../context/authContextProvider';
import { X, Book, Activity, FileQuestion, Clock, Calendar, Edit3, Trash2, Save, ExternalLink, Download, BarChart2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertOctagon, Info } from 'lucide-react';

const ClassField = () => {
    const [activeTab, setActiveTab] = useState('lessons');
    const [lessons, setLessons] = useState([]);
    const [activities, setActivities] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [scores, setScores] = useState({ quizzes: [], activities: [] });
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
    const [expandedItems, setExpandedItems] = useState({ activities: {}, quizzes: {} });
    const [studentProgress, setStudentProgress] = useState({
        completedQuizzes: [],
        completedActivities: [],
        quizScores: {},
        activityScores: {},
    });
    const [questionToEdit, setQuestionToEdit] = useState(null);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [questionType, setQuestionType] = useState(null); // 'activity' or 'quiz'
    const [questionParentId, setQuestionParentId] = useState(null);
    const [questionEditForm, setQuestionEditForm] = useState({
        question: '',
        type: '',
        points: 1,
        options: [],
        correctAnswer: ''
    });
    const [activityToDelete, setActivityToDelete] = useState(null);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [isDeletingItem, setIsDeletingItem] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'success', // success, error, info
    });

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

                // Fetch scores
                const quizScoresQuery = query(
                    collection(db, 'quiz_submissions'),
                    where('section', '==', section)
                );
                const quizScoresSnap = await getDocs(quizScoresQuery);
                const quizScores = quizScoresSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const activityScoresQuery = query(
                    collection(db, 'activity_submissions'),
                    where('section', '==', section)
                );
                const activityScoresSnap = await getDocs(activityScoresQuery);
                const activityScores = activityScoresSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setScores({
                    quizzes: quizScores,
                    activities: activityScores
                });

                // If the user is a student, fetch their progress data
                if (role === 'student' && currentUser) {
                    await fetchStudentProgress(currentUser.uid);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [section, currentUser, role]);
    
    // Function to fetch student progress data
    const fetchStudentProgress = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setStudentProgress({
                    completedQuizzes: userData.completedQuizzes || [],
                    completedActivities: userData.completedActivities || [],
                    quizScores: userData.activityScores || {},
                    activityScores: userData.activityScores || {},
                });
            }
        } catch (error) {
            console.error('Error fetching student progress:', error);
        }
    };

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
            showToast(`Lesson "${lessonToDelete.title}" has been deleted successfully`, 'success');
        } catch (err) {
            console.error('Error deleting lesson:', err);
            setError('Failed to delete lesson. Please try again.');
            showToast('Failed to delete lesson. Please try again.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // Cancel delete operation
    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setLessonToDelete(null);
    };

    // Handle student quiz click
    const handleQuizClick = (quiz) => {
        if (role === 'student') {
            navigate(`/quiz/${quiz.id}`);
        }
    };    // Handle student activity click
    const handleActivityClick = (activity) => {
        if (role === 'student') {
            // Check if it's a code activity or a regular activity
            if (activity.type === 'code') {
                navigate(`/coding-activity/${activity.id}`);
            } else {
                navigate(`/activity/${activity.id}`);
            }
        }
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
            showToast(`Lesson "${updateData.title}" has been updated successfully`, 'success');
        } catch (err) {
            console.error('Error updating lesson:', err);
            setError('Failed to update lesson. Please try again.');
            showToast('Failed to update lesson. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };    // Function to handle file opening
    const handleOpenFile = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    
    // Function to handle file download
    const handleDownloadFile = async (url, name) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Failed to download file. Please try again.');
        }
    };

    // Toggle expanded state for an item
    const toggleExpanded = (type, id) => {
        setExpandedItems(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [id]: !prev[type][id]
            }
        }));
    };

    // Handle editing a question
    const handleEditQuestion = (type, parentId, question, index) => {
        setQuestionType(type);
        setQuestionParentId(parentId);
        setQuestionToEdit({...question, index});
        setQuestionEditForm({
            question: question.question,
            type: question.type,
            points: question.points || 1,
            options: question.options || [],
            correctAnswer: question.correctAnswer || ''
        });
    };
    
    // Handle deleting a question
    const handleDeleteQuestion = (type, parentId, questionIndex) => {
        setQuestionType(type);
        setQuestionParentId(parentId);
        setQuestionToDelete({ index: questionIndex });
    };
    
    // Confirm question deletion
    const handleDeleteQuestionConfirm = async () => {
        if (!questionType || !questionParentId || questionToDelete === null) return;
        
        try {
            const docRef = doc(db, questionType === 'activity' ? 'activities' : 'quizzes', questionParentId);
            const currentDoc = questionType === 'activity' 
                ? activities.find(a => a.id === questionParentId)
                : quizzes.find(q => q.id === questionParentId);
                
            if (!currentDoc) return;
            
            const updatedQuestions = [...currentDoc.questions];
            const deletedQuestion = updatedQuestions[questionToDelete.index];
            updatedQuestions.splice(questionToDelete.index, 1);
            
            await updateDoc(docRef, {
                questions: updatedQuestions,
                lastUpdated: serverTimestamp()
            });
            
            // Update local state
            if (questionType === 'activity') {
                setActivities(prev => prev.map(item => 
                    item.id === questionParentId 
                        ? {...item, questions: updatedQuestions, lastUpdated: new Date().toISOString()}
                        : item
                ));
            } else {
                setQuizzes(prev => prev.map(item => 
                    item.id === questionParentId 
                        ? {...item, questions: updatedQuestions, lastUpdated: new Date().toISOString()}
                        : item
                ));
            }
            
            setQuestionToDelete(null);
            showToast(`Question has been deleted successfully`, 'success');
        } catch (err) {
            console.error('Error deleting question:', err);
            setError('Failed to delete question. Please try again.');
            showToast('Failed to delete question. Please try again.', 'error');
        }
    };


    
    // Handle question edit form changes
    const handleQuestionFormChange = (e) => {
        const { name, value } = e.target;
        setQuestionEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Handle option changes for multiple choice questions
    const handleOptionChange = (index, value) => {
        const newOptions = [...questionEditForm.options];
        newOptions[index] = value;
        setQuestionEditForm(prev => ({
            ...prev,
            options: newOptions
        }));
    };
    
    // Add a new option to multiple choice question
    const addOption = () => {
        setQuestionEditForm(prev => ({
            ...prev,
            options: [...prev.options, '']
        }));
    };
    
    // Remove an option from multiple choice question
    const removeOption = (index) => {
        const newOptions = [...questionEditForm.options];
        newOptions.splice(index, 1);
        setQuestionEditForm(prev => ({
            ...prev,
            options: newOptions
        }));
    };
    
    // Submit question edit form
    const handleQuestionEditSubmit = async (e) => {
        e.preventDefault();
        if (!questionType || !questionParentId || !questionToEdit) return;
        
        try {
            const docRef = doc(db, questionType === 'activity' ? 'activities' : 'quizzes', questionParentId);
            const currentDoc = questionType === 'activity' 
                ? activities.find(a => a.id === questionParentId)
                : quizzes.find(q => q.id === questionParentId);
                
            if (!currentDoc) return;
            
            const updatedQuestions = [...currentDoc.questions];
            updatedQuestions[questionToEdit.index] = {
                question: questionEditForm.question,
                type: questionEditForm.type,
                points: Number(questionEditForm.points) || 1,
                options: questionEditForm.options,
                correctAnswer: questionEditForm.correctAnswer
            };
            
            await updateDoc(docRef, {
                questions: updatedQuestions,
                lastUpdated: serverTimestamp()
            });
            
            // Update local state
            if (questionType === 'activity') {
                setActivities(prev => prev.map(item => 
                    item.id === questionParentId 
                        ? {...item, questions: updatedQuestions, lastUpdated: new Date().toISOString()}
                        : item
                ));
            } else {
                setQuizzes(prev => prev.map(item => 
                    item.id === questionParentId 
                        ? {...item, questions: updatedQuestions, lastUpdated: new Date().toISOString()}
                        : item
                ));
            }
            
            setQuestionToEdit(null);
            showToast('Question has been updated successfully', 'success');
        } catch (err) {
            console.error('Error updating question:', err);
            setError('Failed to update question. Please try again.');
            showToast('Failed to update question. Please try again.', 'error');
        }
    };

    // Handle deleting an activity
    const handleDeleteActivity = (activity) => {
        setActivityToDelete(activity);
    };

    // Handle deleting a quiz
    const handleDeleteQuiz = (quiz) => {
        setQuizToDelete(quiz);
    };

    // Cancel activity deletion
    const handleCancelActivityDelete = () => {
        setActivityToDelete(null);
    };

    // Cancel quiz deletion
    const handleCancelQuizDelete = () => {
        setQuizToDelete(null);
    };

    // Confirm activity deletion
    const handleConfirmActivityDelete = async () => {
        if (!activityToDelete) return;
        
        setIsDeletingItem(true);
        try {
            await deleteDoc(doc(db, 'activities', activityToDelete.id));
            setActivities(prev => prev.filter(activity => activity.id !== activityToDelete.id));
            setActivityToDelete(null);
            setError(null);
            showToast(`Activity "${activityToDelete.title}" has been deleted successfully`, 'success');
        } catch (err) {
            console.error('Error deleting activity:', err);
            setError('Failed to delete activity. Please try again.');
            showToast('Failed to delete activity. Please try again.', 'error');
        } finally {
            setIsDeletingItem(false);
        }
    };

    // Confirm quiz deletion
    const handleConfirmQuizDelete = async () => {
        if (!quizToDelete) return;
        
        setIsDeletingItem(true);
        try {
            await deleteDoc(doc(db, 'quizzes', quizToDelete.id));
            setQuizzes(prev => prev.filter(quiz => quiz.id !== quizToDelete.id));
            setQuizToDelete(null);
            setError(null);
            showToast(`Quiz "${quizToDelete.title}" has been deleted successfully`, 'success');
        } catch (err) {
            console.error('Error deleting quiz:', err);
            setError('Failed to delete quiz. Please try again.');
            showToast('Failed to delete quiz. Please try again.', 'error');
        } finally {
            setIsDeletingItem(false);
        }
    };

    // Toast notification function
    const showToast = (message, type = 'success') => {
        setToast({
            visible: true,
            message,
            type,
        });
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            setToast(prev => ({...prev, visible: false}));
        }, 3000);
    };
    
    // Hide toast manually
    const hideToast = () => {
        setToast(prev => ({...prev, visible: false}));
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
            
            {/* Toast Notification */}
            {toast.visible && (
                <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
                    toast.type === 'success' ? 'bg-green-500 text-white' :
                    toast.type === 'error' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                }`}>
                    {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                    {toast.type === 'error' && <AlertOctagon className="w-5 h-5" />}
                    {toast.type === 'info' && <Info className="w-5 h-5" />}
                    <div className="mr-8">{toast.message}</div>
                    <button 
                        onClick={hideToast} 
                        className="absolute top-1.5 right-1.5 text-white/80 hover:text-white"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto mt-2 px-4 sm:px-6">
                <div className="bg-white p-6 rounded-xl shadow-lg h-[75vh] overflow-hidden flex flex-col">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                        <span className="inline-block w-2 h-8 bg-blue-500 rounded mr-2"></span>
                        Class Uploads
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
                            <button
                                className={`flex items-center px-4 py-3 font-medium transition-all duration-200 ${
                                    activeTab === 'scores' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                                onClick={() => setActiveTab('scores')}
                            >
                                <BarChart2 className="w-4 h-4 mr-2" />
                                Scores
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
                                                                        <li key={idx} className="flex items-center justify-between">
                                                                            <div className="flex items-center">
                                                                                <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                                                </svg>
                                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                                            </div>
                                                                            <div className="flex gap-2">                                                                                <button 
                                                                                    onClick={() => handleOpenFile(file.url)}
                                                                                    className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                                                                                    title="Open file in new tab"
                                                                                >
                                                                                    <ExternalLink className="h-4 w-4" />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                                                                    className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                                                                                    title="Download file"
                                                                                >
                                                                                    <Download className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
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
                                                className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                                            >
                                                {/* Activity management buttons for instructors */}
                                                {role === 'instructor' && (
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1 text-sm"
                                                            onClick={() => handleDeleteActivity(activity)}
                                                            title="Delete activity"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex items-start">
                                                    <div className="bg-green-100 p-3 rounded-md mr-4">
                                                        <Activity className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <h2 className="text-xl font-bold mb-2 text-gray-800">{activity.title}</h2>
                                                            {role === 'student' && (
                                                                <button 
                                                                    onClick={() => handleActivityClick(activity)} 
                                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center"
                                                                >
                                                                    Start Activity
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                                            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                Week {activity.week}
                                                            </span>
                                                            <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full text-green-800">
                                                                {activity.type}
                                                            </span>
                                                            {studentProgress?.activityScores?.[`activity_${activity.id}`] && (
                                                                <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full text-green-800">
                                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                    Score: {studentProgress.activityScores[`activity_${activity.id}`]}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-gray-700 mb-3">{activity.description}</div>
                                                        
                                                        {activity.questions && activity.questions.length > 0 && role === 'instructor' && (
                                                            <div className="mt-4">
                                                                <button 
                                                                    onClick={() => toggleExpanded('activities', activity.id)}
                                                                    className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-md transition-colors text-gray-700 font-medium"
                                                                >
                                                                    <span>Questions ({activity.questions.length})</span>
                                                                    {expandedItems.activities?.[activity.id] ? (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                
                                                                {expandedItems.activities?.[activity.id] && (
                                                                    <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                                                        <ul className="space-y-4">
                                                                            {activity.questions.map((q, idx) => (
                                                                                <li key={idx} className="pb-3 border-b border-gray-200 last:border-0 relative">
                                                                                    {/* Question management buttons for instructors */}
                                                                                    {role === 'instructor' && (
                                                                                        <div className="absolute top-0 right-0 flex gap-1">
                                                                                            <button
                                                                                                className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded"
                                                                                                onClick={() => handleEditQuestion('activity', activity.id, q, idx)}
                                                                                                title="Edit question"
                                                                                            >
                                                                                                <Edit3 className="h-3.5 w-3.5" />
                                                                                            </button>
                                                                                            <button
                                                                                                className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                                                                                                onClick={() => handleDeleteQuestion('activity', activity.id, idx)}
                                                                                                title="Delete question"
                                                                                            >
                                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
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
                                                className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                                            >
                                                {/* Quiz management buttons for instructors */}
                                                {role === 'instructor' && (
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1 text-sm"
                                                            onClick={() => handleDeleteQuiz(quiz)}
                                                            title="Delete quiz"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex items-start">
                                                    <div className="bg-purple-100 p-3 rounded-md mr-4">
                                                        <FileQuestion className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <h2 className="text-xl font-bold mb-2 text-gray-800">{quiz.title}</h2>
                                                            {role === 'student' && (
                                                                <button 
                                                                    onClick={() => handleQuizClick(quiz)} 
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center"
                                                                >
                                                                    Start Quiz
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                                            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-800">
                                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                Week {quiz.week}
                                                            </span>
                                                            <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full text-red-800">
                                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                                {quiz.timeLimit} minutes
                                                            </span>
                                                            {studentProgress?.quizScores?.[`quiz_${quiz.id}`] && (
                                                                <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full text-green-800">
                                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                    Score: {studentProgress.quizScores[`quiz_${quiz.id}`]}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-gray-700 mb-3">{quiz.description}</div>
                                                        
                                                        {quiz.questions && quiz.questions.length > 0 && role === 'instructor' && (
                                                            <div className="mt-4">
                                                                <button 
                                                                    onClick={() => toggleExpanded('quizzes', quiz.id)}
                                                                    className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-md transition-colors text-gray-700 font-medium"
                                                                >
                                                                    <span>Questions ({quiz.questions.length})</span>
                                                                    {expandedItems.quizzes?.[quiz.id] ? (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                
                                                                {expandedItems.quizzes?.[quiz.id] && (
                                                                    <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                                                        <ul className="space-y-4">
                                                                            {quiz.questions.map((q, idx) => (
                                                                                <li key={idx} className="pb-3 border-b border-gray-200 last:border-0 relative">
                                                                                    {/* Question management buttons for instructors */}
                                                                                    {role === 'instructor' && (
                                                                                        <div className="absolute top-0 right-0 flex gap-1">
                                                                                            <button
                                                                                                className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded"
                                                                                                onClick={() => handleEditQuestion('quiz', quiz.id, q, idx)}
                                                                                                title="Edit question"
                                                                                            >
                                                                                                <Edit3 className="h-3.5 w-3.5" />
                                                                                            </button>
                                                                                            <button
                                                                                                className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                                                                                                onClick={() => handleDeleteQuestion('quiz', quiz.id, idx)}
                                                                                                title="Delete question"
                                                                                            >
                                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
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
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Scores Tab */}
                        {activeTab === 'scores' && !loading && (
                            <div>
                                {scores.quizzes.length === 0 && scores.activities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                        <BarChart2 className="w-12 h-12 mb-2 text-gray-300" />
                                        <p>No scores available yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Quiz Scores */}
                                        {scores.quizzes.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                    <FileQuestion className="w-5 h-5 mr-2 text-purple-600" />
                                                    Quiz Scores
                                                </h3>
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {scores.quizzes.map((score) => (
                                                                <tr key={score.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {score.studentName}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {score.quizTitle}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {score.score}%
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(score.submittedAt.seconds * 1000).toLocaleDateString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Activity Scores */}
                                        {scores.activities.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                                                    Activity Scores
                                                </h3>
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {scores.activities.map((score) => (
                                                                <tr key={score.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {score.studentName}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {score.activityTitle}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {score.score}%
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(score.submittedAt.seconds * 1000).toLocaleDateString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Enhanced Edit Modal with improved UI/UX and centered positioning */}
            {editingLesson && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={() => setEditingLesson(null)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white shadow-2xl rounded-xl max-w-4xl w-[95%] max-h-[90vh] transition-all duration-300 transform animate-scale-in flex flex-col overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 text-white flex justify-between items-center">
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                                    <Edit3 className="w-6 h-6 mr-3" />
                                    Edit Lesson
                                </h2>
                                <button 
                                    onClick={() => setEditingLesson(null)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 transition-colors p-2 rounded-full"
                                    aria-label="Close"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="p-8 flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                                <form onSubmit={handleEditFormSubmit} className="space-y-8 max-w-5xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 group">
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <span className="mr-2">Lesson Title</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded-full font-medium">Required</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    name="title" 
                                                    value={editForm.title} 
                                                    onChange={handleEditFormChange} 
                                                    className="w-full border border-gray-300 rounded-lg px-4 pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-base group-hover:border-blue-300" 
                                                    placeholder="Enter lesson title"
                                                    required 
                                                />
                                                <Book className="absolute top-3.5 left-3 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                        
                                        <div className="group">
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <span className="mr-2">Week Number</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded-full font-medium">Required</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    name="week" 
                                                    value={editForm.week} 
                                                    onChange={handleEditFormChange} 
                                                    className="w-full border border-gray-300 rounded-lg px-4 pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-base group-hover:border-blue-300" 
                                                    placeholder="e.g., 1, 2, 3..."
                                                    required 
                                                />
                                                <Calendar className="absolute top-3.5 left-3 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Modified</label>
                                            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-600 flex items-center">
                                                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                                                {editingLesson?.lastUpdated 
                                                    ? new Date(editingLesson.lastUpdated.seconds ? editingLesson.lastUpdated.seconds * 1000 : editingLesson.lastUpdated).toLocaleString()
                                                    : 'Not yet saved'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Description field with enhanced UI */}
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <span className="mr-2">Description</span>
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded-full font-medium">Required</span>
                                        </label>
                                        <div className="relative">
                                            <textarea 
                                                name="description" 
                                                value={editForm.description} 
                                                onChange={handleEditFormChange} 
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-base group-hover:border-blue-300 pl-10" 
                                                rows="4"
                                                placeholder="Briefly describe what this lesson is about..."
                                                required 
                                            />
                                            <span className="absolute top-3 left-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Provide a concise summary that explains what students will learn in this lesson.</p>
                                    </div>
                                    
                                    {/* Content field with enhanced UI */}
                                    <div className="group relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                                <span className="mr-2">Lesson Content</span>
                                                <div className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    Optional
                                                </div>
                                            </label>
                                            <div className="flex items-center text-xs text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Supports markdown formatting
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <div className="absolute top-0 right-0 flex bg-gray-50 border-l border-b border-gray-200 rounded-bl-md overflow-hidden">
                                                <button type="button" className="p-1.5 text-sm text-gray-500 hover:bg-gray-200" title="Bold">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h6m0 0H6m6 0V6m0 6v6" />
                                                    </svg>
                                                </button>
                                                <button type="button" className="p-1.5 text-sm text-gray-500 hover:bg-gray-200" title="Expand editor">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            <textarea 
                                                name="text" 
                                                value={editForm.text} 
                                                onChange={handleEditFormChange} 
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-base font-mono group-hover:border-blue-300" 
                                                rows="14"
                                                placeholder="# Lesson Content goes here..."
                                            />
                                        </div>
                                        
                                        <div className="mt-2 flex justify-between items-center">
                                            <p className="text-xs text-gray-500">Add detailed lesson content, examples, and explanations.</p>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <span>Characters: {editForm.text.length}</span>
                                                <span className="mx-2">|</span>
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Drag corner to resize
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="border-t border-gray-200 px-6 py-4 bg-white flex gap-4 justify-between md:justify-end shadow-inner">
                                <button 
                                    type="button" 
                                    className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-base hover:bg-gray-50"
                                    onClick={() => setEditingLesson(null)}
                                    disabled={isSaving}
                                >
                                    <X className="w-5 h-5" />
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleEditFormSubmit}
                                    className={`${isSaving 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} 
                                    text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg text-base`}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Enhanced Delete Confirmation Modal */}
            {showDeleteModal && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={handleDeleteCancel}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-scale-in">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white">
                                <div className="flex items-center">
                                    <div className="bg-white/20 rounded-full p-2.5 mr-4">
                                        <Trash2 className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Delete Lesson</h3>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <p className="text-gray-700 mb-4 text-lg">
                                    Are you sure you want to delete <span className="font-semibold">"{lessonToDelete?.title}"</span>?
                                </p>
                                <p className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border-l-4 border-red-400 mb-6">
                                    <strong>Warning:</strong> This action cannot be undone. All content associated with this lesson will be permanently removed.
                                </p>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleDeleteCancel}
                                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className={`${isDeleting 
                                            ? 'bg-red-400' 
                                            : 'bg-red-600 hover:bg-red-700'} 
                                        px-5 py-2.5 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            
            {/* Question Edit Modal */}
            {questionToEdit && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={() => setQuestionToEdit(null)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white shadow-2xl rounded-xl max-w-3xl w-[95%] max-h-[90vh] transition-all duration-300 transform animate-scale-in flex flex-col overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Edit3 className="w-5 h-5 mr-2" />
                                    Edit Question
                                </h2>
                                <button 
                                    onClick={() => setQuestionToEdit(null)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 transition-colors p-2 rounded-full"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 flex-1 overflow-y-auto">
                                <form onSubmit={handleQuestionEditSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question Text
                                        </label>
                                        <textarea 
                                            name="question"
                                            value={questionEditForm.question}
                                            onChange={handleQuestionFormChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Question Type
                                            </label>
                                            <select
                                                name="type"
                                                value={questionEditForm.type}
                                                onChange={handleQuestionFormChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="multiple-choice">Multiple Choice</option>
                                                <option value="true-false">True/False</option>
                                                <option value="short-answer">Short Answer</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Points
                                            </label>
                                            <input 
                                                type="number"
                                                name="points"
                                                value={questionEditForm.points}
                                                onChange={handleQuestionFormChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    {questionEditForm.type === 'multiple-choice' && (
                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-medium text-gray-700">Options</h3>
                                                <button 
                                                    type="button" 
                                                    onClick={addOption}
                                                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    Add Option
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {questionEditForm.options.map((option, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full text-xs font-medium">
                                                            {String.fromCharCode(65 + index)}
                                                        </span>
                                                        <input 
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                                            className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                            required
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
                                                            title="Remove option"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                
                                                {questionEditForm.options.length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">Click "Add Option" to add answer choices</p>
                                                )}
                                            </div>
                                            
                                            {questionEditForm.options.length > 0 && (
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Correct Answer
                                                    </label>
                                                    <select
                                                        name="correctAnswer"
                                                        value={questionEditForm.correctAnswer}
                                                        onChange={handleQuestionFormChange}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">Select Correct Answer</option>
                                                        {questionEditForm.options.map((option, index) => (
                                                            <option key={index} value={option}>
                                                                {String.fromCharCode(65 + index)}: {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {questionEditForm.type === 'true-false' && (
                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Correct Answer
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        value="True"
                                                        checked={questionEditForm.correctAnswer === "True"}
                                                        onChange={handleQuestionFormChange}
                                                        className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2">True</span>
                                                </label>
                                                
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        value="False"
                                                        checked={questionEditForm.correctAnswer === "False"}
                                                        onChange={handleQuestionFormChange}
                                                        className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2">False</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                            
                            <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setQuestionToEdit(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleQuestionEditSubmit}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Question Delete Confirmation Modal */}
            {questionToDelete && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={() => setQuestionToDelete(null)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white shadow-xl rounded-lg max-w-sm w-full transition-all duration-300 transform animate-scale-in">
                            <div className="bg-red-500 p-4 text-white flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                <h3 className="text-lg font-semibold">Delete Question</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 mb-6">
                                    Are you sure you want to delete this question? This action cannot be undone.
                                </p>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setQuestionToDelete(null)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteQuestionConfirm}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Activity Delete Confirmation Modal */}
            {activityToDelete && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={handleCancelActivityDelete}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-scale-in">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white">
                                <div className="flex items-center">
                                    <div className="bg-white/20 rounded-full p-2.5 mr-4">
                                        <Trash2 className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Delete Activity</h3>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <p className="text-gray-700 mb-4 text-lg">
                                    Are you sure you want to delete <span className="font-semibold">"{activityToDelete.title}"</span>?
                                </p>
                                <p className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border-l-4 border-red-400 mb-6">
                                    <strong>Warning:</strong> This action cannot be undone. All associated questions and student submissions will be permanently removed.
                                </p>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleCancelActivityDelete}
                                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                                        disabled={isDeletingItem}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmActivityDelete}
                                        className={`${isDeletingItem 
                                            ? 'bg-red-400 cursor-not-allowed' 
                                            : 'bg-red-600 hover:bg-red-700'} 
                                        px-5 py-2.5 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                                        disabled={isDeletingItem}
                                    >
                                        {isDeletingItem ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            
            {/* Quiz Delete Confirmation Modal */}
            {quizToDelete && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={handleCancelQuizDelete}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-scale-in">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white">
                                <div className="flex items-center">
                                    <div className="bg-white/20 rounded-full p-2.5 mr-4">
                                        <Trash2 className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Delete Quiz</h3>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <p className="text-gray-700 mb-4 text-lg">
                                    Are you sure you want to delete <span className="font-semibold">"{quizToDelete.title}"</span>?
                                </p>
                                <p className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border-l-4 border-red-400 mb-6">
                                    <strong>Warning:</strong> This action cannot be undone. All associated questions and student submissions will be permanently removed.
                                </p>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleCancelQuizDelete}
                                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                                        disabled={isDeletingItem}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmQuizDelete}
                                        className={`${isDeletingItem 
                                            ? 'bg-red-400 cursor-not-allowed' 
                                            : 'bg-red-600 hover:bg-red-700'} 
                                        px-5 py-2.5 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium`}
                                        disabled={isDeletingItem}
                                    >
                                        {isDeletingItem ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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