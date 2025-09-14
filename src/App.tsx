import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import Layout from "@/components/layout"
import Dashboard from "@/pages/dashboard"
import Patient from "@/pages/admin/patien"
import Doctor from "@/pages/admin/doctor"
import Queue from "@/pages/admin/queue"
import Chart from "@/pages/chart"

// Doctor pages
import DoctorQueue from "@/pages/doctor/queue"
import DoctorPrescription from "@/pages/doctor/prescription"
import DoctorPrescriptionHistory from "@/pages/doctor/prescription-history"
import CreatePrescriptionPage from "@/pages/doctor/create-prescription"
import QueueHistory from "@/pages/doctor/queue-history"
import DoctorSchedule from "@/pages/doctor/schedule"
import ScheduleUpcoming from "@/pages/doctor/schedule-upcoming"
import Chat from "@/pages/doctor/chat"

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
          <Route path="/queue" element={<Queue />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/chart" element={<Chart />} />
          
          {/* Doctor routes */}
          <Route path="/doctor/queue" element={<DoctorQueue />} />
          <Route path="/doctor/queue/history" element={<QueueHistory />} />
          <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/doctor/schedule/upcoming" element={<ScheduleUpcoming />} />
          <Route path="/doctor/prescription" element={<DoctorPrescription />} />
          <Route path="/doctor/prescription/create" element={<CreatePrescriptionPage />} />
          <Route path="/doctor/prescription/history" element={<DoctorPrescriptionHistory />} />
          <Route path="/doctor/chat" element={<Chat />} />
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