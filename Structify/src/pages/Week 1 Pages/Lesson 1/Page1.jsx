import React from 'react';
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/images/Lesson1 Images/Week1/Page 1/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson1 Images/Week1/Page 1/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson1 Images/Week1/Page 1/Bullet 3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';

function Page1() {
  // Lesson content stored in an array
  const lessons = [
    {
      description: <>A data structure is a way to <span className="font-bold">store and organize data efficiently</span> so that it can be used effectively.</>,
      image: Bullet1
    },
    {
      description: <>Computers process <span className="font-bold">massive amounts of data every second</span>, so efficient organization is essential.</>,
      image: Bullet2
    },
    {
      description: <>Just like drawers organize clothes, <span className="font-bold">data structures help organize and manage information in a structured way</span>.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="What is Data Structure?"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter buttonText="Continue"/>
    </div>
  );
}

export default Page1;
