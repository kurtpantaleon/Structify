import React from 'react';
import { useNavigate } from 'react-router-dom';

import LessonFooter from '../../../components/LessonFooter';
import SubHeading2 from '../../../components/SubHeading2';

import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Lesson1 Images/Week1/Page 6/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson1 Images/Week1/Page 6/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson1 Images/Week1/Page 6/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';





export default  function Page6() {

 
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Arrays: Store multiple values in a fixed order.</>,
      image: Bullet1
    },
    {
      description: <>Linked Lists: Use nodes to store elements dynamically.</>,
      image: Bullet2
   
    },
    {
      description: <>Stacks & Queues: Follow specific rules for data insertion and removal.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Common Data Structures"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/page7"
      />
    </div>
  );
}

