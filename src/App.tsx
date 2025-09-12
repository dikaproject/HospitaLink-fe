import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import Layout from "@/components/layout"
import Dashboard from "@/pages/dashboard"
import Patient from "@/pages/patien"
import Chart from "@/pages/chart"

// Unified auth page
import AuthPage from "@/pages/auth"

function App() {
  return (
    <>
      <Routes>
        {/* Auth Routes (unified) */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Main App Routes (with sidebar - role-based features) */}
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/chart" element={<Chart />} />
        </Route>
      </Routes>
      
      <Toaster 
        position="top-right" 
        closeButton 
        richColors 
        expand 
      />
    </>
  )
}

export default App