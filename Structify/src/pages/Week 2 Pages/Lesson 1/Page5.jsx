import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week2-1 Images/Lesson1/Page 5/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week2-1 Images/Lesson1/Page 5/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week2-1 Images/Lesson1/Page 5/Bullet 3.png';
import Bullet4 from '../../../assets/images/Week2-1 Images/Lesson1/Page 5/Bullet 4.png';
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
      description: <>Searching Algorithms: Find elements in data (e.g., Binary Search).</>,
      image: Bullet1
    },
    {
      description: <>Sorting Algorithms: Organize elements (e.g., Bubble Sort, Quick Sort).</>,
      image: Bullet2
    },
    {
      description: <>Encryption Algorithms: Secure information (e.g., AES, RSA).</>,
      image: Bullet3
    },
    {
      description: <>Pathfinding Algorithms: Find shortest paths (e.g., Dijkstra’s Algorithm).</>,
      image: Bullet4
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Types of Algorithms"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week2Page6"
      />
    </div>
  );
}

 
