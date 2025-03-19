import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 7/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 7/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 7/Bullet 3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function Page7() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Used in search engines to organize web pages.</>,
      image: Bullet1
    },
    {
      description: <>Used in artificial intelligence (AI) for decision-making.</>,
      image: Bullet2
    },
    {
      description: <>Used in databases to organize records efficiently.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Applications of Trees"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week10Page8"
      />
    </div>
  );
}

 
