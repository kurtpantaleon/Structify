import React, { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

function LessonFooter({ buttonText, onClick, path = '#', disabled = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleClick = async () => {
    if (disabled || isLoading || isSuccess) return;
    
    setIsLoading(true);
    
    try {
      // Call the onClick handler and capture the result
      const result = onClick(path);
      
      // If it's a promise, wait for it to resolve
      if (result instanceof Promise) {
        await result;
        
        // Show success state briefly
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gradient-to-t from-[#182042] to-[#1F274D] py-4 sm:py-5 px-4 sm:px-6 md:px-8 flex justify-center items-center border-t border-indigo-900/40 shadow-inner">
      <div className="w-full sm:w-auto max-w-xs relative">
        {/* Glow effect behind button */}
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full transform scale-90 opacity-70"></div>
        
        <button
          onClick={handleClick}
          disabled={disabled || isLoading}
          className={`relative w-full bg-gradient-to-r 
            ${isSuccess ? 'from-emerald-500 to-green-600' : 'from-blue-500'}
            text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 
            rounded-xl shadow-lg transition-all duration-300
            ${!disabled && !isLoading && !isSuccess ? 'hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0' : ''}
            ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-[#1F274D]`}
          aria-label={buttonText}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>{buttonText}</span>
            
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSuccess ? (
              <Check className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            )}
          </div>
          
          {/* Animated border effect */}
          <span className={`absolute inset-0 rounded-xl border-2 border-white/30 
            ${!disabled && !isLoading ? 'group-hover:border-white/50' : ''} 
            transition-all duration-300`}></span>
        </button>
      </div>
      
     
    </div>
  );
}

export default LessonFooter;