import React from 'react';
import { useNavigate } from 'react-router-dom';

import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';



import Bullet1 from '../../../assets/images/Lesson3 Image/Week1/Page 7/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson3 Image/Week1/Page 7/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson3 Image/Week1/Page 7/Bullet 3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';



export default function L3Page7() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Arrays: Store names sequentially for lookup.</>,
      image: Bullet1
    },
    {
      description: <>Hashing: Maps names to memory for faster access.</>,
      image: Bullet2
    },
    {
      description: <>Hash tables reduce search time.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Searching for contacts in a phone directory"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/l3page8"
      />
    </div>
  );
}

 
