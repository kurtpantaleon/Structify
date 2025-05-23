import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Header from '../components/ProfileHeader ';
import exit from '../assets/images/X Icon.png';

const ClassField = () => {
    const [activeTab, setActiveTab] = useState('lessons');
    const [lessons, setLessons] = useState([]);
    const [activities, setActivities] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const section = location.state?.section || defaultSection;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch lessons
                const lessonsQuery = query(collection(db, 'lessons'), where('section', '==', section));
                const lessonsSnap = await getDocs(lessonsQuery);
                setLessons(lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch activities
                const activitiesQuery = query(collection(db, 'activities'), where('section', '==', section));
                const activitiesSnap = await getDocs(activitiesQuery);
                setActivities(activitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch quizzes
                const quizzesQuery = query(collection(db, 'quizzes'), where('section', '==', section));
                const quizzesSnap = await getDocs(quizzesQuery);
                setQuizzes(quizzesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                setError('Failed to fetch class materials.');
            }
            setLoading(false);
        };
        fetchData();
    }, [section]);

    return (
        <div className="bg-blue-100 min-h-screen">
            <Header />
            {/* Exit Button */}
            <div className="flex justify-end m-8">
                <button onClick={() => navigate(-1)} className="z-10">
                    <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer filter invert" />
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
                                <div key={lesson.id} className="mb-6 p-4 bg-white rounded shadow">
                                    <h2 className="text-xl font-bold mb-2">{lesson.title}</h2>
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
        </div>
    );
};

export default ClassField;