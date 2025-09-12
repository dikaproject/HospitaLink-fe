// Update: hospitalink-fe/src/pages/dashboard.tsx - Remove light mode gradient cards
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
    AlertCircle,
    MessageCircle,
    CheckCircle
} from "lucide-react"
import { authService } from '@/services/auth'
import { toast } from 'sonner'

interface DashboardStats {
    // Admin stats
    totalUsers?: number
    totalDoctors?: number
    todayQueues?: number
    todayConsultations?: number
    activeDoctors?: number
    // Doctor stats
    totalToday?: number
    completedToday?: number
    waitingToday?: number
    pendingConsultations?: number
}

interface CurrentUser {
    role: 'ADMIN' | 'DOCTOR'
    name: string
    email: string
}

export default function UnifiedDashboard() {
    const [stats, setStats] = useState<DashboardStats>({})
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Detect user role from cookie or localStorage
            const userRole = authService.getUserRole()
            
            let response
            if (userRole === 'ADMIN') {
                response = await authService.getAdminDashboard()
                setCurrentUser({
                    role: 'ADMIN',
                    name: response.data.admin?.fullName || 'Admin',
                    email: response.data.admin?.email || ''
                })
            } else if (userRole === 'DOCTOR') {
                response = await authService.getDoctorDashboard()
                setCurrentUser({
                    role: 'DOCTOR',
                    name: response.data.doctor?.name || 'Doctor',
                    email: response.data.doctor?.email || ''
                })
            }
            
            setStats(response?.data?.stats || {})
        } catch (error: any) {
            toast.error(error.message || 'Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Render based on user role
    if (currentUser?.role === 'ADMIN') {
        return <AdminDashboard stats={stats} user={currentUser} onRefresh={fetchDashboardData} />
    } else if (currentUser?.role === 'DOCTOR') {
        return <DoctorDashboard stats={stats} user={currentUser} onRefresh={fetchDashboardData} />
    }

    // Fallback if no role detected
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="p-6 text-center border-border">
                <h2 className="text-xl font-semibold mb-2 text-foreground">Akses Tidak Diizinkan</h2>
                <p className="text-muted-foreground mb-4">Silakan login kembali</p>
                <Button onClick={() => window.location.href = '/auth'}>
                    Login Ulang
                </Button>
            </Card>
        </div>
    )
}

// Admin Dashboard Component
function AdminDashboard({ stats, user, onRefresh }: { stats: DashboardStats, user: CurrentUser, onRefresh: () => void }) {
    return (
        <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Dashboard Admin
                </h1>
                <p className="text-muted-foreground">Selamat datang, {user.name}</p>
                <Button onClick={onRefresh} variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-300">Total Pasien</CardTitle>
                        <Users className="h-5 w-5 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-200">{stats.totalUsers || 0}</div>
                        <p className="text-xs text-blue-400 mt-2">Terdaftar</p>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-300">Antrian Hari Ini</CardTitle>
                        <Calendar className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-200">{stats.todayQueues || 0}</div>
                        <p className="text-xs text-green-400 mt-2">Antrian aktif</p>
                    </CardContent>
                </Card>

                <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-300">Konsultasi</CardTitle>
                        <MessageCircle className="h-5 w-5 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-200">{stats.todayConsultations || 0}</div>
                        <p className="text-xs text-purple-400 mt-2">Hari ini</p>
                    </CardContent>
                </Card>

                <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-300">Total Dokter</CardTitle>
                        <Stethoscope className="h-5 w-5 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-200">{stats.totalDoctors || 0}</div>
                        <p className="text-xs text-indigo-400 mt-2">Terdaftar</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-300">Dokter Aktif</CardTitle>
                        <Activity className="h-5 w-5 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-200">{stats.activeDoctors || 0}</div>
                        <p className="text-xs text-orange-400 mt-2">Siap melayani</p>
                    </CardContent>
                </Card>
            </section>

            {/* Admin specific content */}
            <section className="grid gap-4 md:grid-cols-3">
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Users className="h-5 w-5" />
                            Kelola Pasien
                        </CardTitle>
                        <CardDescription>Tambah, edit, dan kelola data pasien</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => window.location.href = '/patient'}>
                            Buka Manajemen Pasien
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Stethoscope className="h-5 w-5" />
                            Kelola Dokter
                        </CardTitle>
                        <CardDescription>Manajemen dokter dan jadwal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="outline">
                            Kelola Dokter
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Activity className="h-5 w-5" />
                            Laporan
                        </CardTitle>
                        <CardDescription>Lihat laporan dan analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/chart'}>
                            Lihat Charts
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

// Doctor Dashboard Component
function DoctorDashboard({ stats, user, onRefresh }: { stats: DashboardStats, user: CurrentUser, onRefresh: () => void }) {
    return (
        <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                    Dashboard Dokter
                </h1>
                <p className="text-muted-foreground">Selamat datang, Dr. {user.name}</p>
                <Button onClick={onRefresh} variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-300">Total Hari Ini</CardTitle>
                        <Users className="h-5 w-5 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-200">{stats.totalToday || 0}</div>
                        <p className="text-xs text-blue-400 mt-2">Pasien</p>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-300">Selesai</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-200">{stats.completedToday || 0}</div>
                        <p className="text-xs text-green-400 mt-2">Konsultasi</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-300">Menunggu</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-200">{stats.waitingToday || 0}</div>
                        <p className="text-xs text-yellow-400 mt-2">Antrian</p>
                    </CardContent>
                </Card>

                <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-300">Chat Online</CardTitle>
                        <MessageCircle className="h-5 w-5 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-200">{stats.pendingConsultations || 0}</div>
                        <p className="text-xs text-purple-400 mt-2">Pending</p>
                    </CardContent>
                </Card>
            </section>

            {/* Doctor specific content */}
            <section className="grid gap-4 md:grid-cols-3">
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <UserPlus className="h-5 w-5" />
                            Kelola Antrian
                        </CardTitle>
                        <CardDescription>Panggil pasien dan kelola antrian</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            Buka Antrian
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <MessageCircle className="h-5 w-5" />
                            Konsultasi Online
                        </CardTitle>
                        <CardDescription>Balas chat konsultasi dari pasien</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="outline">
                            Lihat Chat ({stats.pendingConsultations || 0})
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Calendar className="h-5 w-5" />
                            Jadwal Appointment
                        </CardTitle>
                        <CardDescription>Kelola jadwal appointment pasien</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="outline">
                            Lihat Jadwal
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}