import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginV_Context from './Context/LoginV_Context.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
createRoot(document.getElementById('root')).render(
  <LoginV_Context>
    <StrictMode>
    <App />
  </StrictMode>,
  </LoginV_Context>
  
)
