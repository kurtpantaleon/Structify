import React from 'react';
import { useNavigate } from 'react-router-dom';

import LessonFooter from '../../../components/LessonFooter';
import SubHeading2 from '../../../components/SubHeading2';

import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Lesson1 Images/Week1/Page 5/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson1 Images/Week1/Page 5/Bullet 2.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';





export default  function Page5() {

 
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Without structure: Searching through scattered data is slow.</>,
      image: Bullet1
    },
    {
      description: <>With structure: Searching through an indexed list is fast and efficient.</>,
      image: Bullet2
   
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Comparison: Messy vs. Well-Organized Data"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/page6"
      />
    </div>
  );
}

