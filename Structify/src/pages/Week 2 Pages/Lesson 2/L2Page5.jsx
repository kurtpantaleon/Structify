import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week2-2 Images/Lesson2/Page 5/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week2-2 Images/Lesson2/Page 5/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week2-2 Images/Lesson2/Page 5/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function L2Page5() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Best Case: Algorithm runs in the least time possible.</>,
      image: Bullet1
    },
    {
      description: <>Worst Case: Algorithm runs in the most time possible.</>,
      image: Bullet2
    },
    {
      description: <>Average Case: The expected running time.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Best, Worst, and Average Case Scenarios:"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week2L2Page6"
      />
    </div>
  );
}

 
