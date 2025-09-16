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
import { CreditCard, Search, Download, Printer } from "lucide-react"
import PatientCard from "@/components/admin/patient-card/PatientCard"
import PatientCardDetailDialog from "@/components/admin/patient-card/PatientCardDetailDialog"
import { patientCardService, type PatientCardPagination } from "@/services/admin/patientCard"
import type { Patient } from "@/types/admin/patientCard"

function PatientCardPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Dialog states
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [downloadingCardId, setDownloadingCardId] = useState<string | null>(null)

    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL")
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(50)
    const [pagination, setPagination] = useState<PatientCardPagination>({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 50,
        hasNext: false,
        hasPrev: false
    })

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        male: 0,
        female: 0
    })

    // Load patient cards
    const loadPatientCards = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            console.log('Loading patient cards...', {
                page: currentPage,
                limit: pageSize,
                search: searchQuery,
                gender: genderFilter,
                status: statusFilter
            })

            const response = await patientCardService.getCards(
                currentPage,
                pageSize,
                searchQuery,
                genderFilter,
                statusFilter
            )

            console.log('Service response:', response)

            if (response.success) {
                setPatients(response.data)

                // Update pagination if available
                if (response.pagination) {
                    setPagination(response.pagination)
                }

                // Calculate stats from current page data
                // Note: For accurate stats, you might want to make a separate API call for totals
                const currentPageStats = {
                    total: response.data.length,
                    active: response.data.filter(p => p.isActive).length,
                    inactive: response.data.filter(p => !p.isActive).length,
                    male: response.data.filter(p => p.gender === 'MALE').length,
                    female: response.data.filter(p => p.gender === 'FEMALE').length
                }

                // If we have pagination, use total count for better stats
                if (response.pagination) {
                    setStats({
                        total: response.pagination.totalCount,
                        active: currentPageStats.active,
                        inactive: currentPageStats.inactive,
                        male: currentPageStats.male,
                        female: currentPageStats.female
                    })
                } else {
                    setStats(currentPageStats)
                }
            } else {
                setError(response.error || response.message || 'Failed to load patient cards')
                setPatients([])
                setPagination({
                    currentPage: 1,
                    totalPages: 0,
                    totalCount: 0,
                    limit: pageSize,
                    hasNext: false,
                    hasPrev: false
                })
                setStats({
                    total: 0,
                    active: 0,
                    inactive: 0,
                    male: 0,
                    female: 0
                })
            }
        } catch (err: any) {
            console.error("Error loading patient cards:", err)
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred')
            setPatients([])
            setPagination({
                currentPage: 1,
                totalPages: 0,
                totalCount: 0,
                limit: pageSize,
                hasNext: false,
                hasPrev: false
            })
            setStats({
                total: 0,
                active: 0,
                inactive: 0,
                male: 0,
                female: 0
            })
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, searchQuery, genderFilter, statusFilter])

    // Load data on mount and when filters change
    useEffect(() => {
        loadPatientCards()
    }, [loadPatientCards])

    // Reset page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1)
        }
    }, [searchQuery, genderFilter, statusFilter])

    // Handle card click - show detail dialog
    const handleCardClick = async (patient: Patient) => {
        try {
            const response = await patientCardService.getCardById(patient.id)
            if (response.success) {
                setSelectedPatient(response.data)
                setDetailDialogOpen(true)
            } else {
                console.error('Error fetching patient detail:', response.message)
                alert('Gagal memuat detail pasien')
            }
        } catch (error) {
            console.error('Error fetching patient detail:', error)
            alert('Gagal memuat detail pasien')
        }
    }

    // Handle download card
    const handleDownloadCard = async (patient: Patient) => {
        try {
            setDownloadingCardId(patient.id)
            const blob = await patientCardService.downloadCard(patient.id)
            const filename = `kartu-pasien-${patient.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`
            patientCardService.downloadPdfFile(blob, filename)
        } catch (error) {
            console.error('Error downloading patient card:', error)
            alert('Gagal mengunduh kartu pasien. Silakan coba lagi.')
        } finally {
            setDownloadingCardId(null)
        }
    }

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage)
        }
    }

    // Handle print all cards
    const handlePrintAllCards = () => {
        window.print()
    }

    // Handle export cards
    const handleExportCards = () => {
        // Create CSV data
        const csvData = patients.map(patient => ({
            'Nama Lengkap': patient.fullName,
            'NIK': patient.nik || '',
            'Telepon': patient.phone || '',
            'Email': patient.email || '',
            'Gender': patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
            'Tanggal Lahir': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('id-ID') : '',
            'Status': patient.isActive ? 'Aktif' : 'Nonaktif',
            'Bergabung': new Date(patient.createdAt).toLocaleDateString('id-ID')
        }))

        console.log('Export data:', csvData)
        // Here you can implement actual CSV export functionality
        alert('Export functionality will be implemented based on your requirements')
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kartu Pasien</h1>
                        <p className="text-gray-600 dark:text-gray-400">Kelola dan cetak kartu identitas pasien</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                    <CardContent className="p-4">
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setError(null)}
                            >
                                Dismiss
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadPatientCards}
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Kartu</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                    {stats.total.toLocaleString()}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Semua pasien</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <CreditCard className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Aktif</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                                    {stats.active.toLocaleString()}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Kartu aktif</p>
                            </div>
                            <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-lg">✅</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nonaktif</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {stats.inactive.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Kartu nonaktif</p>
                            </div>
                            <div className="h-12 w-12 bg-gray-500 dark:bg-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-lg">❌</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Laki-laki</p>
                                <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                                    {stats.male.toLocaleString()}
                                </p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Pasien pria</p>
                            </div>
                            <div className="h-12 w-12 bg-indigo-500 dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-lg">👨</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-1">Perempuan</p>
                                <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">
                                    {stats.female.toLocaleString()}
                                </p>
                                <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Pasien wanita</p>
                            </div>
                            <div className="h-12 w-12 bg-pink-500 dark:bg-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-lg">👩</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="shadow-lg border-0 dark:border-gray-800">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <CreditCard className="h-6 w-6" />
                                    Kartu Pasien
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                    Daftar kartu identitas pasien. Menampilkan {patients.length.toLocaleString()} dari {stats.total.toLocaleString()} kartu
                                    {pagination.totalPages > 1 && ` (Halaman ${pagination.currentPage} dari ${pagination.totalPages})`}
                                </CardDescription>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleExportCards}
                                    className="shadow-lg"
                                    disabled={loading || patients.length === 0}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handlePrintAllCards}
                                    className="shadow-lg"
                                    disabled={loading || patients.length === 0}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Input
                                    placeholder="Cari nama, NIK, atau telepon..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 pl-9"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            </div>

                            <Select value={genderFilter} onValueChange={(value: "ALL" | "MALE" | "FEMALE") => {
                                setGenderFilter(value)
                            }}>
                                <SelectTrigger className="w-full sm:w-[140px] h-10">
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Gender</SelectItem>
                                    <SelectItem value="MALE">Laki-laki</SelectItem>
                                    <SelectItem value="FEMALE">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={(value: "ALL" | "ACTIVE" | "INACTIVE") => {
                                setStatusFilter(value)
                            }}>
                                <SelectTrigger className="w-full sm:w-[130px] h-10">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Status</SelectItem>
                                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                                    <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Memuat kartu pasien...</p>
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 dark:text-gray-400">
                                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium text-lg">
                                    {searchQuery || genderFilter !== "ALL" || statusFilter !== "ALL" ?
                                        "Tidak ada kartu pasien ditemukan" :
                                        "Belum ada kartu pasien"
                                    }
                                </p>
                                <p className="text-sm mt-2">
                                    {searchQuery || genderFilter !== "ALL" || statusFilter !== "ALL" ?
                                        "Coba ubah kriteria pencarian atau filter" :
                                        "Kartu pasien akan muncul di sini setelah ada pasien yang terdaftar"
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {patients.map((patient) => (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    onClick={() => handleCardClick(patient)}
                                    onDownload={() => handleDownloadCard(patient)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {((pagination.currentPage - 1) * pagination.limit) + 1}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                            </span>{' '}
                            dari{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {pagination.totalCount.toLocaleString()}
                            </span>{' '}
                            kartu pasien
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrev}
                            >
                                Sebelumnya
                            </Button>

                            <div className="flex items-center gap-2">
                                {/* Simple pagination numbers */}
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <Button
                                            key={page}
                                            variant={page === pagination.currentPage ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}

                                {pagination.totalPages > 5 && (
                                    <span className="text-sm text-gray-500">...</span>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNext}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Results Info */}
            {!loading && patients.length > 0 && (
                <Card className="p-4">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Menampilkan <span className="font-medium text-gray-900 dark:text-gray-100">
                            {patients.length.toLocaleString()}
                        </span> kartu pasien pada halaman ini
                        {(searchQuery || genderFilter !== "ALL" || statusFilter !== "ALL") && (
                            <span> dari <span className="font-medium text-gray-900 dark:text-gray-100">
                                {pagination.totalCount.toLocaleString()}
                            </span> hasil pencarian</span>
                        )}
                    </div>
                </Card>
            )}

            {/* Detail Dialog */}
            <PatientCardDetailDialog
                patient={selectedPatient}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
            />
        </div>
    )
}

export default PatientCardPage