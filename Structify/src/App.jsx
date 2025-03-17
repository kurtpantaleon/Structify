import './App.css'
import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/Start'
import MainPage from './pages/MainPage'
import Lesson1 from './pages/Week 1 Pages/Lesson 1/Page1'
import Lesson2 from './pages/Week 1 Pages/Lesson 1/Page2'
import Lesson3 from './pages/Week 1 Pages/Lesson 1/Page3'
import Activity1 from './pages/Week 1 Pages/Activities Week 1/Activity1'
import Activity2 from './pages/Week 1 Pages/Activities Week 1/Activity2'
import Page2 from './pages/Week 1 Pages/Lesson 1/Page2'
import Page3 from './pages/Week 1 Pages/Lesson 1/Page3'
import Page4 from './pages/Week 1 Pages/Lesson 1/Page4'
import Page5 from './pages/Week 1 Pages/Lesson 1/Page5'
import Page6 from './pages/Week 1 Pages/Lesson 1/Page6' 
import Page7 from './pages/Week 1 Pages/Lesson 1/Page7'
import Page8 from './pages/Week 1 Pages/Lesson 1/Page8'

function App() {
 

  return (
    <Routes>

      <Route path="/" element={<StartPage/>} />
      <Route path="/mainPage" element={<MainPage/>} />

      {/* Week 1 */}
      <Route path="/lesson1" element={<Lesson1/>} />
      <Route path="/lesson2" element={<Lesson2/>} />
      <Route path="/lesson3" element={<Lesson3/>} />
      <Route path="/activity1" element={<Activity1/>} />
      <Route path="/activity2" element={<Activity2/>} />

      {/* Week 1 pages */}
      <Route path="/page2" element={<Page2/>} />
      <Route path="/page3" element={<Page3/>} />
      <Route path="/page4" element={<Page4/>} />
      <Route path="/page5" element={<Page5/>} />
      <Route path="/page6" element={<Page6/>} />
      <Route path="/page7" element={<Page7/>} />
      <Route path="/page8" element={<Page8/>} />
     
      
              
    </Routes> 
  )
}

export default App
