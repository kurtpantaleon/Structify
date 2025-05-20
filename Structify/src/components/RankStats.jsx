import React from 'react';
import ProfileIcon from '../assets/images/sample profile.png';
import StatsIcon from '../assets/images/stats.png';
import FireIcon from '../assets/images/fire.png';
import ChallengeIcon from '../assets/images/challngeBg.png';
import ButtonBg from '../assets/images/buttonBg.png';
const scores = [
  { player1: 'Bretana', score1: 1000, player2: 'Vicentuan', score2: 59 },
  { player1: 'Bretana', score1: 960, player2: 'Ramirez', score2: 52 },
  { player1: 'Bretana', score1: 920, player2: 'Aquino', score2: 50 },
];




function RankStats() {
  return (
    <div className="w-2xl  mx-auto  text-white rounded-2xl shadow-xl " style={{ backgroundColor: '#1A2455' }}>
           
          <div className="flex justify-center items-center  flex-row w-full rounded-t-lg h-60"  style={{ backgroundColor: '#445BC1' }}>
                <img
                src={ProfileIcon}
                alt="Wolf Avatar"
                className="w-42 h-40 rounded-full border-4 border-white"
                />
                  <div className="flex flex-col ml-10">

                    <div>
                    <h1 className="text-4xl font-bold">Bretana, Jhonn Michael</h1>
                    <p className="text-sm">BSIT 3-1</p>
                    <p className="text-xs text-blue-200">Introduction to Data Structures</p>
                    </div>
                    
                  
                  
                    {/*rank display*/}
                    <div className="grid grid-cols-2 gap-2 text-center">


                         {/* eeto current rank display */}     

                      <div className='mt-6'>
                        <p className="text-sm">Current Rank</p>
                        <div
                            className="flex justify-center items-center py-2 text-black  bg-no-repeat bg-center "
                            style={{
                              backgroundImage: `url(${StatsIcon})`,
                              backgroundSize: 'contain'
                            }}
                          >
                            
                             <p className="text-lg font-bold flex items-center gap-x-1">
                              <img src={FireIcon} alt="fire" className="w-5 h-5" /> 3000
                            </p>
                         </div>
                      </div>
                       
                         {/* eto highest rank display */}     
                        <div className='mt-6'>
                        <p className="text-sm">Highest Rank</p>
                        <div
                            className="flex justify-center items-center py-2 text-black  bg-no-repeat bg-center "
                            style={{
                              backgroundImage: `url(${StatsIcon})`,
                              backgroundSize: 'contain',
                            }}
                          >
                            
                             <p className="text-lg font-bold flex items-center gap-x-1">
                              <img src={FireIcon} alt="fire" className="w-5 h-5" /> 10000
                            </p>
                         </div>
                      </div>

                    </div>
                  </div>
                </div>

                    {/* top Score */}
                    <h2 className="mt-6 text-2xl font-bold text-center">My Best Scores</h2>
                 <div className=" flex flex-col justify-center items-center gap-4 mt-6">
                    {scores.map((s, i) => (
                      <div
                        key={i}
                        className="relative w-150 flex justify-evenly  items-center p-4 rounded-xl text-white overflow-hidden
                                  bg-center bg-no-repeat bg-cover ring-2 ring-blue-400 shadow-xl"
                        style={{ backgroundImage: `url(${ChallengeIcon})` }}
                      >
                        {/* Shine effect */}
                        <div className="absolute top-0 left-[-75%] w-[80%] h-full bg-white/20 rotate-[25deg] animate-shine" />

                        {/* Left Player  */}
                        <div className="z-10 text-left">
                          <p className="font-bold text-2xl text-blue-200 drop-shadow">{s.player1}</p>
                          <p className="flex items-center gap-1 text-lg">
                            <img src={FireIcon} alt="fire" className="w-4 h-4" />
                            {s.score1}
                          </p>
                        </div>

                        {/* Right Player */}
                        <div className="z-10 text-right">
                          <p className="font-bold text-2xl text-red-200 drop-shadow">{s.player2}</p>
                          <p className="flex items-center gap-1 text-lg">
                            <img src={FireIcon} alt="fire" className="w-4 h-4" />
                            {s.score2}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                      <div className="flex justify-center items-center p-3">
                        <button
                          className=" w-90 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-x-2
                                    shadow-lg shadow-blue-600/40 hover:shadow-blue-600/70 transition duration-300 ease-in-out
                                    hover:scale-105 bg-no-repeat"
                          style={{
                            backgroundImage: `url(${ButtonBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                        
                          Code Challenge
                        </button>
                      </div>
      
    </div>
  );
}

export default RankStats;
