// Gamified Leaderboard UI (Fixed Row Podium Left, Scrollable Table Right)
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import { db } from '../services/firebaseConfig';
import Header from '../components/AdminHeader';
import Goldrank from '../assets/images/Gold Rank.png';
import Silverrank from '../assets/images/Silver Rank.png';
import Bronzerank from '../assets/images/Bronze Rank.png';
import fire from '../assets/images/fire.png';
import profile from '../assets/images/sample profile.png';
import exit from '../assets/images/X Icon.png';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { useWindowSize } from 'react-use';

function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchSections = async () => {
      const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const allSections = snapshot.docs.map(doc => doc.data().section);
      const uniqueSections = [...new Set(allSections.filter(Boolean))];
      setSections(uniqueSections);
      if (uniqueSections.length > 0) {
        setSelectedSection(uniqueSections[0]);
      }
    };
    fetchSections();
  }, []);

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
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
    });

    return () => unsubscribe();
  }, [selectedSection]);

  const topThree = [students[1], students[0], students[2]];
  const rankImages = [Silverrank, Goldrank, Bronzerank];

  return (
    <div className="bg-[#0e1344] min-h-screen text-white relative overflow-hidden font-sans">
      <Header />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Confetti
          width={width}
          height={height}
          numberOfPieces={50}
          gravity={0.25}
          colors={["#f87171", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa"]}
          recycle={true}
        />
      </div>

      <div className="pt-6 px-4 pb-6 relative z-10">
        <div className="absolute top-6 right-6">
          <button onClick={() => navigate(-1)} className="bg-[#1c2b6c] rounded-full p-1 shadow-lg hover:scale-105 transition">
            <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {celebrate && <Confetti numberOfPieces={10} recycle={false} />}

        <div className="pt-10 text-center text-5xl text-yellow-300 font-bold tracking-widest mb-6">
          🏆 LEADER BOARD 🏆
        </div>

        <div className="flex justify-center mb-8">
          <select
            className="bg-[#141a35] text-white p-2 rounded border border-white pr-3"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ textAlignLast: 'center' }}
          >
            {sections.map((section, idx) => (
              <option key={idx} value={section}>{section}</option>
            ))}
          </select>
        </div>

        <div className="flex items-start justify-evenly  gap-10">
          {/* Fixed Podium Row Always Render 3 */}
          <div className="sticky top-32 min-w-[560px] max-w-[560px] flex justify-center gap-8 z-10">
            {[0, 1, 2].map((order) => {
              const student = topThree[order];
              const isAvailable = student && student.name;
              return (
                <motion.div
                  key={order}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center p-0 w-44 h-fit "
                >
                  <div className="relative w-50">
                    <img src={rankImages[order]} alt="rank" className="w-full h-auto" />
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      <img src={profile} alt="avatar" className="w-16 h-16 rounded-full border-4 border-white mb-1" />
                      <div className="text-center text-sm font-bold whitespace-nowrap">
                        {isAvailable ? student.name : 'Unranked'}
                      </div>
                      <div className="text-xs mt-1 bg-red-500 px-2 py-1 rounded-full flex items-center justify-center gap-1">
                        <img src={fire} alt="fire" className="w-4 h-4" />
                        {isAvailable ? student.rankPoints : 0}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scrollable Table with Blue Scrollbar */}
          <div className="w-full max-w-lg bg-[#1e245e] rounded-2xl p-4 max-h-[70vh] overflow-y-auto scrollbar-blue">
            <div className="flex text-white text-base font-bold mb-4 border-b border-white pb-2">
              <div className="w-1/4 text-center">RANK</div>
              <div className="w-1/2 text-center">NAME</div>
              <div className="w-1/4 text-center">SCORE</div>
            </div>
            <div className="space-y-2">
              {students.map((student, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center text-sm py-2 px-4 rounded-xl transition-transform duration-200 ease-in-out ${index < 3 ? 'bg-gradient-to-r from-[#4c51bf] to-[#6b46c1]' : 'bg-[#2d356c] hover:bg-[#3a418c]'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-1/4 text-center font-bold">
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                    <div className="flex items-center  gap-2 text-left pl-2 ml-15 w-full">
                    <img src={profile} alt="profile" className="w-7 h-7 rounded-full border-2 border-white" />
                    <span className="font-semibold text-white text-sm truncate text-left w-full">{student.name}</span>
                  </div>

                  <div className="w-1/4 text-center text-yellow-300 font-extrabold text-sm">{student.rankPoints}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
