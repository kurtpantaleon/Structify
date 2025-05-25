import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import LessonForm from './LessonForm';
import ActivityForm from './ActivityForm';
import QuizForm from './QuizForm';
import useFileUpload from './useFileUpload';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { BookOpen, FileText, HelpCircle, Plus, Loader, CheckCircle, AlertCircle, X, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddLessonMaterials = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('lessons');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Lesson state
    const [lessonContent, setLessonContent] = useState({
        title: '',
        description: '',
        media: [],
        text: '',
        week: '',
        section: currentUser?.section || ''
    });

    // Activity state
    const [activityContent, setActivityContent] = useState({
        title: '',
        description: '',
        type: 'form',
        questions: [],
        week: '',
        section: currentUser?.section || ''
    });

    // Quiz state
    const [quizContent, setQuizContent] = useState({
        title: '',
        description: '',
        timeLimit: 30,
        questions: [],
        week: '',
        section: currentUser?.section || ''
    });

    // Question builder state
    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
    });

    // File upload hook
    const { handleFileUpload, uploadProgress, error, success, setError, setSuccess } = useFileUpload();

    const storage = getStorage();

    // Scores state
    const [scoresData, setScoresData] = useState({
        quizzes: [],
        activities: []
    });
    const [isLoadingScores, setIsLoadingScores] = useState(false);

    // Add question handler
    const handleAddQuestion = () => {
        if (activeTab === 'activities') {
            setActivityContent(prev => ({
                ...prev,
                questions: [...prev.questions, { ...currentQuestion }]
            }));
        } else if (activeTab === 'quizzes') {
            setQuizContent(prev => ({
                ...prev,
                questions: [...prev.questions, { ...currentQuestion }]
            }));
        }
        setCurrentQuestion({
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 1
        });
    };

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };
 
    // Lesson submit with enhanced feedback
    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!lessonContent.title.trim()) {
                throw new Error('Title is required');
            }
            
            await addDoc(collection(db, 'lessons'), {
                ...lessonContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });
            
            showNotification('success', 'Lesson created successfully!');
            setLessonContent({
                title: '',
                description: '',
                media: [],
                text: '',
                week: '',
                section: currentUser?.section || ''
            });
        } catch (error) {
            showNotification('error', error.message || 'Failed to create lesson');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Activity submit with enhanced feedback
    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!activityContent.title.trim()) {
                throw new Error('Title is required');
            }
            
            if (activityContent.questions.length === 0) {
                throw new Error('Add at least one question');
            }
            
            await addDoc(collection(db, 'activities'), {
                ...activityContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });
            
            showNotification('success', 'Activity created successfully!');
            setActivityContent({
                title: '',
                description: '',
                type: 'form',
                questions: [],
                week: '',
                section: currentUser?.section || ''
            });
        } catch (error) {
            showNotification('error', error.message || 'Failed to create activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quiz submit with enhanced feedback
    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        try {
            if (!quizContent.title.trim()) {
                throw new Error('Title is required');
            }
            
            if (quizContent.questions.length === 0) {
                throw new Error('Add at least one question');
            }
            
            await addDoc(collection(db, 'quizzes'), {
                ...quizContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });
            
            showNotification('success', 'Quiz created successfully!');
            setQuizContent({
                title: '',
                description: '',
                timeLimit: 30,
                questions: [],
                week: '',
                section: currentUser?.section || ''
            });
        } catch (error) {
            showNotification('error', error.message || 'Failed to create quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    // File upload handler for lessons
    const handleLessonFileUpload = (e, type) => {
        handleFileUpload(e, type, (fileObj) => {
            setLessonContent(prev => ({
                ...prev,
                media: [...prev.media, fileObj]
            }));
        });
    };

    // Delete file handler
    const handleDeleteLessonFile = async (file) => {
        // Remove from state
        setLessonContent(prev => ({
            ...prev,
            media: prev.media.filter(f => f.url !== file.url)
        }));
        // Remove from Firebase Storage
        try {
            // Extract the path from the URL
            // Example: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/lesson%2Fsection%2Ffilename?alt=media
            const url = new URL(file.url);
            const pathMatch = decodeURIComponent(url.pathname).match(/\/o\/(.+)$/);
            let filePath = '';
            if (pathMatch && pathMatch[1]) {
                filePath = pathMatch[1].split('?')[0];
            } else if (file.publicId) {
                filePath = file.publicId;
            } else {
                // fallback: try to reconstruct from known structure
                filePath = `lesson/${file.section || ''}/${file.name}`;
            }
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
        } catch (err) {
            // Optionally show an error message
            setError('Failed to delete file from storage.');
        }
    };

    // Fetch scores data
    const fetchScores = async () => {
        setIsLoadingScores(true);
        try {
            // Fetch quiz scores
            const quizScoresQuery = query(
                collection(db, 'quiz_submissions'),
                where('instructorId', '==', currentUser.uid)
            );
            const quizScoresSnapshot = await getDocs(quizScoresQuery);
            const quizScores = quizScoresSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch activity scores
            const activityScoresQuery = query(
                collection(db, 'activity_submissions'),
                where('instructorId', '==', currentUser.uid)
            );
            const activityScoresSnapshot = await getDocs(activityScoresQuery);
            const activityScores = activityScoresSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setScoresData({
                quizzes: quizScores,
                activities: activityScores
            });
        } catch (error) {
            showNotification('error', 'Failed to fetch scores');
        } finally {
            setIsLoadingScores(false);
        }
    };

    // Fetch scores when scores tab is active
    useEffect(() => {
        if (activeTab === 'scores') {
            fetchScores();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <Header />
            <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Add Learning Materials" />
            
            <div className="flex">
                {isNavOpen && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '220px', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r border-white/20 bg-[#141a35] h-[calc(100vh-120px)]"
                    >
                        <AdminNavigationBar />
                    </motion.div>
                )}
                
                <div className="flex-grow px-4 md:px-8">
                    <div className="max-w-6xl mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Elegant notification */}
                        <AnimatePresence>
                            {notification.show && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`fixed top-20 right-8 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
                                        notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 
                                        'bg-red-50 border-l-4 border-red-500'
                                    }`}
                                >
                                    {notification.type === 'success' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : (
                                        <AlertCircle className="text-red-500" size={20} />
                                    )}
                                    <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                                        {notification.message}
                                    </span>
                                    <button
                                        onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                                        className="ml-auto text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Enhanced tabs */}
                        <div className="bg-gray-50 border-b border-gray-200">
                            <div className="flex space-x-1 p-2">
                                <button
                                    className={`px-4 py-3 rounded-t-lg flex items-center space-x-2 font-medium transition-all ${
                                        activeTab === 'lessons' ? 
                                        'bg-white text-blue-600 shadow-sm border-t border-r border-l border-gray-200' : 
                                        'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setActiveTab('lessons')}
                                >
                                    <BookOpen size={18} />
                                    <span>Lessons</span>
                                </button>
                                <button
                                    className={`px-4 py-3 rounded-t-lg flex items-center space-x-2 font-medium transition-all ${
                                        activeTab === 'activities' ? 
                                        'bg-white text-purple-600 shadow-sm border-t border-r border-l border-gray-200' : 
                                        'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setActiveTab('activities')}
                                >
                                    <FileText size={18} />
                                    <span>Activities</span>
                                </button>
                                <button
                                    className={`px-4 py-3 rounded-t-lg flex items-center space-x-2 font-medium transition-all ${
                                        activeTab === 'quizzes' ? 
                                        'bg-white text-green-600 shadow-sm border-t border-r border-l border-gray-200' : 
                                        'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setActiveTab('quizzes')}
                                >
                                    <HelpCircle size={18} />
                                    <span>Quizzes</span>
                                </button>
                                <button
                                    className={`px-4 py-3 rounded-t-lg flex items-center space-x-2 font-medium transition-all ${
                                        activeTab === 'scores' ? 
                                        'bg-white text-orange-600 shadow-sm border-t border-r border-l border-gray-200' : 
                                        'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setActiveTab('scores')}
                                >
                                    <BarChart2 size={18} />
                                    <span>Scores</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Tab content area */}
                        <div className="p-6 h-[calc(100vh-280px)] overflow-y-auto">
                            {/* Error/Success messages */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center">
                                    <AlertCircle className="mr-2" size={20} />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-center">
                                    <CheckCircle className="mr-2" size={20} />
                                    <span>{success}</span>
                                </div>
                            )}
                            
                            {/* Dynamic content description */}
                            <div className="mb-6">
                                <h2 className={`text-2xl font-bold ${
                                    activeTab === 'lessons' ? 'text-blue-700' : 
                                    activeTab === 'activities' ? 'text-purple-700' : 
                                    activeTab === 'quizzes' ? 'text-green-700' :
                                    'text-orange-700'
                                }`}>
                                    {activeTab === 'lessons' ? 'Create New Lesson' : 
                                    activeTab === 'activities' ? 'Create New Activity' : 
                                    activeTab === 'quizzes' ? 'Create New Quiz' :
                                    'View Scores & Results'}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {activeTab === 'lessons' ? 'Add lesson content, media, and resources for your students.' : 
                                    activeTab === 'activities' ? 'Create interactive activities for skill practice.' : 
                                    activeTab === 'quizzes' ? 'Build assessments to test student knowledge.' :
                                    'Monitor student performance and track progress.'}
                                </p>
                            </div>
                            
                            {/* Tab content with animations */}
                            <AnimatePresence mode="wait">
                                {activeTab === 'lessons' && (
                                    <motion.div
                                        key="lessons"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <LessonForm
                                            lessonContent={lessonContent}
                                            setLessonContent={setLessonContent}
                                            handleFileUpload={handleLessonFileUpload}
                                            handleLessonSubmit={handleLessonSubmit}
                                            uploadProgress={uploadProgress}
                                            onDeleteFile={handleDeleteLessonFile}
                                            isSubmitting={isSubmitting}
                                        />
                                    </motion.div>
                                )}
                                {activeTab === 'activities' && (
                                    <motion.div
                                        key="activities"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <ActivityForm
                                            activityContent={activityContent}
                                            setActivityContent={setActivityContent}
                                            currentQuestion={currentQuestion}
                                            setCurrentQuestion={setCurrentQuestion}
                                            handleAddQuestion={handleAddQuestion}
                                            handleActivitySubmit={handleActivitySubmit}
                                            isSubmitting={isSubmitting}
                                        />
                                    </motion.div>
                                )}
                                {activeTab === 'quizzes' && (
                                    <motion.div
                                        key="quizzes"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <QuizForm
                                            quizContent={quizContent}
                                            setQuizContent={setQuizContent}
                                            currentQuestion={currentQuestion}
                                            setCurrentQuestion={setCurrentQuestion}
                                            handleAddQuestion={handleAddQuestion}
                                            handleQuizSubmit={handleQuizSubmit}
                                            isSubmitting={isSubmitting}
                                        />
                                    </motion.div>
                                )}
                                {activeTab === 'scores' && (
                                    <motion.div
                                        key="scores"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {isLoadingScores ? (
                                            <div className="flex items-center justify-center h-64">
                                                <Loader className="animate-spin text-orange-600" size={32} />
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Quiz Scores Section */}
                                                <div className="bg-white rounded-lg shadow p-6">
                                                    <h3 className="text-xl font-semibold text-green-700 mb-4">Quiz Results</h3>
                                                    {scoresData.quizzes.length === 0 ? (
                                                        <p className="text-gray-500">No quiz submissions yet.</p>
                                                    ) : (
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {scoresData.quizzes.map((quiz) => (
                                                                        <tr key={quiz.id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap">{quiz.studentName}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">{quiz.quizTitle}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">{quiz.score}%</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                {new Date(quiz.submittedAt?.toDate()).toLocaleDateString()}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Activity Scores Section */}
                                                <div className="bg-white rounded-lg shadow p-6">
                                                    <h3 className="text-xl font-semibold text-purple-700 mb-4">Activity Results</h3>
                                                    {scoresData.activities.length === 0 ? (
                                                        <p className="text-gray-500">No activity submissions yet.</p>
                                                    ) : (
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Title</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {scoresData.activities.map((activity) => (
                                                                        <tr key={activity.id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap">{activity.studentName}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">{activity.activityTitle}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                                    activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                                                    activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                                                                                    'bg-gray-100 text-gray-800'
                                                                                }`}>
                                                                                    {activity.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                {new Date(activity.submittedAt?.toDate()).toLocaleDateString()}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Submit button footer */}
                            {activeTab !== 'scores' && (
                                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => {
                                            if (activeTab === 'lessons') {
                                                document.getElementById('lesson-form').requestSubmit();
                                            } else if (activeTab === 'activities') {
                                                document.getElementById('activity-form').requestSubmit();
                                            } else {
                                                document.getElementById('quiz-form').requestSubmit();
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        className={`px-6 py-3 rounded-lg font-medium text-white flex items-center space-x-2 ${
                                            activeTab === 'lessons' ? 'bg-blue-600 hover:bg-blue-700' : 
                                            activeTab === 'activities' ? 'bg-purple-600 hover:bg-purple-700' : 
                                            'bg-green-600 hover:bg-green-700'
                                        } disabled:opacity-70 transition-all duration-200`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="animate-spin" size={18} />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                <span>{`Create ${
                                                    activeTab === 'lessons' ? 'Lesson' : 
                                                    activeTab === 'activities' ? 'Activity' : 'Quiz'
                                                }`}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Quick help section */}
                    <div className="max-w-6xl mx-auto mt-6 mb-10">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                            <div className="flex items-start">
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                    <HelpCircle size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Creating {activeTab} tips:</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-1 text-blue-700">
                                        {activeTab === 'lessons' && (
                                            <>
                                                <li>Include clear and concise lesson objectives</li>
                                                <li>Upload relevant resources (PDFs, images, videos)</li>
                                                <li>Format text using the rich text editor</li>
                                                <li>Specify the week number for proper sequencing</li>
                                            </>
                                        )}
                                        {activeTab === 'activities' && (
                                            <>
                                                <li>Define clear instructions in the description</li>
                                                <li>Create a variety of question types for engagement</li>
                                                <li>Preview questions before adding them to the activity</li>
                                                <li>Ensure activities align with lesson content</li>
                                            </>
                                        )}
                                        {activeTab === 'quizzes' && (
                                            <>
                                                <li>Set an appropriate time limit based on question count</li>
                                                <li>Include a mix of difficulty levels</li>
                                                <li>Assign appropriate point values to questions</li>
                                                <li>Create clear and unambiguous question text</li>
                                            </>
                                        )}
                                        {activeTab === 'scores' && (
                                            <>
                                                <li>Monitor student performance across all assessments</li>
                                                <li>Track completion rates for activities</li>
                                                <li>Identify areas where students may need additional support</li>
                                                <li>Use the data to improve future lessons and activities</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLessonMaterials;