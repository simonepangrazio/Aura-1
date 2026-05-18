import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home          from './pages/Home'
import StartBuilding from './pages/StartBuilding'
import Templates     from './pages/Templates'
import ScenarioDetail from './pages/ScenarioDetail'
import Demo          from './pages/Demo'
import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import AvatarContainer from './pages/AvatarContainer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/start-building"    element={<StartBuilding />} />
        <Route path="/templates"         element={<Templates />} />
        <Route path="/templates/:id"     element={<ScenarioDetail />} />
        <Route path="/demo"              element={<Demo />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/dashboard"         element={<Dashboard />} />
        <Route path="/avatar"            element={<AvatarContainer />} />
      </Routes>
    </BrowserRouter>
  )
}
