import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Signup from './register/Signup.jsx'
import Qrlogin from './qr-codes/Registerqr.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/bigadmin' element={<App/>}/>
      <Route path='/login' element={<Signup/>}/>
      <Route path='/' element={<Qrlogin/>}/>
    </Routes>
  </BrowserRouter>
)
