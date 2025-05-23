import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContextProvider from './context/authContextProvider.jsx'
import { LessonProgressProvider } from './context/lessonProgressContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthContextProvider>
        <LessonProgressProvider>
          <App />
        </LessonProgressProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
)
