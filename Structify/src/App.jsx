import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationBar from './components/NavigationBar'
import Header from './components/Header'

function App() {
  const [count, setCount] = useState(0)
 
  return (
    <>
      <Header></Header>
      <NavigationBar></NavigationBar>
    </>
  )
}

export default App
