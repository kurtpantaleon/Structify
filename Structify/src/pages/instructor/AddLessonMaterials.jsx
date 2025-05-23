import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

const AddLessonMaterials = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('lessons');

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

    // Lesson submit
    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await addDoc(collection(db, 'lessons'), {
                ...lessonContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });
            setSuccess('Lesson created successfully!');
            setLessonContent({
                title: '',
                description: '',
                media: [],
                text: '',
                week: '',
                section: currentUser?.section || ''
            });
        } catch (error) {
            setError('Failed to create lesson');
        }
    };

    // Activity submit
    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await addDoc(collection(db, 'activities'), {
                ...activityContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });
            setSuccess('Activity created successfully!');
            setActivityContent({
                title: '',
                description: '',
                type: 'form',
                questions: [],
                week: '',
                section: currentUser?.section || ''
            });
        } catch (error) {
            setError('Failed to create activity');
        }
    };

    // Quiz submit
    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await addDoc(collection(db, 'quizzes'), {
                ...quizContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });
            setSuccess('Quiz created successfully!');
            setQuizContent({
                title: '',
                description: '',
                timeLimit: 30,
                questions: [],
                week: '',
                section: currentUser?.section || ''
            });
        } catch (error) {
            setError('Failed to create quiz');
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

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Add Lesson Materials" />
            {isNavOpen && (
                <div className="w-20 border-r border-white/20 bg-[#141a35]">
                    <AdminNavigationBar />
                </div>
            )}
            <div className="max-w-7xl mx-auto mt-6 bg-white p-6 rounded-lg shadow h-[75vh] overflow-y-auto">
                {/* Tabs */}
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
                {/* Error/Success messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}
                {/* Tab content */}
                {activeTab === 'lessons' && (
                    <LessonForm
                        lessonContent={lessonContent}
                        setLessonContent={setLessonContent}
                        handleFileUpload={handleLessonFileUpload}
                        handleLessonSubmit={handleLessonSubmit}
                        uploadProgress={uploadProgress}
                        onDeleteFile={handleDeleteLessonFile}
                    />
                )}
                {activeTab === 'activities' && (
                    <ActivityForm
                        activityContent={activityContent}
                        setActivityContent={setActivityContent}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        handleAddQuestion={handleAddQuestion}
                        handleActivitySubmit={handleActivitySubmit}
                    />
                )}
                {activeTab === 'quizzes' && (
                    <QuizForm
                        quizContent={quizContent}
                        setQuizContent={setQuizContent}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        handleAddQuestion={handleAddQuestion}
                        handleQuizSubmit={handleQuizSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default AddLessonMaterials;