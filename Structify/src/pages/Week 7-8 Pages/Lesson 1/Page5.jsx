import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/images/Week7&8-1 Images/Lesson1/Page 5/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week7&8-1 Images/Lesson1/Page 5/Bullet 2.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function Page5() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Every time a function is called, a new frame is pushed onto the call stack.</>,
      image: Bullet1
    },
    {
      description: <>When the function completes, the frame is popped from the stack.</>,
      image: Bullet2
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Stack in Function Calls (Call Stack)"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week7Page6"
      />
    </div>
  );
}

 
