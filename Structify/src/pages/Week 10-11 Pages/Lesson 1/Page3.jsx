import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 3/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 3/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 3/Bullet 3.png';
import Bullet4 from '../../../assets/images/Week10&11-1 Images/Lesson1/Page 3/Bullet 4.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function Page3() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Root: The top node of a tree.</>,
      image: Bullet1
    },
    {
      description: <>Parent & Child Nodes: Nodes are connected in a parent-child relationship.</>,
      image: Bullet2
    },
    {
      description: <>Leaf Node: A node without children.</>,
      image: Bullet3
    },
    {
      description: <>Subtree: A smaller tree that is part of a larger tree.</>,
      image: Bullet4
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Tree Terminology"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path=""
      />
    </div>
  );
}

 
