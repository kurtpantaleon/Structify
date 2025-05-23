import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';

const AddLessonMaterials = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const storage = getStorage();
    const [activeTab, setActiveTab] = useState('lessons');
    const [lessonFiles, setLessonFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);

    const [lessonContent, setLessonContent] = useState({
        title: '',
        description: '',
        media: [],
        text: '',
        week: '',
        section: currentUser?.section || ''
    });

    const [activityContent, setActivityContent] = useState({
        title: '',
        description: '',
        type: 'form',
        questions: [],
        week: '',
        section: currentUser?.section || ''
    });

    const [quizContent, setQuizContent] = useState({
        title: '',
        description: '',
        timeLimit: 30,
        questions: [],
        week: '',
        section: currentUser?.section || ''
    });

    // Question builder states
    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
    });

    const handleFileUpload = async (event, type) => {
        const files = Array.from(event.target.files);
        setError(null);
        
        for (const file of files) {
            try {
                // Create a unique filename to prevent collisions
                const timestamp = Date.now();
                const uniqueFilename = `${timestamp}_${file.name}`;
                const fileRef = ref(storage, `${type}/${currentUser.section}/${uniqueFilename}`);
                
                // Add metadata to the file
                const metadata = {
                    contentType: file.type,
                    customMetadata: {
                        uploadedBy: currentUser.uid,
                        section: currentUser.section,
                        uploadDate: new Date().toISOString()
                    }
                };

                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: 0
                }));

                // Upload the file with metadata and CORS headers
                const uploadTask = uploadBytesResumable(fileRef, file, metadata);
                
                // Add upload progress tracking
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(prev => ({
                            ...prev,
                            [file.name]: progress
                        }));
                    },
                    (error) => {
                        console.error('Error uploading file:', error);
                        let errorMessage = `Failed to upload ${file.name}`;
                        
                        if (error.code === 'storage/unauthorized') {
                            errorMessage = 'You are not authorized to upload files. Please check your permissions.';
                        } else if (error.code === 'storage/canceled') {
                            errorMessage = 'Upload was canceled.';
                        } else if (error.code === 'storage/unknown') {
                            errorMessage = 'An unknown error occurred. Please try again.';
                        } else if (error.code === 'storage/cors') {
                            errorMessage = 'CORS error occurred. Please try again.';
                        }
                        
                        setError(errorMessage);
                    },
                    async () => {
                        // Upload completed successfully
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        if (type === 'lesson') {
                            setLessonContent(prev => ({
                                ...prev,
                                media: [...prev.media, {
                                    name: file.name,
                                    type: file.type,
                                    url: downloadURL,
                                    size: file.size,
                                    uploadDate: new Date().toISOString()
                                }]
                            }));
                        }

                        setUploadProgress(prev => ({
                            ...prev,
                            [file.name]: 100
                        }));

                        setSuccess(`Successfully uploaded ${file.name}`);
                    }
                );
            } catch (error) {
                console.error('Error uploading file:', error);
                setError(`Failed to upload ${file.name}: ${error.message}`);
            }
        }
    };

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

    const handleQuestionTypeChange = (type) => {
        setCurrentQuestion(prev => ({
            ...prev,
            type,
            options: type === 'multiple-choice' ? ['', '', '', ''] : [],
            correctAnswer: type === 'multiple-choice' ? 0 : ''
        }));
    };

    const handleOptionChange = (index, value) => {
        setCurrentQuestion(prev => ({
            ...prev,
            options: prev.options.map((opt, i) => i === index ? value : opt)
        }));
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const lessonRef = await addDoc(collection(db, 'lessons'), {
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
            console.error('Error creating lesson:', error);
            setError('Failed to create lesson');
        }
    };

    const handleActivitySubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const activityRef = await addDoc(collection(db, 'activities'), {
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
            console.error('Error creating activity:', error);
            setError('Failed to create activity');
        }
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const quizRef = await addDoc(collection(db, 'quizzes'), {
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
            console.error('Error creating quiz:', error);
            setError('Failed to create quiz');
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
                <h1 className="text-3xl font-bold mb-6">Add Lesson Materials</h1>
                
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

                {/* Lessons Tab */}
                {activeTab === 'lessons' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Lesson</h2>
                        <form onSubmit={handleLessonSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    id="lessonTitle"
                                    type="text"
                                    value={lessonContent.title}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter lesson title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="lessonWeek" className="block text-sm font-medium text-gray-700 mb-1">
                                    Week
                                </label>
                                <select
                                    id="lessonWeek"
                                    value={lessonContent.week}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, week: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Week</option>
                                    <option value="Week 1">Week 1</option>
                                    <option value="Week 2">Week 2</option>
                                    <option value="Week 3">Week 3</option>
                                    <option value="Week 4-5">Week 4-5</option>
                                    <option value="Week 6">Week 6</option>
                                    <option value="Week 7-8">Week 7-8</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="lessonDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="lessonDescription"
                                    value={lessonContent.description}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter lesson description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
                                    <label htmlFor="pptUpload" className="cursor-pointer">
                                        <svg className="mx-auto mb-2 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="block text-sm text-gray-600">Upload PPT/PDF</span>
                                        <input
                                            id="pptUpload"
                                            type="file"
                                            accept=".ppt,.pptx,.pdf"
                                            onChange={(e) => handleFileUpload(e, 'lesson')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
                                    <label htmlFor="imageUpload" className="cursor-pointer">
                                        <svg className="mx-auto mb-2 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="block text-sm text-gray-600">Upload Images</span>
                                        <input
                                            id="imageUpload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => handleFileUpload(e, 'lesson')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
                                    <label htmlFor="videoUpload" className="cursor-pointer">
                                        <svg className="mx-auto mb-2 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="block text-sm text-gray-600">Upload Videos</span>
                                        <input
                                            id="videoUpload"
                                            type="file"
                                            accept="video/*"
                                            multiple
                                            onChange={(e) => handleFileUpload(e, 'lesson')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Display uploaded files */}
                            {lessonContent.media.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
                                    <ul className="space-y-2">
                                        {lessonContent.media.map((file, index) => (
                                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm text-gray-600">{file.name}</span>
                                                {uploadProgress[file.name] === 100 && (
                                                    <span className="text-green-500 text-sm">✓</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <label htmlFor="lessonText" className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Text Content
                                </label>
                                <textarea
                                    id="lessonText"
                                    value={lessonContent.text}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="Enter additional text content"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="6"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Save Lesson
                            </button>
                        </form>
                    </div>
                )}

                {/* Activities Tab */}
                {activeTab === 'activities' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Activity</h2>
                        <form onSubmit={handleActivitySubmit} className="space-y-4">
                            <div>
                                <label htmlFor="activityTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    id="activityTitle"
                                    type="text"
                                    value={activityContent.title}
                                    onChange={(e) => setActivityContent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter activity title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="activityWeek" className="block text-sm font-medium text-gray-700 mb-1">
                                    Week
                                </label>
                                <select
                                    id="activityWeek"
                                    value={activityContent.week}
                                    onChange={(e) => setActivityContent(prev => ({ ...prev, week: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Week</option>
                                    <option value="Week 1">Week 1</option>
                                    <option value="Week 2">Week 2</option>
                                    <option value="Week 3">Week 3</option>
                                    <option value="Week 4-5">Week 4-5</option>
                                    <option value="Week 6">Week 6</option>
                                    <option value="Week 7-8">Week 7-8</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="activityDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="activityDescription"
                                    value={activityContent.description}
                                    onChange={(e) => setActivityContent(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter activity description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                        activityContent.type === 'form' 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setActivityContent(prev => ({ ...prev, type: 'form' }))}
                                >
                                    <svg className="mx-auto mb-2 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="block text-sm text-gray-600">Form Activity</span>
                                </div>

                                <div 
                                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                        activityContent.type === 'code' 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setActivityContent(prev => ({ ...prev, type: 'code' }))}
                                >
                                    <svg className="mx-auto mb-2 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span className="block text-sm text-gray-600">Code Activity</span>
                                </div>
                            </div>

                            {/* Question Builder */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Questions</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question Type
                                        </label>
                                        <select
                                            value={currentQuestion.type}
                                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="multiple-choice">Multiple Choice</option>
                                            <option value="true-false">True/False</option>
                                            <option value="short-answer">Short Answer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question
                                        </label>
                                        <textarea
                                            value={currentQuestion.question}
                                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                            placeholder="Enter your question"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>

                                    {currentQuestion.type === 'multiple-choice' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Options
                                            </label>
                                            {currentQuestion.options.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === index}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        placeholder={`Option ${index + 1}`}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.type === 'true-false' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Correct Answer
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === 'true'}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-2">True</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === 'false'}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-2">False</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Points
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={currentQuestion.points}
                                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Add Question
                                    </button>
                                </div>

                                {/* Display added questions */}
                                {activityContent.questions.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Added Questions</h3>
                                        <div className="space-y-4">
                                            {activityContent.questions.map((question, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-medium">{question.question}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Type: {question.type} | Points: {question.points}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Save Activity
                            </button>
                        </form>
                    </div>
                )}

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>
                        <form onSubmit={handleQuizSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    id="quizTitle"
                                    type="text"
                                    value={quizContent.title}
                                    onChange={(e) => setQuizContent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter quiz title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="quizWeek" className="block text-sm font-medium text-gray-700 mb-1">
                                    Week
                                </label>
                                <select
                                    id="quizWeek"
                                    value={quizContent.week}
                                    onChange={(e) => setQuizContent(prev => ({ ...prev, week: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Week</option>
                                    <option value="Week 1">Week 1</option>
                                    <option value="Week 2">Week 2</option>
                                    <option value="Week 3">Week 3</option>
                                    <option value="Week 4-5">Week 4-5</option>
                                    <option value="Week 6">Week 6</option>
                                    <option value="Week 7-8">Week 7-8</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="quizDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="quizDescription"
                                    value={quizContent.description}
                                    onChange={(e) => setQuizContent(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter quiz description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                                    Time Limit (minutes)
                                </label>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <input
                                        id="timeLimit"
                                        type="number"
                                        min="1"
                                        value={quizContent.timeLimit}
                                        onChange={(e) => setQuizContent(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Question Builder */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Questions</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question Type
                                        </label>
                                        <select
                                            value={currentQuestion.type}
                                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="multiple-choice">Multiple Choice</option>
                                            <option value="true-false">True/False</option>
                                            <option value="short-answer">Short Answer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question
                                        </label>
                                        <textarea
                                            value={currentQuestion.question}
                                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                            placeholder="Enter your question"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>

                                    {currentQuestion.type === 'multiple-choice' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Options
                                            </label>
                                            {currentQuestion.options.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === index}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        placeholder={`Option ${index + 1}`}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.type === 'true-false' && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Correct Answer
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === 'true'}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-2">True</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={currentQuestion.correctAnswer === 'false'}
                                                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-2">False</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Points
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={currentQuestion.points}
                                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Add Question
                                    </button>
                                </div>

                                {/* Display added questions */}
                                {quizContent.questions.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Added Questions</h3>
                                        <div className="space-y-4">
                                            {quizContent.questions.map((question, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-medium">{question.question}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Type: {question.type} | Points: {question.points}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Save Quiz
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddLessonMaterials;