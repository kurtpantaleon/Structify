import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/images/Week3-1 Images/Lesson1/Page 2/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week3-1 Images/Lesson1/Page 2/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week3-1 Images/Lesson1/Page 2/Bullet 3.png';

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
      description: <>"Hello, World!" → A common string example in programming.</>,
      image: Bullet1
    },
    {
      description: <>"Kurt" → A person's name stored as a string.</>,
      image: Bullet2
    },
    {
      description: <>"1234" → A number stored as a string, meaning it is treated as text, not a numerical value.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Examples of Strings"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week3Page3"
      />
    </div>
  );
}

 
