import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationBar from './components/NavigationBar'
import Header from './components/Header'
import SubHeading from './components/SubHeading'

function App() {
  return (
    <>
      <Header></Header>
      <SubHeading></SubHeading>
      <NavigationBar></NavigationBar>
    </>
  )
}

export default App
