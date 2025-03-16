import React from 'react'

function LearningPath() {
const weeks = [
    { week: "Week 1", topic: "Introduction to Data Structures" },
    { week: "Week 2", topic: "Algorithms & Complexity" },
    { week: "Week 3", topic: "String Processing" },
    { week: "Week 4 & 5", topic: "Array, Records, and Pointers" },
    { week: "Week 6", topic: "Linked Lists" },
    { week: "Week 7 & 8", topic: "Stacks, Queues, and Recursion" },
    { week: "Week 10 & 11", topic: "Trees" },
    { week: "Week 12 & 13", topic: "Graph Algorithms" },
    { week: "Week 14 to 16", topic: "Sorting and Searching" },
    { week: "Week 17", topic: "Hashing" },
    ];
  return (
    <div className="w-100 bg-[#1F274D] text-white border-l border-white/100 p-4">
    {/* Header */}
    <div className="flex items-center justify-between mb-2">
      <h2 className="font-bold text-lg">Learning Path</h2>
      <p className="right-0 text-xs">0/17</p>
    </div>

    {/* Progress Bar */}
    <div className="w-full bg-gray-700 h-2 rounded-full relative mb-4">
      <div className="bg-white h-2 rounded-full w-1/5"></div>
    </div>

    {/* List of Weeks */}
    <div className="space-y-3">
      {weeks.map((item, index) => (
        <button
          key={index}
          className="w-full px-3 py-3 bg-[#020B4A] rounded-lg border border-white/40 text-center cursor-pointer"
        >
          <span className="font-bold text-md">{item.week}</span>
          <p className="text-s">{item.topic}</p>
        </button>
      ))}
    </div>
  </div>
  )
}

export default LearningPath