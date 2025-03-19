import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/images/Week4-1 Images/Lesson1/Page 2/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week4-1 Images/Lesson1/Page 2/Bullet 2.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function Page2() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Think of an array like a <span className="font-bold">row of lockers</span>  where each locker has a <span className="font-bold">unique number</span> (index).</>,
      image: Bullet1
    },
    {
      description: <>The first locker is <span className="font-bold">index 0</span>, the second is <span className="font-bold">index 1</span>, and so on.</>,
      image: Bullet2
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Real-Life Analogy"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week4Page3"
      />
    </div>
  );
}

 
