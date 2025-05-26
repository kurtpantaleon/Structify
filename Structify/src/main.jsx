import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContextProvider from './context/authContextProvider.jsx'
import { LessonProgressProvider } from './context/lessonProgressContext.jsx'
import { GameStatsProvider } from './context/gameStatsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthContextProvider>
      <GameStatsProvider>
        <LessonProgressProvider>
            <App />
            </LessonProgressProvider>
          </GameStatsProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
)
