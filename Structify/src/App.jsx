import './App.css'
import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/Start'

/*WEEK 1 */
import MainPage from './pages/MainPage'
{/*Week 1 Activities */}
import Activity1 from './pages/Week 1 Pages/Activities Week 1/Activity1'
import Activity2 from './pages/Week 1 Pages/Activities Week 1/Activity2'
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
import Week2 from './pages/Week2Page'
{/*Week 2 Activities */}
import Week2Activity1 from './pages/Week 2 Pages/Activities Week 2/Activity1'
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

/*WEEK 3 */
import Week3 from './pages/Week3Page'
{/*Week 2 Activities */}
import Week3Activity1 from './pages/Week 3 Pages/Activities Week 3/Activity1'
{/*Week 2 Lesson 1 */}
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


function App() {
  return (
    <Routes>

      <Route path="/" element={<StartPage/>} />

      {/* Week 1 */}
      <Route path="/mainPage" element={<MainPage/>} />      
    {/* Week 1 lesson 1 pages */}
      <Route path="/page1" element={<Page1/>} />
      <Route path="/page2" element={<Page2/>} />
      <Route path="/page3" element={<Page3/>} />
      <Route path="/page4" element={<Page4/>} />
      <Route path="/page5" element={<Page5/>} />
      <Route path="/page6" element={<Page6/>} />
      <Route path="/page7" element={<Page7/>} />
      <Route path="/page8" element={<Page8/>} />
      {/* Week 1 lesson 2 pages */}
      <Route path="/l2page1" element={<L2Page1/>} />
      <Route path="/l2page2" element={<L2Page2/>} />
      <Route path="/l2page3" element={<L2Page3/>} />
       {/* Week 1 lesson 3 pages */}
      <Route path="/l3page1" element={<L3Page1/>} />
      <Route path="/l3page2" element={<L3Page2/>} />
      <Route path="/l3page3" element={<L3Page3/>} />
      <Route path="/l3page4" element={<L3Page4/>} />
      <Route path="/l3page5" element={<L3Page5/>} />
      <Route path="/l3page6" element={<L3Page6/>} />
      <Route path="/l3page7" element={<L3Page7/>} />
      <Route path="/l3page8" element={<L3Page8/>} />
      {/* Week activity 1 */}
      <Route path="/activity1" element={<Activity1/>} />
      <Route path="/activity2" element={<Activity2/>} />

      {/* Week 2*/}
      <Route path="/week2Pages" element={<Week2/>} />
      {/* Week 2 lesson 1 pages */}
      <Route path="/week2Page1" element={<Week2Page1/>} />
      <Route path="/week2Page2" element={<Week2Page2/>} />
      <Route path="/week2Page3" element={<Week2Page3/>} />
      <Route path="/week2Page4" element={<Week2Page4/>} />
      <Route path="/week2Page5" element={<Week2Page5/>} />
      <Route path="/week2Page6" element={<Week2Page6/>} />
      <Route path="/week2Page7" element={<Week2Page7/>} />
      <Route path="/week2Page8" element={<Week2Page8/>} />
      {/* Week 2 lesson 2 pages */}
      <Route path="/week2L2Page1" element={<Week2L2Page1/>} />
      <Route path="/week2L2Page2" element={<Week2L2Page2/>} />
      <Route path="/week2L2Page3" element={<Week2L2Page3/>} />
      <Route path="/week2L2Page4" element={<Week2L2Page4/>} />
      <Route path="/week2L2Page5" element={<Week2L2Page5/>} />
      <Route path="/week2L2Page6" element={<Week2L2Page6/>} />
      <Route path="/week2L2Page7" element={<Week2L2Page7/>} />
      <Route path="/week2L2Page8" element={<Week2L2Page8/>} />
      {/* Week 2 lesson 3 pages */}
      <Route path="/week2L3Page1" element={<Week2L3Page1/>} />
      <Route path="/week2L3Page2" element={<Week2L3Page2/>} />
      <Route path="/week2L3Page3" element={<Week2L3Page3/>} />
      <Route path="/week2L3Page4" element={<Week2L3Page4/>} />
      <Route path="/week2L3Page5" element={<Week2L3Page5/>} />
      <Route path="/week2L3Page6" element={<Week2L3Page6/>} />
      {/* Week 2 activities */}
      <Route path="/week2Activity1" element={<Week2Activity1/>} />

      {/* Week 3 */}
      <Route path="/week3Pages" element={<Week3/>} />
      {/* Week 2 lesson 1 pages */}
      <Route path="/week3Page1" element={<Week3Page1/>} />
      <Route path="/week3Page2" element={<Week3Page2/>} />
      <Route path="/week3Page3" element={<Week3Page3/>} />
      <Route path="/week3Page4" element={<Week3Page4/>} />
      <Route path="/week3Page5" element={<Week3Page5/>} />
      <Route path="/week3Page6" element={<Week3Page6/>} />
      <Route path="/week3Page7" element={<Week3Page7/>} />
      <Route path="/week3Page8" element={<Week3Page8/>} />
      {/* Week 3 lesson 2 pages */}
      <Route path="/week3L2Page1" element={<Week3L2Page1/>} />
      <Route path="/week3L2Page2" element={<Week3L2Page2/>} />
      <Route path="/week3L2Page3" element={<Week3L2Page3/>} />
      <Route path="/week3L2Page4" element={<Week3L2Page4/>} />
      <Route path="/week3L2Page5" element={<Week3L2Page5/>} />
      <Route path="/week3L2Page6" element={<Week3L2Page6/>} />
      <Route path="/week3L2Page7" element={<Week3L2Page7/>} />
      <Route path="/week3L2Page8" element={<Week3L2Page8/>} />
      {/* Week 3 lesson 3 pages */}
      <Route path="/week3L3Page1" element={<Week3L3Page1/>} />
      <Route path="/week3L3Page2" element={<Week3L3Page2/>} />
      <Route path="/week3L3Page3" element={<Week3L3Page3/>} />
      <Route path="/week3L3Page4" element={<Week3L3Page4/>} />
      <Route path="/week3L3Page5" element={<Week3L3Page5/>} />
      <Route path="/week3L3Page6" element={<Week3L3Page6/>} />
      <Route path="/week3L3Page7" element={<Week3L3Page7/>} />
      <Route path="/week3L3Page8" element={<Week3L3Page8/>} />
      {/* Week 3 activities */}
      <Route path="/week3Activity1" element={<Week3Activity1/>} />








      
              
    </Routes> 
  )
}

export default App
