import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Salom from './Salom.jsx'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path='/' element={<App/>}/>
      <Route path='/salom' element={<Salom/>}/>
    </Routes>
  </HashRouter>
)
