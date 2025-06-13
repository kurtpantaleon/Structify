import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import { BookOpen, Plus, Loader, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';
import useFileUpload from '../../hooks/useFileUpload';
import { getStorage, ref, deleteObject } from 'firebase/storage';

const EditStructifyLesson = () => {
    const { currentUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const { handleFileUpload: uploadFile, uploadProgress, error, success, setError, setSuccess } = useFileUpload();
    const storage = getStorage();

    // Learning path data
    const learningPathData = [
        { week: "Week 1", topic: "Introduction to Data Structures" },
        { week: "Week 2", topic: "Algorithms & Complexity" },
        { week: "Week 3", topic: "String Processing" },
        { week: "Week 4 and 5", topic: "Array, Records, and Pointers" },
        { week: "Week 6", topic: "Linked Lists" },
        { week: "Week 7 and 8", topic: "Stacks, Queues, and Recursion" },
        { week: "Week 10 and 11", topic: "Trees" },
        { week: "Week 12 and 13", topic: "Graph Algorithms" },
        { week: "Week 14 and 16", topic: "Sorting and Searching" },
        { week: "Week 17", topic: "Hashing" }
    ];

    const [lessonContent, setLessonContent] = useState({
        title: '',
        description: '',
        week: '',
        section: currentUser?.section || '',
        lessons: [
            {
                description: '',
                mediaType: 'image',
                image: null
            }
        ]
    });

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    // Add new lesson slide
    const handleAddSlide = () => {
        setLessonContent(prev => ({
            ...prev,
            lessons: [
                ...prev.lessons,
                {
                    description: '',
                    mediaType: 'image',
                    image: null
                }
            ]
        }));
    };

    // Remove lesson slide
    const handleRemoveSlide = (index) => {
        const slide = lessonContent.lessons[index];
        
        // If there's an image, delete it from storage
        if (slide.image) {
            handleDeleteFile(slide.image.url);
        }

        setLessonContent(prev => ({
            ...prev,
            lessons: prev.lessons.filter((_, i) => i !== index)
        }));
    };

    // Delete file from storage
    const handleDeleteFile = async (fileUrl) => {
        try {
            const url = new URL(fileUrl);
            const pathMatch = decodeURIComponent(url.pathname).match(/\/o\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
                const filePath = pathMatch[1].split('?')[0];
                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef);
            }
        } catch (err) {
            console.error('Error deleting file:', err);
            showNotification('error', 'Failed to delete file from storage');
        }
    };

    // Update lesson slide
    const handleSlideChange = (index, field, value) => {
        setLessonContent(prev => ({
            ...prev,
            lessons: prev.lessons.map((lesson, i) => 
                i === index ? { ...lesson, [field]: value } : lesson
            )
        }));
    };

    // Handle file upload for a specific slide
    const handleSlideFileUpload = async (e, slideIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-matroska'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('error', 'Invalid file type. Please upload only JPG, PNG, MP4, MOV, or MKV files.');
            return;
        }

        try {
            // If there's an existing image, delete it first
            const currentSlide = lessonContent.lessons[slideIndex];
            if (currentSlide.image) {
                await handleDeleteFile(currentSlide.image.url);
            }

            await uploadFile(e, 'image', (fileObj) => {
                handleSlideChange(slideIndex, 'image', fileObj);
            });
        } catch (error) {
            showNotification('error', 'Failed to upload file');
        }
    };

    // Submit lesson
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            if (!lessonContent.title.trim()) {
                throw new Error('Title is required');
            }

            if (lessonContent.lessons.length === 0) {
                throw new Error('Add at least one lesson slide');
            }

            await addDoc(collection(db, 'structifyLessons'), {
                ...lessonContent,
                createdAt: serverTimestamp(),
                instructorId: currentUser.uid,
                instructorName: currentUser.name
            });

            showNotification('success', 'Lesson edited successfully!');
            setLessonContent({
                title: '',
                description: '',
                week: '',
                section: currentUser?.section || '',
                lessons: [
                    {
                        description: '',
                        mediaType: 'image',
                        image: null
                    }
                ]
            });
        } catch (error) {
            showNotification('error', error.message || 'Failed to edit lesson');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white">
            <Header />
            <AdminSubHeading title="Edit Structify Lesson" />

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    {/* Basic Information */}
                    <div className="bg-[#141a35] rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={lessonContent.title}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter lesson title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={lessonContent.description}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Enter lesson description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Week</label>
                                <select
                                    value={lessonContent.week}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, week: e.target.value }))}
                                    className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a week</option>
                                    {learningPathData.map((item, index) => (
                                        <option key={index} value={item.week}>
                                            {item.week} - {item.topic}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lesson Slides */}
                    <div className="bg-[#141a35] rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Lesson Slides</h2>
                            <button
                                type="button"
                                onClick={handleAddSlide}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                            >
                                <Plus size={20} />
                                Add Slide
                            </button>
                        </div>

                        <div className="space-y-6">
                            {lessonContent.lessons.map((lesson, index) => (
                                <div key={index} className="border border-white/20 rounded-lg p-4 relative group">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSlide(index)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <h3 className="text-lg font-semibold mb-4">Slide {index + 1}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description</label>
                                            <textarea
                                                value={lesson.description}
                                                onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                                                className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows="3"
                                                placeholder="Enter slide description"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Media</label>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.mp4,.mov,.mkv"
                                                onChange={(e) => handleSlideFileUpload(e, index)}
                                                className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-sm text-gray-400 mt-1">
                                                Accepted formats: JPG, PNG, MP4, MOV, MKV
                                            </p>
                                            {lesson.image && (
                                                <div className="mt-3 p-3 bg-[#1F274D] border border-blue-500/30 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                                {lesson.image.type?.startsWith('image/') ? (
                                                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white">
                                                                    {lesson.image.name || 'Uploaded file'}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {lesson.image.type?.split('/')[1].toUpperCase() || 'File'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleDeleteFile(lesson.image.url);
                                                                handleSlideChange(index, 'image', null);
                                                            }}
                                                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Notification */}
                {notification.show && (
                    <div
                        className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
                            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {notification.type === 'success' ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            <span>{notification.message}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditStructifyLesson; 