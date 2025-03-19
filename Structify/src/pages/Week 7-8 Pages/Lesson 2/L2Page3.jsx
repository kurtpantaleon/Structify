import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/images/Week7&8-2 Images/Lesson2/Page 3/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week7&8-2 Images/Lesson2/Page 3/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week7&8-2 Images/Lesson2/Page 3/Bullet 3.png';
import Bullet4 from '../../../assets/images/Week7&8-2 Images/Lesson2/Page 3/Bullet 4.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';

export default function L2Page3() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Enqueue: Adds an element to the back of the queue.</>,
      image: Bullet1
    },
    {
      description: <>Dequeue: Removes an element from the front of the queue.</>,
      image: Bullet2
    },
    {
      description: <>Peek: Retrieves the top element without removing it.</>,
      image: Bullet3
    },
    {
      description: <>isEmpty: Checks if the stack is empty.</>,
      image: Bullet4
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Basic Operations of a Queue"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week7L2Page4"
      />
    </div>
  );
}

 
