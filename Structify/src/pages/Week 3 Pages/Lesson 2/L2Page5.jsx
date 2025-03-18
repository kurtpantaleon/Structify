import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week3-2 Images/Lesson2/Page 5/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week3-2 Images/Lesson2/Page 5/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week3-2 Images/Lesson2/Page 5/Bullet 3.png';
import Bullet4 from '../../../assets/images/Week3-2 Images/Lesson2/Page 5/Bullet 4.png';

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
      description: <>toUpperCase() → "hello".toUpperCase() → "HELLO"</>,
      image: Bullet1
    },
    {
      description: <>toLowerCase() → "HELLO".toLowerCase() → "hello"</>,
      image: Bullet2
    },
    {
      description: <>replace() → "hello".replace("l", "z") → "hezzo"</>,
      image: Bullet3
    },
    {
      description: <>split() → "apple,banana".split(",") → ["apple", "banana"]</>,
      image: Bullet4
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Common String Methods"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week3L2Page6"
      />
    </div>
  );
}

 
