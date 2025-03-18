import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week2-1 Images/Lesson1/Page 1/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week2-1 Images/Lesson1/Page 1/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week2-1 Images/Lesson1/Page 1/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function Page1() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>An algorithm is a step-by-step process used to solve a problem.</>,
      image: Bullet1
    },
    {
      description: <>It is a set of instructions that tell a computer how to accomplish a task.</>,
      image: Bullet2
    },
    {
      description: <>Algorithms are used in search engines, games, banking systems, and more.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="What is an Algorithm?"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week2Page2"
      />
    </div>
  );
}

 
