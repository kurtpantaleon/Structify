import './App.css'
import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/Start'
import MainPage from './pages/MainPage'


function App() {
 

  return (
    <Routes>

      <Route path="/" element={<StartPage/>} />
      <Route path="/mainPage" element={<MainPage/>} />
              
    </Routes> 
  )
}

export default App
