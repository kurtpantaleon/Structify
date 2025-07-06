import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Header from './Header';
import SubHeading2 from './SubHeading2';
import LessonPages from './LessonPages';
import LessonFooter from './LessonFooter';
import BigLeftNextIcon from '../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../assets/images/Big Right Next Icon.png';
import { X } from 'lucide-react';

export default function StructifyLessonTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'structifyLessons', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLesson(docSnap.data());
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const nextSlide = () => {
    if (lesson && currentIndex < lesson.lessons.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }
  if (!lesson) return null;

  // Prepare slides for LessonPages
  const slides = lesson.lessons.map((slide) => ({
    description: <span>{slide.description}</span>,
    mediaType: slide.mediaType,
    image: slide.image?.url || null,
    video: slide.image?.type?.startsWith('video/') ? slide.image?.url : null
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
      <Header />
      <button
        onClick={() => navigate(-1)}
        className="absolute top-24 right-8 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        title="Exit"
      >
        <X size={28} />
      </button>
      <div className="flex-grow flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 py-4 sm:py-6 overflow-y-auto">
        <LessonPages
          title={
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-center text-teal-400 drop-shadow-md">
              {lesson.title}
            </span>
          }
          lessons={slides}
          currentIndex={currentIndex}
          nextLesson={nextSlide}
          prevLesson={prevSlide}
          leftIcon={BigLeftNextIcon}
          rightIcon={BigRightNextIcon}
        />
      </div>
      {currentIndex === slides.length - 1 && (
        <LessonFooter
          buttonText="Continue"
          onClick={() => navigate('/mainPage')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-sm sm:text-base md:text-lg font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 mx-auto mb-4 sm:mb-6"
        />
      )}
    </div>
  );
}
