import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';



import Bullet1 from '../../../assets/images/Lesson3 Image/Week1/Page 2/Bullet 1.png';
import Bullet2 from '../../../assets/images/Lesson3 Image/Week1/Page 2/Bullet 2.png';
import Bullet3 from '../../../assets/images/Lesson3 Image/Week1/Page 2/Bullet 3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';



export default function L3Page2() {

  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path); // navigating to the given path
  }

  // Lesson content stored in an array
  const lessons = [
    {
      description: <>File systems use hierarchical structures like directories.</>,
      image: Bullet1
    },
    {
      description: <>Indexing (e.g., B-Trees) speeds up searches.</>,
      image: Bullet2
    },
    {
      description: <>Fragmentation affects storage efficiency.</>,
      image: Bullet3
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F274D] text-white flex flex-col">
      <Header />
      <SubHeading2 />
      <LessonPages 
        title="File Systems"
        lessons={lessons}  // Pass lessons array
        leftIcon={BigLeftNextIcon}
        rightIcon={BigRightNextIcon}
      />
      <LessonFooter 
      buttonText="Continue"
      onClick={handleClick} 
      path="/l3page3"
      />
    </div>
  );
}

 
