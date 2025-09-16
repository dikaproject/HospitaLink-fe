import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { 
    UserCheck, 
    UserX, 
    Users, 
    Stethoscope,
    Search,
    RefreshCw,
    Activity,
    Clock
} from "lucide-react"
import DoctorAttendanceCard from "@/components/admin/doctor-attendance/DoctorAttendanceCard"
import { doctorService } from "@/services/admin/doctor"
import type { DoctorAttendanceItem, DoctorAttendanceStats, DoctorPagination } from "@/types/admin/doctor"

function DoctorAttendancePage() {
    const [doctors, setDoctors] = useState<DoctorAttendanceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [specialtyFilter, setSpecialtyFilter] = useState<string>("ALL")
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ON_DUTY" | "AVAILABLE" | "OFFLINE">("ALL")
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)
    const [pagination, setPagination] = useState<DoctorPagination>({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
    })
    
    // Stats
    const [stats, setStats] = useState<DoctorAttendanceStats>({
        totalDoctors: 0,
        onDutyCount: 0,
        availableCount: 0,
        offlineCount: 0,
        specialtyBreakdown: []
    })

    // Available specialties for filter
    const [specialties, setSpecialties] = useState<string[]>([])

    // Load doctor attendance data
    const loadDoctorAttendance = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await doctorService.getDoctorsAttendance(
                currentPage,
                pageSize,
                searchQuery,
                specialtyFilter,
                statusFilter
            )

            if (response.success) {
                setDoctors(response.data.doctors)
                setPagination(response.data.pagination)
                setStats(response.data.stats)
                
                // Extract unique specialties
                const uniqueSpecialties = Array.from(
                    new Set(response.data.doctors.map(d => d.doctorProfile?.specialty).filter(Boolean))
                ) as string[]
                setSpecialties(uniqueSpecialties)
            } else {
                setError(response.message || 'Gagal memuat data kehadiran dokter')
            }
        } catch (err: any) {
            console.error('Load doctor attendance error:', err)
            setError(err.response?.data?.message || 'Gagal memuat data kehadiran dokter')
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, searchQuery, specialtyFilter, statusFilter])

    // Load data on mount and when filters change
    useEffect(() => {
        loadDoctorAttendance()
    }, [loadDoctorAttendance])

    // Reset page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1)
        }
    }, [searchQuery, specialtyFilter, statusFilter])

    // Handle view doctor detail
    const handleViewDetail = (doctor: DoctorAttendanceItem) => {
        // Navigate to doctor detail page or open modal
        console.log('View doctor detail:', doctor.id)
        // You can implement navigation here
    }

    // Handle toggle duty status
    const handleToggleDuty = async (doctorId: string, isOnDuty: boolean) => {
        try {
            await doctorService.updateDoctorDutyStatus(doctorId, isOnDuty)
            await loadDoctorAttendance() // Refresh data
        } catch (error) {
            console.error('Toggle duty error:', error)
            alert('Gagal mengubah status bertugas')
        }
    }

    // Handle toggle availability
    const handleToggleAvailability = async (doctorId: string, isAvailable: boolean) => {
        try {
            await doctorService.updateDoctorAvailability(doctorId, isAvailable)
            await loadDoctorAttendance() // Refresh data
        } catch (error) {
            console.error('Toggle availability error:', error)
            alert('Gagal mengubah status ketersediaan')
        }
    }

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage)
        }
    }

    // Handle refresh
    const handleRefresh = () => {
        loadDoctorAttendance()
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-600" />
                        Kehadiran Dokter
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitor status dan kehadiran dokter secara real-time
                    </p>
                </div>
                
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Dokter</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDoctors}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bertugas</p>
                                <p className="text-2xl font-bold text-green-600">{stats.onDutyCount}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tersedia</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.availableCount}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-gray-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.offlineCount}</p>
                            </div>
                            <UserX className="h-8 w-8 text-gray-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Specialty Breakdown */}
            {stats.specialtyBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            Breakdown per Spesialis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.specialtyBreakdown.map((breakdown, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{breakdown.specialty}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="default" className="text-xs">{breakdown.onDuty} Bertugas</Badge>
                                        <Badge variant="outline" className="text-xs">{breakdown.available} Tersedia</Badge>
                                        <Badge variant="secondary" className="text-xs">{breakdown.total} Total</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Dokter</CardTitle>
                    <CardDescription>
                        Filter dokter berdasarkan pencarian, spesialis, dan status kehadiran
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari nama dokter, email, atau nomor lisensi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Pilih Spesialis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Spesialis</SelectItem>
                                {specialties.map((specialty) => (
                                    <SelectItem key={specialty} value={specialty}>
                                        {specialty}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Status Kehadiran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Status</SelectItem>
                                <SelectItem value="ON_DUTY">Bertugas</SelectItem>
                                <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                                <SelectItem value="OFFLINE">Offline</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Doctor Cards */}
            <Card className="shadow-lg border-0 dark:border-gray-800">
                <CardHeader>
                    <CardTitle>Daftar Dokter</CardTitle>
                    <CardDescription>
                        Menampilkan {doctors.length} dari {pagination.totalCount} dokter
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Memuat data dokter...</p>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 dark:text-gray-400">
                                <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium text-lg">
                                    {searchQuery || specialtyFilter !== "ALL" || statusFilter !== "ALL" ?
                                        "Tidak ada dokter ditemukan" :
                                        "Belum ada data dokter"
                                    }
                                </p>
                                <p className="text-sm mt-2">
                                    {searchQuery || specialtyFilter !== "ALL" || statusFilter !== "ALL" ?
                                        "Coba ubah kriteria pencarian atau filter" :
                                        "Data dokter akan muncul di sini setelah dokter terdaftar"
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {doctors.map((doctor) => (
                                <DoctorAttendanceCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onViewDetail={() => handleViewDetail(doctor)}
                                    onToggleDuty={(isOnDuty) => handleToggleDuty(doctor.id, isOnDuty)}
                                    onToggleAvailability={(isAvailable) => handleToggleAvailability(doctor.id, isAvailable)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Halaman {pagination.currentPage} dari {pagination.totalPages}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.hasNext}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorAttendancePage