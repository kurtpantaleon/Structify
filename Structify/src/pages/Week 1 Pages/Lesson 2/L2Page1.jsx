import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';
import CodeExampleLesson from '../../../components/CodeExampleLesson';

import Bullet1 from '../../../assets/image/Lesson2.1/image1.png';
import Bullet2 from '../../../assets/image/Lesson2.1/image2.png';
import Bullet3 from '../../../assets/image/Lesson2.1/image3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';

import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // For navigation between pages

export default function L2Page1() {
  const navigate = useNavigate(); // Hook to trigger route changes
  const [currentIndex, setCurrentIndex] = useState(0); // Track current lesson index

  // Array code example for slide 3
  const arrayCodeExample = [
    {
      javascript: `// Array Example\nconst scores = [98, 87, 92, 75, 88];\n\n// Accessing elements\nconsole.log(scores[0]); // Output: 98\n\n// Adding a score\nscores.push(100);\n\n// Removing the last score\nscores.pop();\n\n// Looping through scores\nscores.forEach(score => console.log(score));`,
      python: `# Array Example\nscores = [98, 87, 92, 75, 88]\n\n# Accessing elements\nprint(scores[0])  # Output: 98\n\n# Adding a score\nscores.append(100)\n\n# Removing the last score\nscores.pop()\n\n# Looping through scores\nfor score in scores:\n    print(score)`,
      cpp: `// Array Example\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> scores = {98, 87, 92, 75, 88};\n    // Accessing elements\n    cout << scores[0] << endl; // Output: 98\n    // Adding a score\n    scores.push_back(100);\n    // Removing the last score\n    scores.pop_back();\n    // Looping through scores\n    for (int score : scores) {\n        cout << score << endl;\n    }\n    return 0;\n}`
    }
  ];

  // Lesson content stored in an array
  const lessons = [
    {
      description: (
        <>
          Arrays are a{' '}
          <span className="font-extrabold text-yellow-400 animate-pulse">
            list of items stored in a specific order.
          </span>{' '}
        </>
      ),
      mediaType: 'image',
      image: Bullet1,
    },
    {
      description: (
        <>
          In Array each element has an  {' '}
          <span className="font-extrabold text-green-400 animate-pulse">
            index
          </span>{' '}
          (position).
        </>
      ),
      mediaType: 'image',
      image: Bullet2,
    },
    {
      description: (
        <>
          <span className="font-extrabold text-blue-400 animate-pulse">
            Code Example:
          </span>{' '}
          Storing the top 5 student scores.
        </>
      ),
      mediaType: 'code',
      image: null,
    }
  ];

  // Move to next lesson if not last
  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Move to previous lesson if not first
  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
      <Header />

      {/* Top bar with navigation arrows + progress bar */}
      <SubHeading2
        progress={currentIndex + 1} // 1-based progress index
        totalSteps={lessons.length}
        exitPath="/mainPage"
        onNext={nextLesson}
        onPrev={prevLesson}
      />

      {/* Lesson content area */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-4 animate-fade-in">
        {currentIndex < 2 ? (
          <LessonPages
            title={
              <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">
                Types of Basic Data Structures
              </span>
            }
            lessons={lessons}
            currentIndex={currentIndex}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            leftIcon={BigLeftNextIcon}
            rightIcon={BigRightNextIcon}
          />
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <CodeExampleLesson
              title={<span className="text-3xl font-black text-center text-blue-400 drop-shadow-md">Array Example</span>}
              description={"How to store and access values in an array."}
              codeExamples={arrayCodeExample}
              currentIndex={0}
              nextLesson={nextLesson}
              prevLesson={prevLesson}
              leftIcon={BigLeftNextIcon}
              rightIcon={BigRightNextIcon}
            />
          </div>
        )}
      </div>

      {/* Conditionally render the footer button when at last lesson */}
      {currentIndex === lessons.length - 1 && (
        <LessonFooter
          buttonText="Continue"
          onClick={() => navigate('/l2page2')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        />
      )}
    </div>
  );
}

 
