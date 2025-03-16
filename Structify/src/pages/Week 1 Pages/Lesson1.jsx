import React from 'react';
import SubHeading2 from '../../components/SubHeading2';
import Header from '../../components/Header';
import LessonPages from '../../components/LessonPages';
import Bullet1 from '../../assets/images/Lesson1 Images/Week1/Page 1/Bullet 1.png';
import BigLeftNextIcon from '../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../components/LessonFooter';

function Lesson1() {
  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="What is Data Structure?"
        description={
          <>
            A data structure is a way to  <span className="font-bold">store and organize data efficiently</span> so that it can be used effectively.
          </>
        }
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
        lessonImage={Bullet1}
      />
      <LessonFooter buttonText="Continue"/>
    </div>
  )
}

export default Lesson1