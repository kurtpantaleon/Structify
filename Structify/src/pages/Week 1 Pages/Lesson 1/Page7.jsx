import React from 'react';
import { useNavigate } from 'react-router-dom';

import LessonFooter from '../../../components/LessonFooter';
import SubHeading2 from '../../../components/SubHeading2';

import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Lesson1 Images/Week1/Page 7/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson1 Images/Week1/Page 7/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson1 Images/Week1/Page 7/Bullet 3.png';
import Bullet4 from '../../../assets/images/Lesson1 Images/Week1/Page 7/Bullet 4.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';





export default  function Page7() {

 
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Fast access? → Use an Array.</>,
      image: Bullet1
    },
    {
      description: <>Frequent additions/removals? → Use a Linked List.</>,
      image: Bullet2
   
    },
    {
      description: <>Undo functionality? → Use a Stack (LIFO).</>,
      image: Bullet3
    },
    {
      description: <>Processing requests? → Use a Queue (FIFO).</>,
      image: Bullet4
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="When to Use Different Data Structures"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/page8"
      />
    </div>
  );
}

