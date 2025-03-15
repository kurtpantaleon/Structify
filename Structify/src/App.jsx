import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationBar from './components/NavigationBar'
import Header from './components/Header'
import SubHeading from './components/SubHeading'

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false); // ✅ Controls sidebar visibility

  return (
    <>
      <Header></Header>
      {/* <SubHeading></SubHeading>
      <NavigationBar></NavigationBar> */}
      
      {/* ✅ Pass the toggle function to SubHeading */}
      <SubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} />

      {/* ✅ Show NavigationBar only when isNavOpen is true */}
      {isNavOpen && <NavigationBar />}
    </>
  )
}

export default App
