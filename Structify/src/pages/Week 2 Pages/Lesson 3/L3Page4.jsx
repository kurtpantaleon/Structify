import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week2-3 Images/Lesson3/Page 4/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week2-3 Images/Lesson3/Page 4/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week2-3 Images/Lesson3/Page 4/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function L3Page4() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Step 1: [1, 3, 4, 2]</>,
      image: Bullet1
    },
    {
      description: <>Step 2: [0, 3, 6, 5]</>,
      image: Bullet2
    },
    {
      description: <>Step 3: [0, 3, 5, 6]</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Step-by-Step Example: Sorting [6, 0, 3, 5]"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week2L3Page5"
      />
    </div>
  );
}

 
