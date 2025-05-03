import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import { db } from '../services/firebaseConfig';
import Header from '../components/AdminHeader';
import Goldrank from '../assets/images/Gold Rank.png';
import fire from '../assets/images/fire.png';
import profile from '../assets/images/sample profile.png';
import exit from '../assets/images/X Icon.png';

function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const navigate = useNavigate(); // 🆕 Initialize navigate

  // 🔄 Fetch unique sections on initial load
  useEffect(() => {
    const fetchSections = async () => {
      const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const allSections = snapshot.docs.map(doc => doc.data().section);
      const uniqueSections = [...new Set(allSections.filter(Boolean))];
      setSections(uniqueSections);
      if (uniqueSections.length > 0) {
        setSelectedSection(uniqueSections[0]); // set default
      }
    };

    fetchSections();
  }, []);

  // 🔁 Fetch leaderboard data based on selected section
  useEffect(() => {
    if (!selectedSection) return;

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('section', '==', selectedSection),
      orderBy('rankPoints', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          rankPoints: docData.rankPoints ?? 0,
        };
      });
      setStudents(data);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
    });

    return () => unsubscribe();
  }, [selectedSection]);

  const topThree = students.slice(0, 3);
  const others = students.slice(3);

  return (
    <div className="bg-[#0e1344] min-h-screen text-white">
      <Header />
      
      {/* 🔙 Exit Button */}
      <div className="flex justify-end m-7">
        <button
            onClick={() => navigate(-1)}
            className="z-10"
          >
            <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer" />
        </button>
      </div>

      {/* 🔽 Section Selector */}
      <div className="flex justify-center mt-6">
        <select
          className="bg-[#141a35] text-white px-4 py-2 rounded border border-white"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {sections.map((section, idx) => (
            <option key={idx} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mt-8">
        {topThree.map((student, index) => (
          <div key={index} className="relative w-36 text-center">
            <img src={Goldrank} alt="gold badge" className="w-full" />
            <img src={profile} alt="profile" className="w-16 h-16 rounded-full mx-auto mt-[-42px]" />
            <p className="font-bold mt-2">{student.name}</p>
            <div className="flex justify-center items-center gap-1 text-sm text-red-500">
              <img src={fire} alt="fire icon" className="w-4 h-4" />
              {student.rankPoints}
            </div>
            <p className="text-xs text-white mt-1">&lt;/&gt;</p>
          </div>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="max-w-md mx-auto mt-10 space-y-4">
        {others.map((student, idx) => (
          <div key={idx} className="flex justify-between items-center bg-blue-900 px-4 py-2 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <span className="font-bold w-5 text-white text-right">{idx + 4}</span>
              <img src={profile} alt="profile" className="w-8 h-8 rounded-full" />
              <span className="font-medium">{student.name}</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <img src={fire} alt="fire" className="w-4 h-4" />
              {student.rankPoints}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;