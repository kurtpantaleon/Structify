import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import StartPage from './pages/Start'
import Login from './pages/Login'
import { useContext } from 'react'
import { AuthContext } from './context/authContext'

/*WEEK 1 */
import MainPage from './pages/student/MainPage'
{/*Week 1 Activities */}
import Week1Activity1 from './pages/Week 1 Pages/Activities Week 1/Activity1'
import Week1Activity2 from './pages/Week 1 Pages/Activities Week 1/Activity2'
import Week1Activity3 from './pages/Week 1 Pages/Activities Week 1/Activity3'
{/*Week 1 quiz */}
import QuizWeek1 from './pages/Week 1 Pages/Quiz Week 1/quizWeek1'
{/*Week 1 Lesson 1 */}
import Page1 from './pages/Week 1 Pages/Lesson 1/Page1'
import Page2 from './pages/Week 1 Pages/Lesson 1/Page2'
import Page3 from './pages/Week 1 Pages/Lesson 1/Page3'
import Page4 from './pages/Week 1 Pages/Lesson 1/Page4'
import Page5 from './pages/Week 1 Pages/Lesson 1/Page5'
import Page6 from './pages/Week 1 Pages/Lesson 1/Page6' 
import Page7 from './pages/Week 1 Pages/Lesson 1/Page7'
import Page8 from './pages/Week 1 Pages/Lesson 1/Page8'
{/*Week 1 Lesson 2 */}
import L2Page1 from './pages/Week 1 Pages/Lesson 2/L2Page1'
import L2Page2 from './pages/Week 1 Pages/Lesson 2/L2Page2'
import L2Page3 from './pages/Week 1 Pages/Lesson 2/L2Page3'
{/*Week 1 Lesson 3 */}
import L3Page1 from './pages/Week 1 Pages/Lesson 3/L3Page1'
import L3Page2 from './pages/Week 1 Pages/Lesson 3/L3Page2'
import L3Page3 from './pages/Week 1 Pages/Lesson 3/L3Page3'
import L3Page4 from './pages/Week 1 Pages/Lesson 3/L3Page4'
import L3Page5 from './pages/Week 1 Pages/Lesson 3/L3Page5'
import L3Page6 from './pages/Week 1 Pages/Lesson 3/L3Page6'
import L3Page7 from './pages/Week 1 Pages/Lesson 3/L3Page7'
import L3Page8 from './pages/Week 1 Pages/Lesson 3/L3Page8'

/*WEEK 2  */
import Week2 from './pages/student/Week2Page'
{/*Week 2 Activities */}
import Week2Activity1 from './pages/Week 2 Pages/Activities Week 2/Activity1'
import Week2Activity2 from './pages/Week 2 Pages/Activities Week 2/Activity2'
import Week2Activity3 from './pages/Week 2 Pages/Activities Week 2/Activity3'
{/*Week 2 quiz */}
import QuizWeek2 from './pages/Week 2 Pages/Quiz Week 2/quizWeek2'
{/*Week 2 Lesson 1 */}
import Week2Page1 from './pages/Week 2 Pages/Lesson 1/Page1'
import Week2Page2 from './pages/Week 2 Pages/Lesson 1/Page2'
import Week2Page3 from './pages/Week 2 Pages/Lesson 1/Page3'
import Week2Page4 from './pages/Week 2 Pages/Lesson 1/Page4'
import Week2Page5 from './pages/Week 2 Pages/Lesson 1/Page5'
import Week2Page6 from './pages/Week 2 Pages/Lesson 1/Page6'
import Week2Page7 from './pages/Week 2 Pages/Lesson 1/Page7'
import Week2Page8 from './pages/Week 2 Pages/Lesson 1/Page8'
{/*Week 2 Lesson 2 */}
import Week2L2Page1 from './pages/Week 2 Pages/Lesson 2/L2Page1'
import Week2L2Page2 from './pages/Week 2 Pages/Lesson 2/L2Page2'
import Week2L2Page3 from './pages/Week 2 Pages/Lesson 2/L2Page3'
import Week2L2Page4 from './pages/Week 2 Pages/Lesson 2/L2Page4'
import Week2L2Page5 from './pages/Week 2 Pages/Lesson 2/L2Page5'
import Week2L2Page6 from './pages/Week 2 Pages/Lesson 2/L2Page6'
import Week2L2Page7 from './pages/Week 2 Pages/Lesson 2/L2Page7'
import Week2L2Page8 from './pages/Week 2 Pages/Lesson 2/L2Page8'
{/*Week 2 Lesson 3 */}
import Week2L3Page1 from './pages/Week 2 Pages/Lesson 3/L3Page1'
import Week2L3Page2 from './pages/Week 2 Pages/Lesson 3/L3Page2'
import Week2L3Page3 from './pages/Week 2 Pages/Lesson 3/L3Page3'
import Week2L3Page4 from './pages/Week 2 Pages/Lesson 3/L3Page4'
import Week2L3Page5 from './pages/Week 2 Pages/Lesson 3/L3Page5'
import Week2L3Page6 from './pages/Week 2 Pages/Lesson 3/L3Page6'

{/*WEEK 3 */}
import Week3 from './pages/student/Week3Page'
{/*Week 3 Activities */}
import Week3Activity1 from './pages/Week 3 Pages/Activities Week 3/Activity1'
import Week3Activity2 from './pages/Week 3 Pages/Activities Week 3/Activity2'
import Week3Activity3 from './pages/Week 3 Pages/Activities Week 3/Activity3'
{/*Week 3 quiz */}
import QuizWeek3 from './pages/Week 3 Pages/Quiz Week 3/quizWeek3'
{/*Week 3 Lesson 1 */}
import Week3Page1 from './pages/Week 3 Pages/Lesson 1/Page1'
import Week3Page2 from './pages/Week 3 Pages/Lesson 1/Page2'
import Week3Page3 from './pages/Week 3 Pages/Lesson 1/Page3'
import Week3Page4 from './pages/Week 3 Pages/Lesson 1/Page4'
import Week3Page5 from './pages/Week 3 Pages/Lesson 1/Page5'
import Week3Page6 from './pages/Week 3 Pages/Lesson 1/Page6'
import Week3Page7 from './pages/Week 3 Pages/Lesson 1/Page7'
import Week3Page8 from './pages/Week 3 Pages/Lesson 1/Page8'
{/*Week 3 Lesson 2 */}
import Week3L2Page1 from './pages/Week 3 Pages/Lesson 2/L2Page1'
import Week3L2Page2 from './pages/Week 3 Pages/Lesson 2/L2Page2'
import Week3L2Page3 from './pages/Week 3 Pages/Lesson 2/L2Page3'
import Week3L2Page4 from './pages/Week 3 Pages/Lesson 2/L2Page4'
import Week3L2Page5 from './pages/Week 3 Pages/Lesson 2/L2Page5'
import Week3L2Page6 from './pages/Week 3 Pages/Lesson 2/L2Page6'
import Week3L2Page7 from './pages/Week 3 Pages/Lesson 2/L2Page7'
import Week3L2Page8 from './pages/Week 3 Pages/Lesson 2/L2Page8'
{/*Week 3 Lesson 3 */}
import Week3L3Page1 from './pages/Week 3 Pages/Lesson 3/L3Page1'
import Week3L3Page2 from './pages/Week 3 Pages/Lesson 3/L3Page2'
import Week3L3Page3 from './pages/Week 3 Pages/Lesson 3/L3Page3'
import Week3L3Page4 from './pages/Week 3 Pages/Lesson 3/L3Page4'
import Week3L3Page5 from './pages/Week 3 Pages/Lesson 3/L3Page5'
import Week3L3Page6 from './pages/Week 3 Pages/Lesson 3/L3Page6'
import Week3L3Page7 from './pages/Week 3 Pages/Lesson 3/L3Page7'
import Week3L3Page8 from './pages/Week 3 Pages/Lesson 3/L3Page8'

/*WEEK 4 */
import Week4 from './pages/student/Week4Page'
{/*Week 4 Activities */}
import Week4Activity1 from './pages/Week 4-5 Pages/Activities Week 4&5/Activity1'
import Week4Activity2 from './pages/Week 4-5 Pages/Activities Week 4&5/Activity2'
import Week4Activity3 from './pages/Week 4-5 Pages/Activities Week 4&5/Activity3'
{/*Week 4 quiz */}
import QuizWeek4 from './pages/Week 4-5 Pages/Quiz Week 4-5/quizWeek4-5'
{/*Week 4 Lesson 1 */}
import Week4Page1 from './pages/Week 4-5 Pages/Lesson 1/Page1'
import Week4Page2 from './pages/Week 4-5 Pages/Lesson 1/Page2'
import Week4Page3 from './pages/Week 4-5 Pages/Lesson 1/Page3'
import Week4Page4 from './pages/Week 4-5 Pages/Lesson 1/Page4'
import Week4Page5 from './pages/Week 4-5 Pages/Lesson 1/Page5'
import Week4Page6 from './pages/Week 4-5 Pages/Lesson 1/Page6'
import Week4Page7 from './pages/Week 4-5 Pages/Lesson 1/Page7'
import Week4Page8 from './pages/Week 4-5 Pages/Lesson 1/Page8'
{/*Week 4 Lesson 2 */}
import Week4L2Page1 from './pages/Week 4-5 Pages/Lesson 2/L2Page1'
import Week4L2Page2 from './pages/Week 4-5 Pages/Lesson 2/L2Page2'
import Week4L2Page3 from './pages/Week 4-5 Pages/Lesson 2/L2Page3'
import Week4L2Page4 from './pages/Week 4-5 Pages/Lesson 2/L2Page4'
import Week4L2Page5 from './pages/Week 4-5 Pages/Lesson 2/L2Page5'
import Week4L2Page6 from './pages/Week 4-5 Pages/Lesson 2/L2Page6'
import Week4L2Page7 from './pages/Week 4-5 Pages/Lesson 2/L2Page7'
import Week4L2Page8 from './pages/Week 4-5 Pages/Lesson 2/L2Page8'
{/*Week 4 Lesson 3 */}
import Week4L3Page1 from './pages/Week 4-5 Pages/Lesson 3/L3Page1'
import Week4L3Page2 from './pages/Week 4-5 Pages/Lesson 3/L3Page2'
import Week4L3Page3 from './pages/Week 4-5 Pages/Lesson 3/L3Page3'
import Week4L3Page4 from './pages/Week 4-5 Pages/Lesson 3/L3Page4'
import Week4L3Page5 from './pages/Week 4-5 Pages/Lesson 3/L3Page5'
import Week4L3Page6 from './pages/Week 4-5 Pages/Lesson 3/L3Page6'
import Week4L3Page7 from './pages/Week 4-5 Pages/Lesson 3/L3Page7'
import Week4L3Page8 from './pages/Week 4-5 Pages/Lesson 3/L3Page8'

/*WEEK 6 */
import Week6 from './pages/student/Week6Page'
{/*Week 6 Activities */}
import Week6Activity1 from './pages/Week 6 Pages/Activities Week 6/Activity1'
import Week6Activity2 from './pages/Week 6 Pages/Activities Week 6/Activity2'
import Week6Activity3 from './pages/Week 6 Pages/Activities Week 6/Activity3'
{/*Week 6 quiz */}
import QuizWeek6 from './pages/Week 6 Pages/Quiz Week 6/quizWeek6'
{/*Week 6 Lesson 1 */}
import Week6Page1 from './pages/Week 6 Pages/Lesson 1/Page1'
import Week6Page2 from './pages/Week 6 Pages/Lesson 1/Page2'
import Week6Page3 from './pages/Week 6 Pages/Lesson 1/Page3'
import Week6Page4 from './pages/Week 6 Pages/Lesson 1/Page4'
import Week6Page5 from './pages/Week 6 Pages/Lesson 1/Page5'
import Week6Page6 from './pages/Week 6 Pages/Lesson 1/Page6'
import Week6Page7 from './pages/Week 6 Pages/Lesson 1/Page7'
{/*Week 6 Lesson 2 */}
import Week6L2Page1 from './pages/Week 6 Pages/Lesson 2/L2Page1'
import Week6L2Page2 from './pages/Week 6 Pages/Lesson 2/L2Page2'
import Week6L2Page3 from './pages/Week 6 Pages/Lesson 2/L2Page3'
import Week6L2Page4 from './pages/Week 6 Pages/Lesson 2/L2Page4'
import Week6L2Page5 from './pages/Week 6 Pages/Lesson 2/L2Page5'
import Week6L2Page6 from './pages/Week 6 Pages/Lesson 2/L2Page6'
import Week6L2Page7 from './pages/Week 6 Pages/Lesson 2/L2Page7'
import Week6L2Page8 from './pages/Week 6 Pages/Lesson 2/L2Page8'
{/*Week 6 Lesson 3 */}
import Week6L3Page1 from './pages/Week 6 Pages/Lesson 3/L3Page1'
import Week6L3Page2 from './pages/Week 6 Pages/Lesson 3/L3Page2'
import Week6L3Page3 from './pages/Week 6 Pages/Lesson 3/L3Page3'
import Week6L3Page4 from './pages/Week 6 Pages/Lesson 3/L3Page4'
import Week6L3Page5 from './pages/Week 6 Pages/Lesson 3/L3Page5'
import Week6L3Page6 from './pages/Week 6 Pages/Lesson 3/L3Page6'
import Week6L3Page7 from './pages/Week 6 Pages/Lesson 3/L3Page7'
import Week6L3Page8 from './pages/Week 6 Pages/Lesson 3/L3Page8'

/*WEEK 7 */
import Week7 from './pages/student/Week7Page'
{/*Week 7 Activities */}
import Week7Activity1 from './pages/Week 7-8 Pages/Activities Week 7&8/Activity1'
import Week7Activity2 from './pages/Week 7-8 Pages/Activities Week 7&8/Activity2'
import Week7Activity3 from './pages/Week 7-8 Pages/Activities Week 7&8/Activity3'
{/*Week 7 quiz */}
import QuizWeek7 from './pages/Week 7-8 Pages/Quiz Week 7-8/quizWeek7-8'
{/*Week 7 Lesson 1 */}
import Week7Page1 from './pages/Week 7-8 Pages/Lesson 1/Page1'
import Week7Page2 from './pages/Week 7-8 Pages/Lesson 1/Page2'
import Week7Page3 from './pages/Week 7-8 Pages/Lesson 1/Page3'
import Week7Page4 from './pages/Week 7-8 Pages/Lesson 1/Page4'
import Week7Page5 from './pages/Week 7-8 Pages/Lesson 1/Page5'
import Week7Page6 from './pages/Week 7-8 Pages/Lesson 1/Page6'
import Week7Page7 from './pages/Week 7-8 Pages/Lesson 1/Page7'
import Week7Page8 from './pages/Week 7-8 Pages/Lesson 1/Page8'

{/*Week 7 Lesson 2 */}
import Week7L2Page1 from './pages/Week 7-8 Pages/Lesson 2/L2Page1'
import Week7L2Page2 from './pages/Week 7-8 Pages/Lesson 2/L2Page2'
import Week7L2Page3 from './pages/Week 7-8 Pages/Lesson 2/L2Page3'
import Week7L2Page4 from './pages/Week 7-8 Pages/Lesson 2/L2Page4'
import Week7L2Page5 from './pages/Week 7-8 Pages/Lesson 2/L2Page5'
import Week7L2Page6 from './pages/Week 7-8 Pages/Lesson 2/L2Page6'
import Week7L2Page7 from './pages/Week 7-8 Pages/Lesson 2/L2Page7'
import Week7L2Page8 from './pages/Week 7-8 Pages/Lesson 2/L2Page8'
{/*Week 7 Lesson 3 */}
import Week7L3Page1 from './pages/Week 7-8 Pages/Lesson 3/L3Page1'
import Week7L3Page2 from './pages/Week 7-8 Pages/Lesson 3/L3Page2'
import Week7L3Page3 from './pages/Week 7-8 Pages/Lesson 3/L3Page3'
import Week7L3Page4 from './pages/Week 7-8 Pages/Lesson 3/L3Page4'
import Week7L3Page5 from './pages/Week 7-8 Pages/Lesson 3/L3Page5'
import Week7L3Page6 from './pages/Week 7-8 Pages/Lesson 3/L3Page6'
import Week7L3Page7 from './pages/Week 7-8 Pages/Lesson 3/L3Page7'
import Week7L3Page8 from './pages/Week 7-8 Pages/Lesson 3/L3Page8'

{/*week 10*/}
import Week10 from './pages/student/Week10Page'
{/*Week 10 Activities */}
import QuizWeek10 from './pages/Week 10-11 Pages/Quiz Week 10-11/quizWeek10-11'
{/*Week 10 Lesson 1 */}
import Week10Page1 from './pages/Week 10-11 Pages/Lesson 1/Page1'
import Week10Page2 from './pages/Week 10-11 Pages/Lesson 1/Page2'
import Week10Page3 from './pages/Week 10-11 Pages/Lesson 1/Page3'
import Week10Page4 from './pages/Week 10-11 Pages/Lesson 1/Page4'
import Week10Page5 from './pages/Week 10-11 Pages/Lesson 1/Page5'
import Week10Page6 from './pages/Week 10-11 Pages/Lesson 1/Page6'
import Week10Page7 from './pages/Week 10-11 Pages/Lesson 1/Page7'
import Week10Page8 from './pages/Week 10-11 Pages/Lesson 1/Page8'
{/*Week 10 Lesson 2 */}
import Week10L2Page1 from './pages/Week 10-11 Pages/Lesson 2/L2Page1'
import Week10L2Page2 from './pages/Week 10-11 Pages/Lesson 2/L2Page2'
import Week10L2Page3 from './pages/Week 10-11 Pages/Lesson 2/L2Page3'
import Week10L2Page4 from './pages/Week 10-11 Pages/Lesson 2/L2Page4'
import Week10L2Page5 from './pages/Week 10-11 Pages/Lesson 2/L2Page5'
import Week10L2Page6 from './pages/Week 10-11 Pages/Lesson 2/L2Page6'
import Week10L2Page7 from './pages/Week 10-11 Pages/Lesson 2/L2Page7'
import Week10L2Page8 from './pages/Week 10-11 Pages/Lesson 2/L2Page8'
{/*Week 10 Lesson 3 */}
import Week10L3Page1 from './pages/Week 10-11 Pages/Lesson 3/L3Page1'
import Week10L3Page2 from './pages/Week 10-11 Pages/Lesson 3/L3Page2'
import Week10L3Page3 from './pages/Week 10-11 Pages/Lesson 3/L3Page3'
import Week10L3Page4 from './pages/Week 10-11 Pages/Lesson 3/L3Page4'
import Week10L3Page5 from './pages/Week 10-11 Pages/Lesson 3/L3Page5'
import Week10L3Page6 from './pages/Week 10-11 Pages/Lesson 3/L3Page6'
import Week10L3Page7 from './pages/Week 10-11 Pages/Lesson 3/L3Page7'
import Week10L3Page8 from './pages/Week 10-11 Pages/Lesson 3/L3Page8'
{/*Week 10 Activities */}
import Week10Activity1 from './pages/Week 10-11 Pages/Activities Week 10&11/Activity1'
import Week10Activity2 from './pages/Week 10-11 Pages/Activities Week 10&11/Activity2'
import Week10Activity3 from './pages/Week 10-11 Pages/Activities Week 10&11/Activity3'

import CodePlayground  from './pages/student/CodePlayground'

{/*Admin Page */}
import AdminPage from './pages/admin/adminPage'
import ViewInstructorPage from './pages/admin/ViewInstructorPage'
import ViewStudentsPage from './pages/admin/ViewStudentsPage'
import ViewClassPage from './pages/admin/ViewClassPage'

{/*Protected Route */}
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/UnauthorizedPage'

{/*Profile Page */}
import ViewProfile from './pages/ViewProfile'

{/*Instructor Page */}
import InstructorPage from './pages/instructor/InstructorPage'
import ViewScoresPage from './pages/instructor/ViewScoresPage'
import ViewStudentLists from './pages/instructor/ViewStudentLists'
import AddLessonMaterials from './pages/instructor/AddLessonMaterials'

import Leaderboard from './pages/Leaderboard'
import Forum from './pages/Forum'
import CodeChallengeLobby from './components/CodeChallengeLobby'
import Match from './pages/PvP/Match'
import ClassField from './pages/ClassField'

import StructifyLessonTemplate from './components/StructifyLessonTemplate'; // Adjust the path if needed
// ...other imports

function App() {
  const { currentUser, role } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/" element={
        currentUser ? (
          role === 'admin' ? <Navigate to="/AdminPage" replace /> :
          role === 'student' ? <Navigate to="/MainPage" replace /> :
          role === 'instructor' ? <Navigate to="/InstructorPage" replace /> :
          <StartPage/>
        ) : <StartPage/>
      } />

      {/* Main Pages */}
      <Route path="/MainPage" element={<ProtectedRoute allowedRoles={['student']}><MainPage/></ProtectedRoute>} />
      <Route path="/AdminPage" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
      <Route path="/InstructorPage" element={<ProtectedRoute allowedRoles={['instructor']}><InstructorPage /></ProtectedRoute>} />

      {/* Week 1 lesson 1 pages */}
      <Route path="/page1" element={<ProtectedRoute allowedRoles={['student']}><Page1 /></ProtectedRoute>} />
      <Route path="/page2" element={<ProtectedRoute allowedRoles={['student']}><Page2 /></ProtectedRoute>} />
      <Route path="/page3" element={<ProtectedRoute allowedRoles={['student']}><Page3 /></ProtectedRoute>} />
      <Route path="/page4" element={<ProtectedRoute allowedRoles={['student']}><Page4 /></ProtectedRoute>} />
      <Route path="/page5" element={<ProtectedRoute allowedRoles={['student']}><Page5 /></ProtectedRoute>} />
      <Route path="/page6" element={<ProtectedRoute allowedRoles={['student']}><Page6 /></ProtectedRoute>} />
      <Route path="/page7" element={<ProtectedRoute allowedRoles={['student']}><Page7 /></ProtectedRoute>} />
      <Route path="/page8" element={<ProtectedRoute allowedRoles={['student']}><Page8 /></ProtectedRoute>} />
      {/* Week 1 lesson 2 pages */}
      <Route path="/l2page1" element={<ProtectedRoute allowedRoles={['student']}><L2Page1 /></ProtectedRoute>} />
      <Route path="/l2page2" element={<ProtectedRoute allowedRoles={['student']}><L2Page2 /></ProtectedRoute>} />
      <Route path="/l2page3" element={<ProtectedRoute allowedRoles={['student']}><L2Page3 /></ProtectedRoute>} />
      {/* Week 1 lesson 3 pages */}
      <Route path="/l3page1" element={<ProtectedRoute allowedRoles={['student']}><L3Page1 /></ProtectedRoute>} />
      <Route path="/l3page2" element={<ProtectedRoute allowedRoles={['student']}><L3Page2 /></ProtectedRoute>} />
      <Route path="/l3page3" element={<ProtectedRoute allowedRoles={['student']}><L3Page3 /></ProtectedRoute>} />
      <Route path="/l3page4" element={<ProtectedRoute allowedRoles={['student']}><L3Page4 /></ProtectedRoute>} />
      <Route path="/l3page5" element={<ProtectedRoute allowedRoles={['student']}><L3Page5 /></ProtectedRoute>} />
      <Route path="/l3page6" element={<ProtectedRoute allowedRoles={['student']}><L3Page6 /></ProtectedRoute>} />
      <Route path="/l3page7" element={<ProtectedRoute allowedRoles={['student']}><L3Page7 /></ProtectedRoute>} />
      <Route path="/l3page8" element={<ProtectedRoute allowedRoles={['student']}><L3Page8 /></ProtectedRoute>} />
      {/* Week activity 1 */}
      <Route path="/week1activity1" element={<ProtectedRoute allowedRoles={['student']}><Week1Activity1 /></ProtectedRoute>} />
      <Route path="/week1activity2" element={<ProtectedRoute allowedRoles={['student']}><Week1Activity2 /></ProtectedRoute>} />
      <Route path="/week1activity3" element={<ProtectedRoute allowedRoles={['student']}><Week1Activity3 /></ProtectedRoute>} />
      {/* Week 1 quiz */}
      <Route path='/quizWeek1' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek1 /></ProtectedRoute>} />

      {/* Week 2 */}
      <Route path="/week2Page" element={<ProtectedRoute allowedRoles={['student']}><Week2 /></ProtectedRoute>} />
      <Route path='/quizWeek2' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek2 /></ProtectedRoute>} />
      {/* Week 2 lesson 1 pages */}
      <Route path="/week2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week2Page1 /></ProtectedRoute>} />
      <Route path="/week2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week2Page2 /></ProtectedRoute>} />
      <Route path="/week2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week2Page3 /></ProtectedRoute>} />
      <Route path="/week2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week2Page4 /></ProtectedRoute>} />
      <Route path="/week2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week2Page5 /></ProtectedRoute>} />
      <Route path="/week2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week2Page6 /></ProtectedRoute>} />
      <Route path="/week2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week2Page7 /></ProtectedRoute>} />
      <Route path="/week2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week2Page8 /></ProtectedRoute>} />
      {/* Week 2 lesson 2 pages */}
      <Route path="/week2L2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page1 /></ProtectedRoute>} />
      <Route path="/week2L2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page2 /></ProtectedRoute>} />
      <Route path="/week2L2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page3 /></ProtectedRoute>} />
      <Route path="/week2L2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page4 /></ProtectedRoute>} />
      <Route path="/week2L2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page5 /></ProtectedRoute>} />
      <Route path="/week2L2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page6 /></ProtectedRoute>} />
      <Route path="/week2L2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page7 /></ProtectedRoute>} />
      <Route path="/week2L2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week2L2Page8 /></ProtectedRoute>} />
      {/* Week 2 lesson 3 pages */}
      <Route path="/week2L3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week2L3Page1 /></ProtectedRoute>} />
      <Route path="/week2L3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week2L3Page2 /></ProtectedRoute>} />
      <Route path="/week2L3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week2L3Page3 /></ProtectedRoute>} />
      <Route path="/week2L3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week2L3Page4 /></ProtectedRoute>} />
      <Route path="/week2L3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week2L3Page5 /></ProtectedRoute>} />
      <Route path="/week2L3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week2L3Page6 /></ProtectedRoute>} />
      {/* Week 2 activities */}
      <Route path="/week2Activity1" element={<ProtectedRoute allowedRoles={['student']}><Week2Activity1 /></ProtectedRoute>} />
      <Route path="/week2Activity2" element={<ProtectedRoute allowedRoles={['student']}><Week2Activity2 /></ProtectedRoute>} />
      <Route path="/week2Activity3" element={<ProtectedRoute allowedRoles={['student']}><Week2Activity3 /></ProtectedRoute>} />

      {/* Week 3 */}
      <Route path="/week3Page" element={<ProtectedRoute allowedRoles={['student']}><Week3 /></ProtectedRoute>} />
      <Route path='/quizWeek3' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek3 /></ProtectedRoute>} />
      {/* Week 3 lesson 1 pages */}
      <Route path="/week3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week3Page1 /></ProtectedRoute>} />
      <Route path="/week3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week3Page2 /></ProtectedRoute>} />
      <Route path="/week3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week3Page3 /></ProtectedRoute>} />
      <Route path="/week3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week3Page4 /></ProtectedRoute>} />
      <Route path="/week3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week3Page5 /></ProtectedRoute>} />
      <Route path="/week3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week3Page6 /></ProtectedRoute>} />
      <Route path="/week3Page7" element={<ProtectedRoute allowedRoles={['student']}><Week3Page7 /></ProtectedRoute>} />
      <Route path="/week3Page8" element={<ProtectedRoute allowedRoles={['student']}><Week3Page8 /></ProtectedRoute>} />
      {/* Week 3 lesson 2 pages */}
      <Route path="/week3L2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page1 /></ProtectedRoute>} />
      <Route path="/week3L2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page2 /></ProtectedRoute>} />
      <Route path="/week3L2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page3 /></ProtectedRoute>} />
      <Route path="/week3L2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page4 /></ProtectedRoute>} />
      <Route path="/week3L2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page5 /></ProtectedRoute>} />
      <Route path="/week3L2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page6 /></ProtectedRoute>} />
      <Route path="/week3L2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page7 /></ProtectedRoute>} />
      <Route path="/week3L2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week3L2Page8 /></ProtectedRoute>} />
      {/* Week 3 lesson 3 pages */}
      <Route path="/week3L3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page1 /></ProtectedRoute>} />
      <Route path="/week3L3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page2 /></ProtectedRoute>} />
      <Route path="/week3L3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page3 /></ProtectedRoute>} />
      <Route path="/week3L3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page4 /></ProtectedRoute>} />
      <Route path="/week3L3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page5 /></ProtectedRoute>} />
      <Route path="/week3L3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page6 /></ProtectedRoute>} />
      <Route path="/week3L3Page7" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page7 /></ProtectedRoute>} />
      <Route path="/week3L3Page8" element={<ProtectedRoute allowedRoles={['student']}><Week3L3Page8 /></ProtectedRoute>} />
      {/* Week 3 activities */}
      <Route path="/week3Activity1" element={<ProtectedRoute allowedRoles={['student']}><Week3Activity1 /></ProtectedRoute>} />
      <Route path="/week3Activity2" element={<ProtectedRoute allowedRoles={['student']}><Week3Activity2 /></ProtectedRoute>} />
      <Route path="/week3Activity3" element={<ProtectedRoute allowedRoles={['student']}><Week3Activity3 /></ProtectedRoute>} />
 
      {/* Week 4&5 */}
      <Route path="/week4Page" element={<ProtectedRoute allowedRoles={['student']}><Week4 /></ProtectedRoute>} />
      <Route path='/quizWeek4-5' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek4 /></ProtectedRoute>} />
      {/* Week 4&5 lesson 1 pages */}
      <Route path="/week4Page1" element={<ProtectedRoute allowedRoles={['student']}><Week4Page1 /></ProtectedRoute>} />
      <Route path="/week4Page2" element={<ProtectedRoute allowedRoles={['student']}><Week4Page2 /></ProtectedRoute>} />
      <Route path="/week4Page3" element={<ProtectedRoute allowedRoles={['student']}><Week4Page3 /></ProtectedRoute>} />
      <Route path="/week4Page4" element={<ProtectedRoute allowedRoles={['student']}><Week4Page4 /></ProtectedRoute>} />
      <Route path="/week4Page5" element={<ProtectedRoute allowedRoles={['student']}><Week4Page5 /></ProtectedRoute>} />
      <Route path="/week4Page6" element={<ProtectedRoute allowedRoles={['student']}><Week4Page6 /></ProtectedRoute>} />
      <Route path="/week4Page7" element={<ProtectedRoute allowedRoles={['student']}><Week4Page7 /></ProtectedRoute>} />
      <Route path="/week4Page8" element={<ProtectedRoute allowedRoles={['student']}><Week4Page8 /></ProtectedRoute>} />
      {/* Week 4&5 lesson 2 pages */}
      <Route path="/week4L2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page1 /></ProtectedRoute>} />
      <Route path="/week4L2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page2 /></ProtectedRoute>} />
      <Route path="/week4L2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page3 /></ProtectedRoute>} />
      <Route path="/week4L2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page4 /></ProtectedRoute>} />
      <Route path="/week4L2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page5 /></ProtectedRoute>} />
      <Route path="/week4L2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page6 /></ProtectedRoute>} />
      <Route path="/week4L2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page7 /></ProtectedRoute>} />
      <Route path="/week4L2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week4L2Page8 /></ProtectedRoute>} />
      {/* Week 4&5 lesson 3 pages */}
      <Route path="/week4L3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page1 /></ProtectedRoute>} />
      <Route path="/week4L3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page2 /></ProtectedRoute>} />
      <Route path="/week4L3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page3 /></ProtectedRoute>} />
      <Route path="/week4L3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page4 /></ProtectedRoute>} />
      <Route path="/week4L3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page5 /></ProtectedRoute>} />
      <Route path="/week4L3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page6 /></ProtectedRoute>} />
      <Route path="/week4L3Page7" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page7 /></ProtectedRoute>} />
      <Route path="/week4L3Page8" element={<ProtectedRoute allowedRoles={['student']}><Week4L3Page8 /></ProtectedRoute>} />
      {/* Week 4&5 activities */}
      <Route path="/week4Activity1" element={<ProtectedRoute allowedRoles={['student']}><Week4Activity1 /></ProtectedRoute>} />
      <Route path="/week4Activity2" element={<ProtectedRoute allowedRoles={['student']}><Week4Activity2 /></ProtectedRoute>} />
      <Route path="/week4Activity3" element={<ProtectedRoute allowedRoles={['student']}><Week4Activity3 /></ProtectedRoute>} />

      {/* Week 6 */}
      <Route path="/week6Page" element={<ProtectedRoute allowedRoles={['student']}><Week6 /></ProtectedRoute>} />
      {/* Week 6 quiz */}
      <Route path='/quizWeek6' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek6 /></ProtectedRoute>} />
      {/* Week 6 lesson 1 pages */}
      <Route path="/week6Page1" element={<ProtectedRoute allowedRoles={['student']}><Week6Page1 /></ProtectedRoute>} />
      <Route path="/week6Page2" element={<ProtectedRoute allowedRoles={['student']}><Week6Page2 /></ProtectedRoute>} />
      <Route path="/week6Page3" element={<ProtectedRoute allowedRoles={['student']}><Week6Page3 /></ProtectedRoute>} />
      <Route path="/week6Page4" element={<ProtectedRoute allowedRoles={['student']}><Week6Page4 /></ProtectedRoute>} />
      <Route path="/week6Page5" element={<ProtectedRoute allowedRoles={['student']}><Week6Page5 /></ProtectedRoute>} />
      <Route path="/week6Page6" element={<ProtectedRoute allowedRoles={['student']}><Week6Page6 /></ProtectedRoute>} />
      <Route path="/week6Page7" element={<ProtectedRoute allowedRoles={['student']}><Week6Page7 /></ProtectedRoute>} />
      {/* Week 6 lesson 2 pages */}
      <Route path="/week6L2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page1 /></ProtectedRoute>} />
      <Route path="/week6L2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page2 /></ProtectedRoute>} />
      <Route path="/week6L2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page3 /></ProtectedRoute>} />
      <Route path="/week6L2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page4 /></ProtectedRoute>} />
      <Route path="/week6L2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page5 /></ProtectedRoute>} />
      <Route path="/week6L2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page6 /></ProtectedRoute>} />
      <Route path="/week6L2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page7 /></ProtectedRoute>} />
      <Route path="/week6L2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week6L2Page8 /></ProtectedRoute>} />
      {/* Week 6 lesson 3 pages */}
      <Route path="/week6L3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page1 /></ProtectedRoute>} />
      <Route path="/week6L3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page2 /></ProtectedRoute>} />
      <Route path="/week6L3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page3 /></ProtectedRoute>} />
      <Route path="/week6L3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page4 /></ProtectedRoute>} />
      <Route path="/week6L3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page5 /></ProtectedRoute>} />
      <Route path="/week6L3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page6 /></ProtectedRoute>} />
      <Route path="/week6L3Page7" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page7 /></ProtectedRoute>} />
      <Route path="/week6L3Page8" element={<ProtectedRoute allowedRoles={['student']}><Week6L3Page8 /></ProtectedRoute>} />
      {/* Week 6 activities */}
      <Route path="/week6Activity1" element={<ProtectedRoute allowedRoles={['student']}><Week6Activity1 /></ProtectedRoute>} />
      <Route path="/week6Activity2" element={<ProtectedRoute allowedRoles={['student']}><Week6Activity2 /></ProtectedRoute>} />
      <Route path="/week6Activity3" element={<ProtectedRoute allowedRoles={['student']}><Week6Activity3 /></ProtectedRoute>} />

      {/* Week 7 */}
      <Route path="/week7Page" element={<ProtectedRoute allowedRoles={['student']}><Week7 /></ProtectedRoute>} />
      {/* Week 7 quiz */}
      <Route path='/quizWeek7' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek7 /></ProtectedRoute>} />
      {/* Week 7 lesson 1 pages */}
      <Route path="/week7Page1" element={<ProtectedRoute allowedRoles={['student']}><Week7Page1 /></ProtectedRoute>} />
      <Route path="/week7Page2" element={<ProtectedRoute allowedRoles={['student']}><Week7Page2 /></ProtectedRoute>} />
      <Route path="/week7Page3" element={<ProtectedRoute allowedRoles={['student']}><Week7Page3 /></ProtectedRoute>} />
      <Route path="/week7Page4" element={<ProtectedRoute allowedRoles={['student']}><Week7Page4 /></ProtectedRoute>} />
      <Route path="/week7Page5" element={<ProtectedRoute allowedRoles={['student']}><Week7Page5 /></ProtectedRoute>} />
      <Route path="/week7Page6" element={<ProtectedRoute allowedRoles={['student']}><Week7Page6 /></ProtectedRoute>} />
      <Route path="/week7Page7" element={<ProtectedRoute allowedRoles={['student']}><Week7Page7 /></ProtectedRoute>} />
      <Route path="/week7Page8" element={<ProtectedRoute allowedRoles={['student']}><Week7Page8 /></ProtectedRoute>} />
      {/* Week 7 lesson 2 pages */}
      <Route path="/week7L2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page1 /></ProtectedRoute>} />
      <Route path="/week7L2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page2 /></ProtectedRoute>} />
      <Route path="/week7L2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page3 /></ProtectedRoute>} />
      <Route path="/week7L2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page4 /></ProtectedRoute>} />
      <Route path="/week7L2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page5 /></ProtectedRoute>} />
      <Route path="/week7L2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page6 /></ProtectedRoute>} />
      <Route path="/week7L2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page7 /></ProtectedRoute>} />
      <Route path="/week7L2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week7L2Page8 /></ProtectedRoute>} />
      {/* Week 7 lesson 3 pages */}
      <Route path="/week7L3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page1 /></ProtectedRoute>} />
      <Route path="/week7L3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page2 /></ProtectedRoute>} />
      <Route path="/week7L3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page3 /></ProtectedRoute>} />
      <Route path="/week7L3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page4 /></ProtectedRoute>} />
      <Route path="/week7L3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page5 /></ProtectedRoute>} />
      <Route path="/week7L3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page6 /></ProtectedRoute>} />
      <Route path="/week7L3Page7" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page7 /></ProtectedRoute>} />
      <Route path="/week7L3Page8" element={<ProtectedRoute allowedRoles={['student']}><Week7L3Page8 /></ProtectedRoute>} />
      {/* Week 7 activities */}
      <Route path="/week7Activity1" element={<ProtectedRoute allowedRoles={['student']}><Week7Activity1 /></ProtectedRoute>} />
      <Route path="/week7Activity2" element={<ProtectedRoute allowedRoles={['student']}><Week7Activity2 /></ProtectedRoute>} />
      <Route path="/week7Activity3" element={<ProtectedRoute allowedRoles={['student']}><Week7Activity3 /></ProtectedRoute>} />

      {/* Week 10&11 */}
      <Route path="/week10Page" element={<ProtectedRoute allowedRoles={['student']}><Week10 /></ProtectedRoute>} />
      {/* Week 10&11 quiz */}
      <Route path='/quizWeek10-11' element={<ProtectedRoute allowedRoles={['student']}><QuizWeek10 /></ProtectedRoute>} />
      {/* Week 10&11 lesson 1 pages */}
      <Route path="/week10Page1" element={<ProtectedRoute allowedRoles={['student']}><Week10Page1 /></ProtectedRoute>} />
      <Route path="/week10Page2" element={<ProtectedRoute allowedRoles={['student']}><Week10Page2 /></ProtectedRoute>} />
      <Route path="/week10Page3" element={<ProtectedRoute allowedRoles={['student']}><Week10Page3 /></ProtectedRoute>} />
      <Route path="/week10Page4" element={<ProtectedRoute allowedRoles={['student']}><Week10Page4 /></ProtectedRoute>} />
      <Route path="/week10Page5" element={<ProtectedRoute allowedRoles={['student']}><Week10Page5 /></ProtectedRoute>} />
      <Route path="/week10Page6" element={<ProtectedRoute allowedRoles={['student']}><Week10Page6 /></ProtectedRoute>} />
      <Route path="/week10Page7" element={<ProtectedRoute allowedRoles={['student']}><Week10Page7 /></ProtectedRoute>} />
      <Route path="/week10Page8" element={<ProtectedRoute allowedRoles={['student']}><Week10Page8 /></ProtectedRoute>} />
      {/* Week 10&11 lesson 2 pages */}
      <Route path="/week10L2Page1" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page1 /></ProtectedRoute>} />
      <Route path="/week10L2Page2" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page2 /></ProtectedRoute>} />
      <Route path="/week10L2Page3" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page3 /></ProtectedRoute>} />
      <Route path="/week10L2Page4" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page4 /></ProtectedRoute>} />
      <Route path="/week10L2Page5" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page5 /></ProtectedRoute>} />
      <Route path="/week10L2Page6" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page6 /></ProtectedRoute>} />
      <Route path="/week10L2Page7" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page7 /></ProtectedRoute>} />
      <Route path="/week10L2Page8" element={<ProtectedRoute allowedRoles={['student']}><Week10L2Page8 /></ProtectedRoute>} />
      {/* Week 10&11 lesson 3 pages */}
      <Route path="/week10L3Page1" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page1 /></ProtectedRoute>} />
      <Route path="/week10L3Page2" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page2 /></ProtectedRoute>} />
      <Route path="/week10L3Page3" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page3 /></ProtectedRoute>} />
      <Route path="/week10L3Page4" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page4 /></ProtectedRoute>} />
      <Route path="/week10L3Page5" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page5 /></ProtectedRoute>} />
      <Route path="/week10L3Page6" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page6 /></ProtectedRoute>} />
      <Route path="/week10L3Page7" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page7 /></ProtectedRoute>} />
      <Route path="/week10L3Page8" element={<ProtectedRoute allowedRoles={['student']}><Week10L3Page8 /></ProtectedRoute>} />
      {/* Week 10&11 activities */}
      <Route path="/week10Activity1" element={<ProtectedRoute allowedRoles={['student']}><Week10Activity1 /></ProtectedRoute>} />
      <Route path="/week10Activity2" element={<ProtectedRoute allowedRoles={['student']}><Week10Activity2 /></ProtectedRoute>} />
      <Route path="/week10Activity3" element={<ProtectedRoute allowedRoles={['student']}><Week10Activity3 /></ProtectedRoute>} />

      {/* Code Playground */}
      <Route path="/codePlayground" element={<ProtectedRoute allowedRoles={['student']}><CodePlayground /></ProtectedRoute>} />

      {/* Admin Page */}
      <Route path="/ViewInstructorPage" element={<ProtectedRoute allowedRoles={['admin']}><ViewInstructorPage /></ProtectedRoute>} />
      <Route path="/ViewStudentsPage" element={<ProtectedRoute allowedRoles={['admin']}><ViewStudentsPage /></ProtectedRoute>} />
      <Route path="/ViewClassPage" element={<ProtectedRoute allowedRoles={['admin']}><ViewClassPage/></ProtectedRoute>} />

      {/*Instructor Page */}
      <Route path="/ViewScoresPage" element={<ProtectedRoute allowedRoles={['instructor']}><ViewScoresPage /></ProtectedRoute>} />
      <Route path="/ViewStudentLists" element={<ProtectedRoute allowedRoles={['instructor']}><ViewStudentLists /></ProtectedRoute>} />
      <Route path="/AddLessonMaterials" element={<ProtectedRoute allowedRoles={['instructor']}><AddLessonMaterials /></ProtectedRoute>} />
      
      {/* Generic Pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/ViewProfile" element={<ViewProfile />} />
      <Route path="/Leaderboard" element={<Leaderboard />} />        
      <Route path="/Forum" element={<Forum />} />
      <Route path="/CodeChallengeLobby" element={<CodeChallengeLobby />} />
      <Route path="/PvP/Match" element={<Match />} />
      <Route path="/ClassField" element={<ClassField />} />

      {/* Instructor-edited lessons */}
      <Route path="/instructor-lesson/:id" element={<StructifyLessonTemplate />} />
    </Routes> 
  )
}

export default App
