import './App.css'
import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/Start'
import MainPage from './pages/MainPage'
import Lesson1 from './pages/week1pages/Lesson1'
import Lesson2 from './pages/week1pages/Lesson2'
import Lesson3 from './pages/week1pages/Lesson3'
import Activity1 from './pages/week1pages/Activity1'



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

      
              
    </Routes> 
  )
}

export default App
