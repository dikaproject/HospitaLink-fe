import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
  Activity,
  Users,
  Stethoscope,
  ClipboardList,
  Pill,
  MessageCircle,
  PieChart,
  UserPlus,
  QrCode,
  Clock,
  Search,
  Calendar,
  Hospital,
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

// ==== tambahkan CSS untuk hide scrollbar ====
import "./css/sidebar.css"

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
      isActive: false,
    },
    {
      title: "Manajemen Pasien",
      url: "/patient",
      icon: Users,
      items: [
        { title: "Data Pasien", url: "/patient" },
        { title: "Registrasi Pasien", url: "/patient/register" },
        { title: "Check-in Pasien", url: "/patient/checkin" },
        { title: "Kartu Pasien", url: "/patient/cards" },
      ],
    },
    {
      title: "Manajemen Dokter",
      url: "/doctor",
      icon: Stethoscope,
      items: [
        { title: "Data Dokter", url: "/doctor" },
        { title: "Status Kehadiran", url: "/doctor/attendance" },
      ],
    },
    {
      title: "Sistem Antrian",
      url: "/queue",
      icon: ClipboardList,
      items: [
        { title: "Antrian", url: "/queue" },
        { title: "Panggil Pasien", url: "/queue/call" },
      ],
    },
    {
      title: "Farmasi & Resep",
      url: "/pharmacy",
      icon: Pill,
      items: [
        { title: "Cek Resep (Kode)", url: "/pharmacy/prescriptions" },
        { title: "Kelola Obat", url: "/pharmacy/medications" },
        { title: "Pembayaran Resep", url: "/pharmacy/payments" },
        { title: "Laporan Farmasi", url: "/pharmacy/reports" },
      ],
    },
    {
      title: "Konsultasi Online",
      url: "/consultation",
      icon: MessageCircle,
      items: [
        { title: "Monitor Chat", url: "/consultation/monitor" },
        { title: "AI Triage Results", url: "/consultation/ai-results" },
        { title: "Riwayat Konsultasi", url: "/consultation/history" },
      ],
    },
    {
      title: "Laporan & Analytics",
      url: "/reports",
      icon: PieChart,
      items: [
        { title: "Dashboard Analytics", url: "/chart" },
        { title: "Laporan Harian", url: "/reports/daily" },
        { title: "Laporan Bulanan", url: "/reports/monthly" },
        { title: "Performa Dokter", url: "/reports/doctors" },
      ],
    },
  ],
  projects: [
    { name: "Registrasi Cepat", url: "/patient/quick-register", icon: UserPlus },
    { name: "Check-in Pasien", url: "/patient/quick-checkin", icon: QrCode },
    { name: "Panggil Antrian", url: "/queue/quick-call", icon: Clock },
    { name: "Cek Resep", url: "/pharmacy/quick-check", icon: Search },
  ],
}

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
      isActive: false,
    },
    {
      title: "Kelola Antrian",
      url: "/doctor/queue",
      icon: ClipboardList,
      items: [
        { title: "Antrian Hari Ini", url: "/doctor/queue" },
        { title: "Riwayat Antrian", url: "/doctor/queue/history" },
      ],
    },
    {
      title: "Jadwal Praktik",
      url: "/doctor/schedule",
      icon: Calendar,
      items: [
        { title: "Jadwal Minggu Ini", url: "/doctor/schedule" },
        { title: "Jadwal Mendatang", url: "/doctor/schedule/upcoming" },
      ],
    },
    {
      title: "Resep Digital",
      url: "/doctor/prescription",
      icon: Pill,
      items: [
        { title: "Resep Hari Ini", url: "/doctor/prescription" },
        { title: "Buat Resep", url: "/doctor/prescription/create" },
        { title: "Riwayat Resep", url: "/doctor/prescription/history" },
      ],
    },
    {
      title: "Konsultasi Online",
      url: "/doctor/consultation",
      icon: MessageCircle,
      items: [
        { title: "Chat Aktif", url: "/doctor/consultation" },
        { title: "Menunggu Respons", url: "/doctor/consultation/pending" },
      ],
    },
  ],
  projects: [{ name: "Buat Resep", url: "/doctor/prescription/create", icon: Pill }],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentData, setCurrentData] = useState(adminData)
  const [userRole, setUserRole] = useState<"ADMIN" | "DOCTOR" | null>(null)
  const location = useLocation()

  useEffect(() => {
    const role = authService.getUserRole()
    const user = authService.getCurrentUser()

    setUserRole(role)

    const currentUrl = location.pathname + location.search

    const isUrlMatch = (itemUrl: string, currentUrl: string) => {
      if (itemUrl === location.pathname) return true
      const [itemPath, itemQuery] = itemUrl.split("?")
      if (itemPath === location.pathname && itemQuery) {
        return location.search.includes(itemQuery)
      }
      return false
    }

    if (role === "ADMIN") {
      setCurrentData({
        ...adminData,
        user: {
          name: user?.name || "Admin HospitaLink",
          email: user?.email || "admin@hospitalink.com",
          avatar: user?.profilePicture || "/avatars/admin.jpg",
        },
        navMain: adminData.navMain.map((item) => ({
          ...item,
          isActive:
            isUrlMatch(item.url, currentUrl) ||
            (item.items && item.items.some((subItem) => isUrlMatch(subItem.url, currentUrl))),
        })),
      })
    } else if (role === "DOCTOR") {
      setCurrentData({
        ...doctorData,
        user: {
          name: user?.name || "Dr. Dokter",
          email: user?.email || "doctor@hospitalink.com",
          avatar: user?.profilePicture || "/avatars/doctor.jpg",
        },
        navMain: doctorData.navMain.map((item) => ({
          ...item,
          isActive:
            isUrlMatch(item.url, currentUrl) ||
            (item.items && item.items.some((subItem) => isUrlMatch(subItem.url, currentUrl))),
        })),
      })
    }
  }, [location.pathname, location.search])

  const handleLogout = async () => {
    try {
      await authService.logout()
      window.location.href = "/auth"
    } catch (error) {
      console.error("Logout error:", error)
      localStorage.clear()
      window.location.href = "/auth"
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-gray-200/80 dark:border-gray-800/80 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900/95 dark:to-gray-950/95 backdrop-blur-xl"
      {...props}
    >
      <SidebarHeader className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <TeamSwitcher teams={currentData.teams} />
      </SidebarHeader>

      {/* tambahin class custom di sini */}
      <SidebarContent className="px-2 py-4 space-y-2 no-scrollbar">
        <NavMain items={currentData.navMain} />
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-4" />
        <NavProjects projects={currentData.projects} />
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-2">
        <NavUser user={currentData.user} onLogout={handleLogout} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
