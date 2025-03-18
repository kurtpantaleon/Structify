import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Week2-1 Images/Lesson1/Page 6/Bullet 1.png';
import Bullet2 from '../../../assets/images/Week2-1 Images/Lesson1/Page 6/Bullet 2.png';
import Bullet3 from '../../../assets/images/Week2-1 Images/Lesson1/Page 6/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';



export default function Page6() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Input: The data the algorithm receives.</>,
      image: Bullet1
    },
    {
      description: <>Processing: The operations performed on the data.</>,
      image: Bullet2
    },
    {
      description: <>Output: The final result after processing.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Algorithm Structure"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/week2Page7"
      />
    </div>
  );
}

 
