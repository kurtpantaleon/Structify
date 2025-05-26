import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { ChevronDown, Check, X, Loader } from 'lucide-react';

const weekLabels = [
  '1st Week',
  '2nd Week',
  '3rd Week',
  '4th–5th Week',
  '6th Week',
  '7th–8th Week',
  '10th–11th Week',
  '12th–13th Week',
  '14th–16th Week',
  '17th Week',
];

const mockData = weekLabels.map((week) => ({
  week,
  activities: ['Activity 1', 'Activity 2', 'Activity 3', 'Quiz']
}));

const getActivityKey = (activity, weekIdx) => {
  const base = activity.toLowerCase().replace(/ /g, '');
  if (base === 'quiz') {
    return `quiz${weekIdx + 1}`; // weekIdx is 0-based
  }
  return base;
};

function ViewScoresPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sectionName = location.state?.section;
  
  // Expanded states
  const [expandedWeeks, setExpandedWeeks] = useState({});
  
  // Modal and student state
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [studentsAnswered, setStudentsAnswered] = useState([]);
  const [studentsNotAnswered, setStudentsNotAnswered] = useState([]);
  const [loading, setLoading] = useState(false);

  // Expand first week by default
  useEffect(() => {
    setExpandedWeeks({ 0: true });
  }, []);

  const toggleWeekExpand = (weekIdx) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekIdx]: !prev[weekIdx]
    }));
  };

  // Fetch students for the selected activity
  const fetchStudentsForActivity = async (activity, weekIdx) => {
    setLoading(true);
    setStudentsAnswered([]);
    setStudentsNotAnswered([]);
    try {
      const q = query(
        collection(db, 'users'),
        where('section', '==', sectionName),
        where('role', '==', 'student')
      );
      const querySnapshot = await getDocs(q);
      const answered = [];
      const notAnswered = [];
      const activityKey = getActivityKey(activity, weekIdx);
      const isQuiz = activityKey.includes('quiz');
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (isQuiz && data.completedQuizzes && data.completedQuizzes.includes(activityKey)) ||
          (!isQuiz && data.completedActivities && data.completedActivities.includes(activityKey))
        ) {
          answered.push({ id: doc.id, ...data });
        } else {
          notAnswered.push({ id: doc.id, ...data });
        }
      });
      setStudentsAnswered(answered);
      setStudentsNotAnswered(notAnswered);
    } catch (err) {
      // handle error
      setStudentsAnswered([]);
      setStudentsNotAnswered([]);
    }
    setLoading(false);
  };

  const getActivityTypeColor = (activity) => {
    if (activity.toLowerCase().includes('quiz')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="View Scores" />
      <div className="flex">
        {isNavOpen && (
          <div className="w-20 border-r border-white/20 bg-[#141a35]">
            <AdminNavigationBar />
          </div>
        )}
        
        <div className="flex-grow p-6">
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[#141a35]">
                {sectionName ? `${sectionName} - Activities & Scores` : 'Activities & Scores'}
              </h1>
              <button
                onClick={() => navigate('/viewStudentLists', { state: { section: { sectionName: sectionName } } })}
                className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition flex items-center gap-2"
              >
                <span>View Student Lists</span>
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                Click on any activity to view student submissions and scores. 
                Use the accordion to navigate through different weeks.
              </p>
            </div>

            <div className="space-y-4">
              {mockData.map((weekData, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleWeekExpand(idx)}
                  >
                    <h2 className="text-xl font-semibold text-[#141a35]">
                      {weekData.week}
                    </h2>
                    <ChevronDown className={`transition-transform duration-200 ${expandedWeeks[idx] ? 'transform rotate-180' : ''}`} />
                  </div>
                  
                  {expandedWeeks[idx] && (
                    <div className="p-4 divide-y divide-gray-100">
                      {weekData.activities.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity)} border`}>
                              {activity}
                            </span>
                          </div>
                          <button
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                            onClick={() => {
                              setSelectedActivity(activity);
                              setSelectedWeek(weekData.week);
                              setShowModal(true);
                              fetchStudentsForActivity(activity, idx);
                            }}
                          >
                            View Scores
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal for student scores */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all animate-fadeIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedActivity} - {selectedWeek}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600" 
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader className="text-blue-600 animate-spin text-3xl mb-4" />
                <p>Loading student data...</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="text-green-500" />
                    <h4 className="font-semibold text-lg">Completed ({studentsAnswered.length})</h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto border border-gray-200">
                    {studentsAnswered.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No students have completed this activity yet.</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {studentsAnswered.map((student) => (
                          <li key={student.id} className="py-2 flex justify-between items-center">
                            <span>{student.name}</span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Score: {student.activityScores?.[getActivityKey(selectedActivity, 0)] ?? 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <X className="text-red-500" />
                    <h4 className="font-semibold text-lg">Not Completed ({studentsNotAnswered.length})</h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto border border-gray-200">
                    {studentsNotAnswered.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">All students have completed this activity!</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {studentsNotAnswered.map((student) => (
                          <li key={student.id} className="py-2">
                            {student.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* Score Summary Section */}
                <div className="mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg mb-3">
                    <h4 className="font-semibold text-blue-800 mb-1">Score Summary</h4>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="px-3 py-2 bg-white rounded-md shadow-sm flex flex-col">
                        <span className="text-xs text-gray-500">Highest</span>
                        <span className="font-bold text-green-600">
                          {studentsAnswered.length > 0 
                            ? Math.max(...studentsAnswered
                                .map(s => Number(s.activityScores?.[getActivityKey(selectedActivity, 0)] || 0))) 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="px-3 py-2 bg-white rounded-md shadow-sm flex flex-col">
                        <span className="text-xs text-gray-500">Lowest</span>
                        <span className="font-bold text-red-600">
                          {studentsAnswered.length > 0 
                            ? Math.min(...studentsAnswered
                                .filter(s => s.activityScores?.[getActivityKey(selectedActivity, 0)] > 0)
                                .map(s => Number(s.activityScores?.[getActivityKey(selectedActivity, 0)] || 0)) || 0) 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="px-3 py-2 bg-white rounded-md shadow-sm flex flex-col">
                        <span className="text-xs text-gray-500">Average</span>
                        <span className="font-bold text-blue-600">
                          {studentsAnswered.length > 0 
                            ? (studentsAnswered
                                .reduce((acc, s) => acc + Number(s.activityScores?.[getActivityKey(selectedActivity, 0)] || 0), 0) 
                                / studentsAnswered.length).toFixed(1) 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="px-3 py-2 bg-white rounded-md shadow-sm flex flex-col">
                        <span className="text-xs text-gray-500">Completion</span>
                        <span className="font-bold text-purple-600">
                          {studentsAnswered.length + studentsNotAnswered.length > 0 
                            ? Math.round((studentsAnswered.length / (studentsAnswered.length + studentsNotAnswered.length)) * 100) + '%'
                            : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Uploaded Scores</h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      {studentsAnswered.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No scores available for this activity.</p>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Score
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentsAnswered
                              .sort((a, b) => (b.activityScores?.[getActivityKey(selectedActivity, 0)] || 0) - 
                                (a.activityScores?.[getActivityKey(selectedActivity, 0)] || 0))
                              .map((student) => {
                                const score = student.activityScores?.[getActivityKey(selectedActivity, 0)];
                                const scoreNum = Number(score || 0);
                                
                                let statusColor = "text-gray-500";
                                if (scoreNum >= 90) statusColor = "text-green-600";
                                else if (scoreNum >= 75) statusColor = "text-blue-600";
                                else if (scoreNum >= 60) statusColor = "text-yellow-600";
                                else if (scoreNum > 0) statusColor = "text-red-600";
                                
                                return (
                                  <tr key={student.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {student.name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                                      {score ?? 'N/A'}
                                    </td>
                                    <td className={`px-4 py-2 whitespace-nowrap text-sm ${statusColor}`}>
                                      {scoreNum >= 90 ? "Excellent" : 
                                       scoreNum >= 75 ? "Good" :
                                       scoreNum >= 60 ? "Average" :
                                       scoreNum > 0 ? "Needs Improvement" : 
                                       "No Score"}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-4 py-2 bg-[#141a35] hover:bg-[#1f274d] text-white rounded transition-colors"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewScoresPage;
