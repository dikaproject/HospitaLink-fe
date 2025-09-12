import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users,
    Calendar,
    Bed,
    Pill,
    TrendingUp,
    Clock,
    Activity,
    UserPlus,
    Stethoscope,
    AlertCircle
} from "lucide-react"
import { authService } from '@/services/auth'
import { toast } from 'sonner'

interface AdminStats {
    totalUsers: number
    totalDoctors: number
    todayQueues: number
    todayConsultations: number
    activeDoctors: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalDoctors: 0,
        todayQueues: 0,
        todayConsultations: 0,
        activeDoctors: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await authService.getAdminDashboard()
            setStats(response.data.stats)
        } catch (error: any) {
            toast.error(error.message || 'Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    // Mock data for demo - replace with real API calls later
    const recentPatients = [
        { id: "PT-0012", name: "Andi Wijaya", diagnosis: "Demam", date: "2025-01-15", status: "Aktif" },
        { id: "PT-0013", name: "Siti Nurhaliza", diagnosis: "Flu", date: "2025-01-15", status: "Rawat Jalan" },
        { id: "PT-0014", name: "Budi Santoso", diagnosis: "Hipertensi", date: "2025-01-15", status: "Kontrol" },
        { id: "PT-0015", name: "Rina Kurnia", diagnosis: "Gastritis", date: "2025-01-15", status: "Rawat Inap" },
        { id: "PT-0016", name: "Ahmad Fauzi", diagnosis: "Diabetes", date: "2025-01-15", status: "Aktif" },
    ]

    const activities = [
        { time: "08:10", action: "Check-in IGD", count: stats.todayQueues, icon: UserPlus },
        { time: "09:25", action: "Konsultasi online", count: stats.todayConsultations, icon: Pill },
        { time: "10:40", action: "Dokter aktif", count: stats.activeDoctors, icon: Stethoscope },
        { time: "11:15", action: "Total pasien", count: stats.totalUsers, icon: TrendingUp },
    ]

    type Status = "Aktif" | "Rawat Jalan" | "Kontrol" | "Rawat Inap"

    const getStatusBadge = (status: Status) => {
        const statusConfig: Record<Status, string> = {
            "Aktif": "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100",
            "Rawat Jalan": "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100",
            "Kontrol": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100",
            "Rawat Inap": "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100",
        }

        return (
            <Badge variant="secondary" className={statusConfig[status]}>
                {status}
            </Badge>
        )
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Dashboard Admin
                </h1>
                <p className="text-muted-foreground">Ringkasan operasional HospitaLink hari ini</p>
                <Button onClick={fetchDashboardData} variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-200">Total Pasien</CardTitle>
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-300 mt-2">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Terdaftar
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-200">Antrian Hari Ini</CardTitle>
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.todayQueues}</div>
                        <div className="flex items-center text-xs text-green-600 dark:text-green-300 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Antrian aktif
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-200">Konsultasi Online</CardTitle>
                        <Pill className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.todayConsultations}</div>
                        <div className="flex items-center text-xs text-purple-600 dark:text-purple-300 mt-2">
                            <Activity className="h-3 w-3 mr-1" />
                            Hari ini
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950 dark:to-indigo-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-200">Total Dokter</CardTitle>
                        <Stethoscope className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.totalDoctors}</div>
                        <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-300 mt-2">
                            <Users className="h-3 w-3 mr-1" />
                            Terdaftar
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-200">Dokter Aktif</CardTitle>
                        <Activity className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.activeDoctors}</div>
                        <div className="flex items-center text-xs text-orange-600 dark:text-orange-300 mt-2">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Siap melayani
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Rest of the component remains the same... */}
            <section className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">Pasien Terbaru</CardTitle>
                            <CardDescription>Data registrasi dan status terkini</CardDescription>
                        </div>
                        <button className="text-sm text-primary hover:underline font-medium transition-colors">
                            Lihat semua
                        </button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-muted-foreground">
                                    <tr>
                                        <th className="text-left font-semibold px-6 py-3">ID Pasien</th>
                                        <th className="text-left font-semibold px-6 py-3">Nama</th>
                                        <th className="text-left font-semibold px-6 py-3">Diagnosis</th>
                                        <th className="text-left font-semibold px-6 py-3">Status</th>
                                        <th className="text-left font-semibold px-6 py-3">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPatients.map((patient) => (
                                        <tr key={patient.id} className="border-t hover:bg-muted/30">
                                            <td className="px-6 py-3 font-medium text-primary">{patient.id}</td>
                                            <td className="px-6 py-3 font-medium">{patient.name}</td>
                                            <td className="px-6 py-3">{patient.diagnosis}</td>
                                            <td className="px-6 py-3">{getStatusBadge(patient.status as Status)}</td>
                                            <td className="px-6 py-3 text-muted-foreground">{patient.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Aktivitas Hari Ini</CardTitle>
                        <CardDescription>Log aktivitas terkini</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activities.map((activity, index) => {
                            const IconComponent = activity.icon
                            return (
                                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <IconComponent className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{activity.action}</span>
                                            <Badge variant="secondary" className="ml-2">{activity.count}</Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                    <div className="px-6 pb-6">
                        <button className="text-sm text-primary hover:underline font-medium transition-colors">
                            Lihat detail lengkap
                        </button>
                    </div>
                </Card>
            </section>
        </div>
    )
}