import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, XCircle, Book, Activity, Award, Clock, Users, X, Search, Filter, Download } from 'lucide-react';

function ViewScoresPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeek, setFilterWeek] = useState('all');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const sectionName = location.state?.section || "Default Section";

  // Modal and student state
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [studentsAnswered, setStudentsAnswered] = useState([]);
  const [studentsNotAnswered, setStudentsNotAnswered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityStats, setActivityStats] = useState(null);

  // Toggle week expansion
  const toggleWeekExpansion = (weekIndex) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekIndex]: !prev[weekIndex]
    }));
  };

  // Fetch students, activities, and quizzes data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students in this section
        const studentsQuery = query(
          collection(db, 'users'),
          where('section', '==', sectionName),
          where('role', '==', 'student')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);

        // Fetch activities for this section
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('section', '==', sectionName)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivities(activitiesData);

        // Fetch quizzes for this section
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('section', '==', sectionName)
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzesData = quizzesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizzes(quizzesData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (sectionName) {
      fetchData();
    }
  }, [sectionName]);

  // Organize activities and quizzes by week
  const weeklyContent = useMemo(() => {
    if (!activities.length && !quizzes.length) return [];
    
    const weekMap = {};
    
    // Process activities
    activities.forEach(activity => {
      const week = activity.week || 'Unassigned';
      if (!weekMap[week]) {
        weekMap[week] = { week, activities: [], quizzes: [] };
      }
      weekMap[week].activities.push({
        id: activity.id,
        title: activity.title,
        type: 'activity',
        createdAt: activity.createdAt
      });
    });
    
    // Process quizzes
    quizzes.forEach(quiz => {
      const week = quiz.week || 'Unassigned';
      if (!weekMap[week]) {
        weekMap[week] = { week, activities: [], quizzes: [] };
      }
      weekMap[week].quizzes.push({
        id: quiz.id,
        title: quiz.title,
        type: 'quiz',
        createdAt: quiz.createdAt
      });
    });
    
    // Convert to array and sort by week
    return Object.values(weekMap).sort((a, b) => {
      // Custom sorting function to handle week formats
      const getWeekNumber = (week) => {
        const match = week.match(/(\d+)/);
        return match ? parseInt(match[0]) : 999; // Default to high number for unassigned
      };
      
      return getWeekNumber(a.week) - getWeekNumber(b.week);
    });
  }, [activities, quizzes]);

  // Enhanced fetch students scores for a specific activity
  const fetchStudentsForActivity = async (activityItem, weekData) => {
    setLoading(true);
    setStudentsAnswered([]);
    setStudentsNotAnswered([]);
    setSelectedWeek(weekData.week);
    
    try {
      const isQuiz = activityItem.type === 'quiz';
      const collectionName = isQuiz ? 'quizSubmissions' : 'activitySubmissions';
      const activityId = activityItem.id;
      
      // First, ensure we have the latest student data from the section
      const studentsQuery = query(
        collection(db, 'users'),
        where('section', '==', sectionName),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const latestStudentData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Initialize score-related fields
        score: 0,
        submittedAt: null,
        completionStatus: 'not-attempted',
        submissionDetails: null
      }));
      
      // Create a student lookup map for quicker access
      const studentMap = {};
      latestStudentData.forEach(student => {
        studentMap[student.id] = student;
      });
      
      // Fetch all submissions for this activity/quiz with additional details
      const submissionsQuery = query(
        collection(db, collectionName),
        where('activityId', '==', activityId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      // Process submission data with detailed metrics
      let totalScore = 0;
      let highestScore = 0;
      let lowestScore = Infinity;
      let totalTimeSpent = 0;
      let submissionCount = 0;
      
      submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        const studentId = data.studentId;
        const score = data.score || 0;
        
        // Skip if student isn't in our section anymore
        if (!studentMap[studentId]) return;
        
        // Get detailed submission data
        const submissionDetails = {
          id: doc.id,
          score,
          submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt),
          startedAt: data.startedAt?.toDate ? data.startedAt.toDate() : new Date(data.startedAt),
          timeSpent: data.timeSpent || calculateTimeSpent(data.startedAt, data.submittedAt),
          answers: data.answers || [],
          feedback: data.feedback || null,
          attempts: data.attempts || 1,
          passingScore: data.passingScore || 60,
          status: score >= (data.passingScore || 60) ? 'passed' : 'failed'
        };
        
        // Update student data with submission details
        studentMap[studentId].score = score;
        studentMap[studentId].submittedAt = submissionDetails.submittedAt;
        studentMap[studentId].completionStatus = 'completed';
        studentMap[studentId].submissionDetails = submissionDetails;
        
        // Update statistics
        totalScore += score;
        if (score > highestScore) highestScore = score;
        if (score < lowestScore) lowestScore = score;
        totalTimeSpent += submissionDetails.timeSpent || 0;
        submissionCount++;
      });
      
      // Process each student into answered/not answered categories
      const answered = [];
      const notAnswered = [];
      
      Object.values(studentMap).forEach(student => {
        if (student.completionStatus === 'completed') {
          answered.push(student);
        } else {
          notAnswered.push(student);
        }
      });
      
      // Sort by score (highest first)
      answered.sort((a, b) => {
        // First sort by score
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
        
        // If scores are equal, sort by submission time
        if (a.submittedAt && b.submittedAt) {
          return a.submittedAt - b.submittedAt; // Earlier submission ranks higher
        }
        return 0;
      });
      
      setStudentsAnswered(answered);
      setStudentsNotAnswered(notAnswered);
      
      // Calculate enhanced statistics
      const averageScore = answered.length > 0 ? (totalScore / answered.length).toFixed(1) : 0;
      lowestScore = lowestScore === Infinity ? 0 : lowestScore;
      const completionRate = latestStudentData.length > 0 ? ((answered.length / latestStudentData.length) * 100).toFixed(0) : 0;
      const averageTimeSpent = submissionCount > 0 ? Math.round(totalTimeSpent / submissionCount) : 0;
      const passingCount = answered.filter(s => s.score >= (s.submissionDetails?.passingScore || 60)).length;
      const passingRate = answered.length > 0 ? ((passingCount / answered.length) * 100).toFixed(0) : 0;
      
      setActivityStats({
        average: averageScore,
        highest: highestScore,
        lowest: lowestScore,
        completionRate,
        totalStudents: latestStudentData.length,
        completedCount: answered.length,
        averageTimeSpent,
        passingRate,
        lastSubmission: answered.length > 0 ? 
          new Date(Math.max(...answered.map(s => s.submittedAt?.getTime() || 0))).toISOString() : 
          null
      });
      
      // Set selected activity name
      setSelectedActivity(activityItem.title);
      
    } catch (err) {
      console.error("Error fetching student scores:", err);
      setStudentsAnswered([]);
      setStudentsNotAnswered([]);
      setActivityStats(null);
    }
    
    setLoading(false);
  };

  // Helper function to calculate time spent on an activity
  const calculateTimeSpent = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    // Convert to Date objects if they're not already
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    
    // Calculate difference in minutes
    return Math.round((end - start) / (1000 * 60));
  };

  // Memoized filtering for weekly content
  const filteredWeeklyContent = useMemo(() => {
    return weeklyContent.filter(weekData => {
      // Filter by week if specified
      if (filterWeek !== 'all' && filterWeek !== weekData.week) {
        return false;
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        
        // Check if week matches
        const weekMatches = weekData.week.toLowerCase().includes(lowerSearch);
        
        // Check if any activity matches
        const activityMatches = weekData.activities.some(activity => 
          activity.title.toLowerCase().includes(lowerSearch)
        );
        
        // Check if any quiz matches
        const quizMatches = weekData.quizzes.some(quiz =>
          quiz.title.toLowerCase().includes(lowerSearch)
        );
        
        return weekMatches || activityMatches || quizMatches;
      }
      
      return true;
    });
  }, [weeklyContent, filterWeek, searchTerm]);

  // Initialize expandedWeeks state when weekly content is available
  useEffect(() => {
    if (weeklyContent.length > 0) {
      const initialExpanded = {};
      weeklyContent.forEach((_, idx) => {
        initialExpanded[idx] = true;
      });
      setExpandedWeeks(initialExpanded);
    }
  }, [weeklyContent]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="View Scores" />
      
      <div className="flex">
        {isNavOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            exit={{ width: 0 }}
            className="border-r border-white/20 bg-[#141a35]"
          >
            <AdminNavigationBar />
          </motion.div>
        )}
      
        <div className="flex-grow p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header and controls */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Activity size={24} className="mr-2 text-blue-600" />
                    Score Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {sectionName ? `Section: ${sectionName}` : "View and manage student performance"}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/viewStudentLists', { state: { section: sectionName } })}
                    className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
                  >
                    <Users size={16} className="mr-2" />
                    View Student Lists
                  </button>
                  
                  <button
                    className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center"
                    onClick={() => {
                      // Implementation for exporting scores
                      const dataStr = "data:text/json;charset=utf-8," + 
                        encodeURIComponent(JSON.stringify({
                          section: sectionName,
                          students,
                          activities,
                          quizzes
                        }));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `scores_${sectionName}.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                  >
                    <Download size={16} className="mr-2" />
                    Export Scores
                  </button>
                </div>
              </div>
              
              {/* Search and filter controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  <select
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="all">All Weeks</option>
                    {weeklyContent.map((weekData, idx) => (
                      <option key={idx} value={weekData.week}>{weekData.week}</option>
                    ))}
                  </select>
                </div>
                
                <div className="text-right hidden md:block text-gray-500 self-center">
                  {isLoading ? (
                    <div className="flex items-center justify-end">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                      Loading data...
                    </div>
                  ) : (
                    <span>
                      Showing {filteredWeeklyContent.length} of {weeklyContent.length} weeks
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* List header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Course Activities</h2>
              </div>
              
              {/* Activity list */}
              <div className="divide-y divide-gray-200 max-h-[calc(100vh-320px)] overflow-y-auto">
                {isLoading ? (
                  <div className="p-12 flex justify-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                      <p className="text-gray-500">Loading activities and scores...</p>
                    </div>
                  </div>
                ) : filteredWeeklyContent.length > 0 ? (
                  filteredWeeklyContent.map((weekData, idx) => (
                    <div key={idx} className="px-6 py-3">
                      <div 
                        className="flex items-center justify-between cursor-pointer py-2"
                        onClick={() => toggleWeekExpansion(idx)}
                      >
                        <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                          <Book size={18} className="mr-2 text-blue-600" />
                          {weekData.week}
                        </h3>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-3">
                            {weekData.activities.length + weekData.quizzes.length} items
                          </span>
                          <ChevronDown 
                            size={20} 
                            className={`text-gray-500 transition-transform duration-200 ${
                              expandedWeeks[idx] ? 'transform rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedWeeks[idx] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-6 pb-3 space-y-1">
                              {/* Activities */}
                              {weekData.activities.map((activityItem, index) => (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  key={`activity-${activityItem.id}`}
                                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    <Activity size={16} className="mr-2 text-blue-500" />
                                    <span className="text-gray-700">{activityItem.title}</span>
                                  </div>
                                  
                                  <button
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-1 px-3 rounded-md transition-colors duration-200 flex items-center"
                                    onClick={() => {
                                      setShowModal(true);
                                      fetchStudentsForActivity(activityItem, weekData);
                                    }}
                                  >
                                    View Scores
                                  </button>
                                </motion.div>
                              ))}
                              
                              {/* Quizzes */}
                              {weekData.quizzes.map((quizItem, index) => (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (weekData.activities.length + index) * 0.05 }}
                                  key={`quiz-${quizItem.id}`}
                                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    <Award size={16} className="mr-2 text-amber-500" />
                                    <span className="text-gray-700">{quizItem.title}</span>
                                  </div>
                                  
                                  <button
                                    className="text-sm font-medium text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 py-1 px-3 rounded-md transition-colors duration-200 flex items-center"
                                    onClick={() => {
                                      setShowModal(true);
                                      fetchStudentsForActivity(quizItem, weekData);
                                    }}
                                  >
                                    View Scores
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-gray-500 mb-4">
                      {searchTerm || filterWeek !== 'all' ? 
                        "No activities found matching your search." : 
                        "No activities have been created for this section yet."
                      }
                    </div>
                    {!searchTerm && filterWeek === 'all' && (
                      <button
                        onClick={() => navigate('/instructor/addLessonMaterials')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Add Activities
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the modal for displaying student scores here */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "-100px", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100px", opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedActivity} - {selectedWeek}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal content - student scores */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                    <p className="text-gray-500">Loading scores...</p>
                  </div>
                ) : (
                  <div>
                    {/* Statistics overview */}
                    {activityStats && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-4">
                        <p className="text-sm text-blue-700 font-medium">
                          Statistics Overview
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500">Average Score</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {activityStats.average}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500">Highest Score</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {activityStats.highest}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500">Lowest Score</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {activityStats.lowest}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-xs text-gray-500">Completion Rate</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {activityStats.completionRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Students who answered */}
                    <div>
                      <p className="text-gray-700 font-medium mb-2">
                        Students Who Answered ({studentsAnswered.length})
                      </p>
                      <div className="bg-white rounded-md shadow-sm divide-y divide-gray-200">
                        {studentsAnswered.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-800 mr-3">
                                {idx + 1}.
                              </span>
                              <span className="text-sm text-gray-700">
                                {student.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Score: {student.score}
                              </p>
                              <p className="text-xs text-gray-400">
                                Submitted: {new Date(student.submittedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Students who did not answer */}
                    {studentsNotAnswered.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-700 font-medium mb-2">
                          Students Who Did Not Answer ({studentsNotAnswered.length})
                        </p>
                        <div className="bg-white rounded-md shadow-sm divide-y divide-gray-200">
                          {studentsNotAnswered.map((student, idx) => (
                            <div key={student.id} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-800 mr-3">
                                  {idx + 1 + studentsAnswered.length}.
                                </span>
                                <span className="text-sm text-gray-700">
                                  {student.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Not Attempted
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewScoresPage;