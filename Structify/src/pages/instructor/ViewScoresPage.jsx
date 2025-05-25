import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/AdminHeader';
import AdminSubHeading from '../../components/AdminSubHeading';
import AdminNavigationBar from '../../components/InstructorNavigationBar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

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

  // Modal and student state
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [studentsAnswered, setStudentsAnswered] = useState([]);
  const [studentsNotAnswered, setStudentsNotAnswered] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="View Scores" />
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-7 bg-white p-6 rounded-lg shadow h-[75vh] flex flex-col">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/viewStudentLists', { state: { section: { sectionName: sectionName } } })}
            className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
          >
            View Student Lists
          </button>
        </div>

        <div className="overflow-y-auto m-4 pr-6 space-y-6 flex-grow">
          {mockData.map((weekData, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-[#141a35] mb-2 py-1 border-b">
                {weekData.week}
              </h2>
              {weekData.activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-none"
                >
                  <span className="text-md text-[#141a35]">{activity}</span>
                  <button
                    className="text-sm font-medium text-blue-700 hover:underline cursor-pointer"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowModal(true);
                      fetchStudentsForActivity(activity, idx);
                    }}
                  >
                    View Scores
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for students who answered the activity */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm">
            <h3 className="text-lg font-bold mb-3">Students who answered {selectedActivity}</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <h4 className="font-semibold mb-2">Answered:</h4>
                <ul>
                  {studentsAnswered.length === 0 ? (
                    <li>No students found.</li>
                  ) : (
                    studentsAnswered.map((student) => (
                      <li key={student.id} className="py-1 border-b border-gray-200">
                        {student.name} — Score: {student.activityScores?.[getActivityKey(selectedActivity, 0)] ?? 'N/A'}
                      </li>
                    ))
                  )}
                </ul>
                <hr className="my-3" />
                <h4 className="font-semibold mb-2">Did not answer:</h4>
                <ul>
                  {studentsNotAnswered.length === 0 ? (
                    <li>All students answered.</li>
                  ) : (
                    studentsNotAnswered.map((student) => (
                      <li key={student.id} className="py-1 border-b border-gray-200">
                        {student.name}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewScoresPage;
