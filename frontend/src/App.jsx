import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './admin/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Projects from './pages/Projects'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './admin/pages/AdminDashboard'
import ServicesManagement from './admin/pages/ServicesManagement'
import ProjectsManagement from './admin/pages/ProjectsManagement'
import TeamManagement from './admin/pages/TeamManagement'
import InquiriesManagement from './admin/pages/InquiriesManagement'
import AdminSettings from './admin/pages/AdminSettings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="inquiries" element={<InquiriesManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
