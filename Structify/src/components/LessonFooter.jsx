import React from 'react'

function LessonFooter({ buttonText, onClick }) {
  return (
    <div className="bg-[#1F274D] py-3 px-6 flex justify-center border-t border-white/100">
    <button 
      onClick={onClick} 
      className="bg-[#516CB4] text-white px-6 py-1 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
    >
      {buttonText}
    </button>
  </div>
  )
}

export default LessonFooter