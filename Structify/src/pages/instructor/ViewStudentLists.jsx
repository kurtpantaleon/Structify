import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import Header from '../../components/AdminHeader';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import AdminSubHeading from '../../components/AdminSubHeading';

function ViewStudentLists() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [sortCriterion, setSortCriterion] = useState('name');
  const location = useLocation();
  const navigate = useNavigate();
  const { section } = location.state;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log('Fetching students for section:', section.sectionName);
        
        // Query for students in this specific section
        const q = query(
          collection(db, 'users'),
          where('section', '==', section.sectionName),
          where('role', '==', 'student')
        );
        
        const snapshot = await getDocs(q);
        console.log(`Found ${snapshot.docs.length} students in section ${section.sectionName}`);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          activityData: null,
          quizData: null
        }));
        
        // Fetch additional data for each student
        const enhancedStudentData = await Promise.all(data.map(async (student) => {
          // Get activity submissions
          const activitySubmissionsQuery = query(
            collection(db, 'activitySubmissions'),
            where('studentId', '==', student.id)
          );
          const activitySnapshot = await getDocs(activitySubmissionsQuery);
          const activitySubmissions = activitySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Get quiz submissions
          const quizSubmissionsQuery = query(
            collection(db, 'quizSubmissions'),
            where('studentId', '==', student.id)
          );
          const quizSnapshot = await getDocs(quizSubmissionsQuery);
          const quizSubmissions = quizSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Calculate completion metrics with more comprehensive data
          const totalActivities = student.completedActivities?.length || 0;
          const totalQuizzes = student.completedQuizzes?.length || 0;
          
          // Group submissions by activity/quiz for better analysis
          const submissionsByActivity = {};
          activitySubmissions.forEach(submission => {
            if (!submissionsByActivity[submission.activityId]) {
              submissionsByActivity[submission.activityId] = [];
            }
            submissionsByActivity[submission.activityId].push(submission);
          });
          
          // Get the best score for each activity (in case of multiple attempts)
          const bestActivityScores = Object.values(submissionsByActivity).map(submissions => {
            const sorted = [...submissions].sort((a, b) => (b.score || 0) - (a.score || 0));
            return sorted[0] || null;
          }).filter(Boolean);
          
          // Similar grouping for quizzes
          const submissionsByQuiz = {};
          quizSubmissions.forEach(submission => {
            if (!submissionsByQuiz[submission.activityId]) {
              submissionsByQuiz[submission.activityId] = [];
            }
            submissionsByQuiz[submission.activityId].push(submission);
          });
          
          const bestQuizScores = Object.values(submissionsByQuiz).map(submissions => {
            const sorted = [...submissions].sort((a, b) => (b.score || 0) - (a.score || 0));
            return sorted[0] || null;
          }).filter(Boolean);
          
          // Calculate average scores for different activity types
          const avgActivityScore = calculateAverageScore(bestActivityScores);
          const avgQuizScore = calculateAverageScore(bestQuizScores);
          const avgOverallScore = calculateAverageScore([...bestActivityScores, ...bestQuizScores]);
          
          // Calculate total time spent on activities and quizzes
          const totalTimeSpent = [...activitySubmissions, ...quizSubmissions].reduce((total, sub) => {
            const start = sub.startedAt ? new Date(sub.startedAt) : null;
            const end = sub.submittedAt ? new Date(sub.submittedAt) : null;
            
            if (start && end) {
              const minutes = Math.max(0, (end - start) / (1000 * 60));
              return total + minutes;
            }
            return total + (sub.timeSpent || 0);
          }, 0);
          
          // Get the most recent submission
          const allSubmissions = [...activitySubmissions, ...quizSubmissions];
          let lastSubmission = null;
          if (allSubmissions.length > 0) {
            lastSubmission = allSubmissions.reduce((latest, current) => {
              const latestDate = latest.submittedAt ? new Date(latest.submittedAt) : new Date(0);
              const currentDate = current.submittedAt ? new Date(current.submittedAt) : new Date(0);
              return currentDate > latestDate ? current : latest;
            });
          }
          
          // Determine progress trend
          let progressTrend = 'stable';
          if (allSubmissions.length >= 3) {
            // Get the 3 most recent submissions with scores
            const recentSubmissions = [...allSubmissions]
              .sort((a, b) => {
                const dateA = a.submittedAt ? new Date(a.submittedAt) : new Date(0);
                const dateB = b.submittedAt ? new Date(b.submittedAt) : new Date(0);
                return dateB - dateA;
              })
              .slice(0, 3);
              
            const oldestScore = recentSubmissions[2].score || 0;
            const newestScore = recentSubmissions[0].score || 0;
            const scoreDifference = newestScore - oldestScore;
            
            if (scoreDifference > 5) progressTrend = 'improving';
            else if (scoreDifference < -5) progressTrend = 'declining';
          }
          
          return {
            ...student,
            activityData: {
              submissions: activitySubmissions,
              completedCount: totalActivities,
              submissionsByActivity,
              bestScores: bestActivityScores,
              averageScore: avgActivityScore
            },
            quizData: {
              submissions: quizSubmissions,
              completedCount: totalQuizzes,
              submissionsByQuiz,
              bestScores: bestQuizScores,
              averageScore: avgQuizScore
            },
            metrics: {
              totalCompleted: totalActivities + totalQuizzes,
              averageScore: avgOverallScore,
              activityScore: avgActivityScore,
              quizScore: avgQuizScore,
              timeSpent: Math.round(totalTimeSpent),
              lastSubmission: lastSubmission ? {
                id: lastSubmission.id,
                activityId: lastSubmission.activityId,
                score: lastSubmission.score || 0,
                date: lastSubmission.submittedAt || null,
                type: lastSubmission.activityType || (lastSubmission.quizId ? 'quiz' : 'activity')
              } : null,
              progressTrend,
              activeStreak: calculateStreakDays(allSubmissions),
              totalAttempts: allSubmissions.length
            }
          };
        }));
        
        setStudents(enhancedStudentData);
      } catch (error) {
        console.error('Error fetching students:', error);
        alert(`Error loading students: ${error.message}`);
      }
    };

    // Helper function to calculate average score
    const calculateAverageScore = (submissions) => {
      if (!submissions || submissions.length === 0) return 0;
      
      const totalScore = submissions.reduce((sum, submission) => {
        return sum + (submission.score || 0);
      }, 0);
      
      return (totalScore / submissions.length).toFixed(1);
    };

    // Calculate streak days (consecutive days with submissions)
    const calculateStreakDays = (submissions) => {
      if (!submissions || submissions.length === 0) return 0;
      
      // Extract submission dates and sort them
      const dates = submissions
        .map(sub => sub.submittedAt ? new Date(sub.submittedAt) : null)
        .filter(Boolean)
        .sort((a, b) => a - b);
      
      if (dates.length === 0) return 0;
      
      // Check if the most recent submission is within the last 48 hours
      const now = new Date();
      const mostRecent = dates[dates.length - 1];
      if ((now - mostRecent) / (1000 * 60 * 60) > 48) {
        return 0; // Streak broken if no submission in last 48 hours
      }
      
      // Find consecutive days
      let streak = 1;
      let currentStreak = 1;
      let lastDate = null;
      
      // Group dates by day (remove time component)
      const datesByDay = {};
      dates.forEach(date => {
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        datesByDay[dayKey] = true;
      });
      
      // Convert back to array of date objects (one per day)
      const uniqueDays = Object.keys(datesByDay).map(day => {
        const [year, month, date] = day.split('-').map(Number);
        return new Date(year, month - 1, date);
      }).sort((a, b) => a - b);
      
      // Calculate streak
      for (let i = 1; i < uniqueDays.length; i++) {
        const prevDay = uniqueDays[i-1];
        const currDay = uniqueDays[i];
        
        // Check if dates are consecutive
        const diffDays = Math.round((currDay - prevDay) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1; // Reset streak
        }
        
        if (currentStreak > streak) {
          streak = currentStreak;
        }
      }
      
      return streak;
    };

    fetchStudents();
  }, [section.sectionName]);

  // Sort students by different criteria
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      switch (sortCriterion) {
        case 'score':
          return (b.metrics?.averageScore || 0) - (a.metrics?.averageScore || 0);
        case 'completed':
          return (b.metrics?.totalCompleted || 0) - (a.metrics?.totalCompleted || 0);
        case 'recent':
          const dateA = a.metrics?.lastSubmission?.date ? new Date(a.metrics.lastSubmission.date) : new Date(0);
          const dateB = b.metrics?.lastSubmission?.date ? new Date(b.metrics.lastSubmission.date) : new Date(0);
          return dateB - dateA;
        case 'name':
        default:
          return a.name?.localeCompare(b.name || '');
      }
    });
  }, [students, sortCriterion]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading
        toggleNav={() => setIsNavOpen(!isNavOpen)}
        title="Student List"
      />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-7 bg-white p-10 rounded-lg shadow h-[75vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#141a35] mb-1">
              {section.sectionName}
            </h1>
            <p className="text-gray-500">Student management and performance tracking</p>
          </div>
          <button
            onClick={() => navigate('/viewScoresPage', { state: { section: section.sectionName } })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            View Scores
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <h2 className="text-lg font-semibold text-[#141a35]">Student List</h2>
          </div>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {students.length} students enrolled
          </span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-100 rounded-t-lg font-medium text-gray-700">
          <div>Name</div>
          <div>Email</div>
          <div className="text-center">Completed Activities</div>
          <div className="text-center">Average Score</div>
        </div>

        {/* Table body */}
        <div className="overflow-y-auto pr-2 flex-grow rounded-b-lg border border-gray-200">
          {students.length > 0 ? (
            sortedStudents.map((student, index) => (
              <div
                key={student.id || index}
                className="grid grid-cols-4 gap-4 px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-2">
                    {student.name?.charAt(0) || '?'}
                  </div>
                  <p className="font-medium text-[#141a35]">{student.name}</p>
                </div>
                <div className="flex items-center text-gray-600">
                  {student.email || "No email provided"}
                </div>
                <div className="text-center">
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {student.metrics?.totalCompleted || 0} activities
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    (student.metrics?.averageScore || 0) >= 80
                      ? "bg-green-100 text-green-800"
                      : (student.metrics?.averageScore || 0) >= 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {student.metrics?.averageScore || 0}%
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${
                      (student.metrics?.averageScore || 0) >= 80
                        ? "text-green-600"
                        : (student.metrics?.averageScore || 0) >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`} viewBox="0 0 20 20" fill="currentColor">
                      {(student.metrics?.averageScore || 0) >= 80 ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">No students found in section {section.sectionName}.</p>
              <p className="text-sm">Try adding students to this section first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewStudentLists;
