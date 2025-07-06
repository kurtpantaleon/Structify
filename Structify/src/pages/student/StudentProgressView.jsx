import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/authContextProvider';
import { useLessonProgress } from '../../context/lessonProgressContext';
import Header from '../../components/Header';
import NavigationBar from '../../components/NavigationBar';
import SubHeading from '../../components/SubHeading';
import { Book, Activity, FileQuestion, CheckCircle, Clock, Calendar, BarChart2, Award, UserCheck } from 'lucide-react';

const StudentProgressView = () => {
  const { currentUser } = useAuth();
  const { completedLessons, completedActivities, completedQuizzes, activityScores } = useLessonProgress();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    quizzes: [],
    activities: [],
    averageScore: 0,
    totalQuizzes: 0,
    totalActivities: 0,
    completedQuizzes: 0,
    completedActivities: 0
  });
  
  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch quiz submissions
        const quizSubmissionsQuery = query(
          collection(db, 'quiz_submissions'),
          where('studentId', '==', currentUser.uid)
        );
        const quizSubmissionsSnapshot = await getDocs(quizSubmissionsQuery);
        const quizSubmissions = quizSubmissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
        }));
        
        // Fetch activity submissions
        const activitySubmissionsQuery = query(
          collection(db, 'activity_submissions'),
          where('studentId', '==', currentUser.uid)
        );
        const activitySubmissionsSnapshot = await getDocs(activitySubmissionsQuery);
        const activitySubmissions = activitySubmissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
        }));
        
        // Fetch all quizzes for user's section
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('section', '==', currentUser.section)
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const totalQuizzes = quizzesSnapshot.size;
        
        // Fetch all activities for user's section
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('section', '==', currentUser.section)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const totalActivities = activitiesSnapshot.size;
        
        // Calculate average score from all quiz and activity submissions
        const allScores = [...quizSubmissions.map(q => q.score), ...activitySubmissions.map(a => a.score)];
        const averageScore = allScores.length > 0 
          ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length) 
          : 0;
        
        setStatistics({
          quizzes: quizSubmissions.sort((a, b) => b.submittedAt - a.submittedAt),
          activities: activitySubmissions.sort((a, b) => b.submittedAt - a.submittedAt),
          averageScore,
          totalQuizzes,
          totalActivities,
          completedQuizzes: quizSubmissions.length,
          completedActivities: activitySubmissions.length
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching student progress:", err);
        setError("Failed to load your progress data");
        setIsLoading(false);
      }
    };
    
    fetchStudentProgress();
  }, [currentUser, completedQuizzes, completedActivities]);
  
  // Format date helper function
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getProgressColor = (completed, total) => {
    if (!total) return "bg-gray-200";
    const percentage = (completed / total) * 100;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      
      <SubHeading 
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        toggleLearningPath={() => setIsLearningPathOpen(!isLearningPathOpen)}
        title="Introduction to Data Structures"
      />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Navigation Bar: Hidden by default on mobile, toggleable */}
        {isNavOpen && (
          <div className="fixed inset-y-0 left-0 z-50 bg-[#141a35] flex flex-col items-center py-6 px-2 border-r border-white/20 transition-transform duration-300 ease-in-out w-64 md:w-16 md:static md:h-screen md:translate-x-0">
            <NavigationBar />
            {/* Close Button for Mobile */}
            <button
              className="md:hidden absolute top-4 right-4 text-white focus:ring-2 focus:ring-white"
              onClick={() => setIsNavOpen(false)}
              aria-label="Close Navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Backdrop for Mobile */}
        {isNavOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsNavOpen(false)}
          ></div>
        )}
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-8">
          My Progress Dashboard
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
          
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 shadow-lg border border-blue-700">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-700 bg-opacity-60 p-3 rounded-lg mr-4">
                    <Award className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="text-sm text-blue-200 font-medium">Average Score</h3>
                    <p className="text-2xl font-bold text-white">{statistics.averageScore}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 shadow-lg border border-purple-700">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-700 bg-opacity-60 p-3 rounded-lg mr-4">
                    <FileQuestion className="h-6 w-6 text-purple-200" />
                  </div>
                  <div>
                    <h3 className="text-sm text-purple-200 font-medium">Quizzes Completed</h3>
                    <p className="text-2xl font-bold text-white">
                      {statistics.completedQuizzes} / {statistics.totalQuizzes}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-purple-700 bg-opacity-40 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(statistics.completedQuizzes, statistics.totalQuizzes)}`}
                    style={{ width: `${statistics.totalQuizzes ? (statistics.completedQuizzes / statistics.totalQuizzes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 shadow-lg border border-green-700">
                <div className="flex items-center mb-4">
                  <div className="bg-green-700 bg-opacity-60 p-3 rounded-lg mr-4">
                    <Activity className="h-6 w-6 text-green-200" />
                  </div>
                  <div>
                    <h3 className="text-sm text-green-200 font-medium">Activities Completed</h3>
                    <p className="text-2xl font-bold text-white">
                      {statistics.completedActivities} / {statistics.totalActivities}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-green-700 bg-opacity-40 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(statistics.completedActivities, statistics.totalActivities)}`}
                    style={{ width: `${statistics.totalActivities ? (statistics.completedActivities / statistics.totalActivities) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl p-6 shadow-lg border border-amber-700">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-700 bg-opacity-60 p-3 rounded-lg mr-4">
                    <UserCheck className="h-6 w-6 text-amber-200" />
                  </div>
                  <div>
                    <h3 className="text-sm text-amber-200 font-medium">Overall Completion</h3>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(((statistics.completedQuizzes + statistics.completedActivities) / 
                      (statistics.totalQuizzes + statistics.totalActivities || 1)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Quizzes */}
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FileQuestion className="mr-2 h-5 w-5 text-purple-400" />
                    Quiz Results
                  </h2>
                </div>
                
                <div className="p-6">
                  {statistics.quizzes.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>You haven't taken any quizzes yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-gray-300">
                        <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
                          <tr>
                            <th className="px-4 py-3">Quiz</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistics.quizzes.slice(0, 5).map(quiz => (
                            <tr key={quiz.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                              <td className="px-4 py-3">{quiz.quizTitle}</td>
                              <td className={`px-4 py-3 font-medium ${getScoreColor(quiz.score)}`}>{quiz.score}%</td>
                              <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(quiz.submittedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activities */}
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-green-400" />
                    Activity Results
                  </h2>
                </div>
                
                <div className="p-6">
                  {statistics.activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>You haven't completed any activities yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-gray-300">
                        <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
                          <tr>
                            <th className="px-4 py-3">Activity</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistics.activities.slice(0, 5).map(activity => (
                            <tr key={activity.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                              <td className="px-4 py-3">{activity.activityTitle}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  activity.activityType === 'form' 
                                    ? 'bg-blue-900/50 text-blue-300' 
                                    : 'bg-purple-900/50 text-purple-300'
                                }`}>
                                  {activity.activityType}
                                </span>
                              </td>
                              <td className={`px-4 py-3 font-medium ${getScoreColor(activity.score)}`}>{activity.score}%</td>
                              <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(activity.submittedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default StudentProgressView;
