import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week7&8-3 Images/Lesson3/Page 6/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week7&8-3 Images/Lesson3/Page 6/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week7&8-3 Images/Lesson3/Page 6/Bullet 3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function L3Page6() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Solving mathematical problems (e.g., factorial, Fibonacci sequence).</>,
      image: Bullet1
    },
    {
      description: <>Tree and graph traversals (e.g., file system navigation).</>,
      image: Bullet2
    },
    {
      description: <>Backtracking algorithms (e.g., maze solving, Sudoku solving).</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Applications of Recursion"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week7L3Page7"
      />
    </div>
  );
}

 
