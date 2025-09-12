import { useState, useEffect } from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Calendar,
  Stethoscope,
  MessageCircle,
  Pill,
  ClipboardList,
  UserPlus,
  UserCheck,
  QrCode,
  Clock,
  LogOut,
  Shield,
  Activity,
  FileText,
  CalendarCheck,
  Hospital,
  Search
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authService } from "@/services/auth"

// Data untuk Admin
const adminData = {
  user: {
    name: "Admin HospitaLink",
    email: "admin@hospitalink.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "HospitaLink",
      logo: Hospital,
      plan: "Admin Panel",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
    },
    {
      title: "Manajemen Pasien",
      url: "/patient",
      icon: Users,
      items: [
        {
          title: "Data Pasien",
          url: "/patient",
        },
        {
          title: "Registrasi Pasien",
          url: "/patient/register",
        },
        {
          title: "Check-in Pasien",
          url: "/patient/checkin",
        },
        {
          title: "Kartu Pasien",
          url: "/patient/cards",
        },
      ],
    },
    {
      title: "Manajemen Dokter",
      url: "/doctor",
      icon: Stethoscope,
      items: [
        {
          title: "Data Dokter",
          url: "/doctor",
        },
        {
          title: "Tambah Dokter",
          url: "/doctor/add",
        },
        {
          title: "Jadwal Dokter",
          url: "/doctor/schedule",
        },
        {
          title: "Status Kehadiran",
          url: "/doctor/attendance",
        },
      ],
    },
    {
      title: "Sistem Antrian",
      url: "/queue",
      icon: ClipboardList,
      items: [
        {
          title: "Monitor Antrian",
          url: "/queue",
        },
        {
          title: "Kelola Antrian",
          url: "/queue/manage",
        },
        {
          title: "Panggil Pasien",
          url: "/queue/call",
        },
        {
          title: "Riwayat Antrian",
          url: "/queue/history",
        },
      ],
    },
    {
      title: "Farmasi & Resep",
      url: "/pharmacy",
      icon: Pill,
      items: [
        {
          title: "Cek Resep (Kode)",
          url: "/pharmacy/prescriptions",
        },
        {
          title: "Kelola Obat",
          url: "/pharmacy/medications",
        },
        {
          title: "Pembayaran Resep",
          url: "/pharmacy/payments",
        },
        {
          title: "Laporan Farmasi",
          url: "/pharmacy/reports",
        },
      ],
    },
    {
      title: "Konsultasi Online",
      url: "/consultation",
      icon: MessageCircle,
      items: [
        {
          title: "Monitor Chat",
          url: "/consultation/monitor",
        },
        {
          title: "AI Triage Results",
          url: "/consultation/ai-results",
        },
        {
          title: "Riwayat Konsultasi",
          url: "/consultation/history",
        },
      ],
    },
    {
      title: "Laporan & Analytics",
      url: "/reports",
      icon: PieChart,
      items: [
        {
          title: "Dashboard Analytics",
          url: "/chart",
        },
        {
          title: "Laporan Harian",
          url: "/reports/daily",
        },
        {
          title: "Laporan Bulanan",
          url: "/reports/monthly",
        },
        {
          title: "Performa Dokter",
          url: "/reports/doctors",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Registrasi Cepat",
      url: "/patient/quick-register",
      icon: UserPlus,
    },
    {
      name: "Check-in Pasien",
      url: "/patient/quick-checkin",
      icon: QrCode,
    },
    {
      name: "Panggil Antrian",
      url: "/queue/quick-call",
      icon: Clock,
    },
    {
      name: "Cek Resep",
      url: "/pharmacy/quick-check",
      icon: Search,
    },
  ],
}

// Data untuk Dokter
const doctorData = {
  user: {
    name: "Dr. Sarah",
    email: "dr.sarah@hospitalink.com",
    avatar: "/avatars/doctor.jpg",
  },
  teams: [
    {
      name: "HospitaLink",
      logo: Stethoscope,
      plan: "Dashboard Dokter",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
    },
    {
      title: "Kelola Antrian",
      url: "/doctor/queue",
      icon: ClipboardList,
      items: [
        {
          title: "Antrian Aktif",
          url: "/doctor/queue",
        },
        {
          title: "Panggil Pasien",
          url: "/doctor/queue/call",
        },
        {
          title: "Riwayat Hari Ini",
          url: "/doctor/queue/today",
        },
      ],
    },
    {
      title: "Chat Online",
      url: "/doctor/consultation",
      icon: MessageCircle,
      items: [
        {
          title: "Chat Aktif",
          url: "/doctor/consultation",
        },
        {
          title: "Menunggu Respons",
          url: "/doctor/consultation/pending",
        },
        {
          title: "Riwayat Chat",
          url: "/doctor/consultation/history",
        },
      ],
    },
    {
      title: "Jadwal & Appointment",
      url: "/doctor/schedule",
      icon: Calendar,
      items: [
        {
          title: "Jadwal Hari Ini",
          url: "/doctor/schedule/today",
        },
        {
          title: "Jadwal Minggu Ini",
          url: "/doctor/schedule/week",
        },
        {
          title: "Appointment",
          url: "/doctor/appointments",
        },
      ],
    },
    {
      title: "Resep Digital",
      url: "/doctor/prescriptions",
      icon: Pill,
      items: [
        {
          title: "Buat Resep",
          url: "/doctor/prescriptions/create",
        },
        {
          title: "Resep Hari Ini",
          url: "/doctor/prescriptions/today",
        },
        {
          title: "Riwayat Resep",
          url: "/doctor/prescriptions/history",
        },
      ],
    },
    {
      title: "Rekam Medis",
      url: "/doctor/medical-records",
      icon: FileText,
      items: [
        {
          title: "Input Diagnosis",
          url: "/doctor/medical-records/create",
        },
        {
          title: "Riwayat Pasien",
          url: "/doctor/medical-records/history",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Panggil Pasien Berikutnya",
      url: "/doctor/queue/next",
      icon: UserCheck,
    },
    {
      name: "Buat Resep Cepat",
      url: "/doctor/prescriptions/quick",
      icon: Pill,
    },
    {
      name: "Cek Jadwal",
      url: "/doctor/schedule/quick",
      icon: CalendarCheck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentData, setCurrentData] = useState(adminData)
  const [userRole, setUserRole] = useState<'ADMIN' | 'DOCTOR' | null>(null)

  useEffect(() => {
    // Get user role from auth service
    const role = authService.getUserRole()
    const user = authService.getCurrentUser()
    
    setUserRole(role)
    
    if (role === 'ADMIN') {
      setCurrentData({
        ...adminData,
        user: {
          name: user?.name || "Admin HospitaLink",
          email: user?.email || "admin@hospitalink.com",
          avatar: user?.profilePicture || "/avatars/admin.jpg",
        }
      })
    } else if (role === 'DOCTOR') {
      setCurrentData({
        ...doctorData,
        user: {
          name: user?.name || "Dr. Dokter",
          email: user?.email || "doctor@hospitalink.com",
          avatar: user?.profilePicture || "/avatars/doctor.jpg",
        }
      })
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      window.location.href = '/auth'
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API fails
      localStorage.clear()
      window.location.href = '/auth'
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={currentData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={currentData.navMain} />
        <NavProjects projects={currentData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentData.user} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}