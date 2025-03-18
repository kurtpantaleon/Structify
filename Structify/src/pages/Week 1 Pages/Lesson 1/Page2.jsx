import React from 'react';
import { useNavigate } from 'react-router-dom';

import LessonFooter from '../../../components/LessonFooter';
import SubHeading2 from '../../../components/SubHeading2';

import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Lesson1 Images/Week1/Page 2/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson1 Images/Week1/Page 2/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson1 Images/Week1/Page 2/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';





export default  function Page2() {

 
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>Without data structures, storing and retrieving information would be <span className='font-bold'> slow and inefficient.</span></>,
      image: Bullet1
      
    },
    {
      description: <>Imagine looking for a book in a <span className='font-bold'>messy pile vs. a well-organized bookshelf.</span> </>,
      image: Bullet2
   
    },
    {
      description: <>Computers rely on <span className='font-bold'>optimized data structures</span>  to handle searches, sorting, and storage operations efficiently.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="Why are Data Structures Important?"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/page3"
      />
    </div>
  );
}

