import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard        from './pages/Dashboard.jsx'
import Engagements      from './pages/Engagements.jsx'
import EngagementDetail from './pages/EngagementDetail.jsx'
import ClientView       from './pages/ClientView.jsx'
import Method           from './pages/Method.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Client read-only view — no sidebar */}
        <Route path="/client/:token" element={<ClientView />} />

        {/* Main analyst app */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/"                    element={<Dashboard />} />
              <Route path="/engagements"         element={<Engagements />} />
              <Route path="/engagements/:id"     element={<EngagementDetail />} />
              <Route path="/method"              element={<Method />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </HashRouter>
  )
}
