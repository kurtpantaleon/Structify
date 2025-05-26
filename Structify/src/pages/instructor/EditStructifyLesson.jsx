import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import { BookOpen, Plus, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import useFileUpload from './useFileUpload';

const EditStructifyLesson = () => {
    const { currentUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const { handleFileUpload: uploadFile, uploadProgress, error, success, setError, setSuccess } = useFileUpload();

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

        try {
            await uploadFile(e, 'image', (fileObj) => {
                handleSlideChange(slideIndex, 'image', fileObj);
            });
        } catch (error) {
            showNotification('error', 'Failed to upload image');
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
                                <input
                                    type="text"
                                    value={lessonContent.week}
                                    onChange={(e) => setLessonContent(prev => ({ ...prev, week: e.target.value }))}
                                    className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter week number"
                                />
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
                                <div key={index} className="border border-white/20 rounded-lg p-4">
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
                                            <label className="block text-sm font-medium mb-2">Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleSlideFileUpload(e, index)}
                                                className="w-full bg-[#1F274D] border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {lesson.image && (
                                                <div className="mt-2">
                                                    <img
                                                        src={lesson.image.url}
                                                        alt={`Slide ${index + 1}`}
                                                        className="max-w-xs rounded-lg"
                                                    />
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