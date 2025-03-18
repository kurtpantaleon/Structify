import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';



import Bullet1 from '../../../assets/images/Lesson2 Images/Week1/Page 3/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson2 Images/Week1/Page 3/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson2 Images/Week1/Page 3/Bullet 3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';



export default function L2Page3() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Works like a line of people waiting at a bank.</>,
      image: Bullet1
    },
    {
      description: <>(FIFO - First In, First Out) The first person in line is served first.</>,
      image: Bullet2
    },
    {
      description: <>Code Example: Browser back button history.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="STACKS"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/L3page1"
      />
    </div>
  );
}

 
