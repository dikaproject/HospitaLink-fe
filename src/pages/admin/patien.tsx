import { useMemo, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye } from "lucide-react"
import { 
  patientService, 
  type Patient, 
  type PatientStats,
  type PatientSearchQuery 
} from "@/services/admin/patient"

function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PatientStats>({ 
    total: 0, 
    male: 0, 
    female: 0, 
    recentAdded: 0,
    active: 0,
    inactive: 0,
    withAppointments: 0,
    withMedicalRecords: 0
  })
  
  // Search and filter states - FIXED: No empty string values
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  })

  // Load patients function with proper type checking
  const loadPatients = useCallback(async (params?: PatientSearchQuery) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchParams: PatientSearchQuery = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        gender: genderFilter === "ALL" ? undefined : genderFilter,
        isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...params
      }
      
      const response = await patientService.getAll(searchParams)
      
      if (response.success) {
        if (response.data) {
          setPatients(response.data.patients)
          setPagination(response.data.pagination)
        } else {
          console.error('❌ Success response but no data')
          setError('No data received from server')
          setPatients([])
        }
      } else {
        setError(response.error || 'Failed to load patients')
        setPatients([])
        if (response.data) {
          setPagination(response.data.pagination)
        } else {
          setPagination({
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: pageSize
          })
        }
      }
    } catch (err) {
      console.error("Error loading patients:", err)
      setError('An unexpected error occurred while loading patients')
      setPatients([])
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: pageSize
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, genderFilter, statusFilter])

  // Load stats function
  const loadStats = useCallback(async () => {
    try {
      console.log('📊 Starting to load patient statistics...')
      const statsResponse = await patientService.getStats()
      
      if (statsResponse.success && statsResponse.data) {
        console.log('✅ Setting stats data:', statsResponse.data)
        setStats(statsResponse.data)
      } else {
        console.error('❌ Stats loading failed:', statsResponse.error)
        setStats({
          total: 0,
          male: 0,
          female: 0,
          recentAdded: 0,
          active: 0,
          inactive: 0,
          withAppointments: 0,
          withMedicalRecords: 0
        })
      }
    } catch (err) {
      console.error("❌ Error loading stats:", err)
      setStats({
        total: 0,
        male: 0,
        female: 0,
        recentAdded: 0,
        active: 0,
        inactive: 0,
        withAppointments: 0,
        withMedicalRecords: 0
      })
    }
  }, [])

  // Load patients when dependencies change
  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  // Load stats only once on mount
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      loadPatients()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, genderFilter, statusFilter])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size))
    setCurrentPage(1)
  }

  // Handle view patient details
  const handleViewPatient = async (patient: Patient) => {
    try {
      const response = await patientService.getById(patient.id)
      
      if (response.success && response.data?.patient) {
        setSelectedPatient(response.data.patient)
      } else {
        setError(response.error || 'Failed to load patient details')
      }
    } catch (err) {
      console.error("Error loading patient details:", err)
      setError('Failed to load patient details')
    }
  }

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  // Update formatAddress untuk menampilkan alamat yang lebih ringkas
  const formatAddress = (patient: Patient) => {
    const addressParts = [
      patient.village,
      patient.district,
      patient.regency
    ].filter(Boolean)
    
    return addressParts.length > 0 ? addressParts.join(', ') : '-'
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string | null) => {
    if (!dateOfBirth) return '-'
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return `${age} th`
    } catch {
      return '-'
    }
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = []
    const totalPages = pagination.totalPages
    const current = currentPage
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      // Complex pagination logic
      if (current <= 4) {
        items.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (current >= totalPages - 3) {
        items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        items.push(1, '...', current - 1, current, current + 1, '...', totalPages)
      }
    }
    
    return items
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
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
                onClick={() => {
                  loadPatients()
                  loadStats()
                }}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Pasien</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {(stats?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Semua pasien terdaftar</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">👥</span>
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
                  {(stats?.male || 0).toLocaleString()}
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
                  {(stats?.female || 0).toLocaleString()}
                </p>
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Pasien wanita</p>
              </div>
              <div className="h-12 w-12 bg-pink-500 dark:bg-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">👩</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Baru (7 hari)</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {(stats?.recentAdded || 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Pasien baru</p>
              </div>
              <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🆕</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="shadow-lg border-0 dark:border-gray-800">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Pasien</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Kelola dan lihat informasi pasien. Total: {pagination.totalRecords.toLocaleString()} pasien
                </CardDescription>
              </div>
            </div>
            
            {/* Filters - FIXED: No empty string values */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  placeholder="Cari nama, NIK, email, atau telepon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
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
                  <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-full sm:w-[100px] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / hal</SelectItem>
                  <SelectItem value="25">25 / hal</SelectItem>
                  <SelectItem value="50">50 / hal</SelectItem>
                  <SelectItem value="100">100 / hal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Memuat data pasien...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Pasien</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">NIK</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kontak</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Usia</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Gender</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Alamat</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {/* Patient Info Column */}
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {patient.fullName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{patient.fullName || 'Nama tidak tersedia'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{patient.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* NIK Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {patient.nik || '-'}
                        </code>
                      </TableCell>

                      {/* Contact Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-sm">
                          {patient.phone ? (
                            <div className="font-medium">{patient.phone}</div>
                          ) : (
                            <span className="text-gray-400 text-xs">Tidak ada telepon</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Age Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-sm font-medium">
                          {calculateAge(patient.dateOfBirth)}
                        </div>
                        {patient.dateOfBirth && (
                          <div className="text-xs text-gray-500">
                            {formatDate(patient.dateOfBirth)}
                          </div>
                        )}
                      </TableCell>

                      {/* Gender Column */}
                      <TableCell>
                        {patient.gender ? (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              patient.gender === "MALE" 
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" 
                                : "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200"
                            }`}
                          >
                            {patient.gender === "MALE" ? "👨 Pria" : "👩 Wanita"}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>

                      {/* Address Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-xs max-w-[180px]">
                          <div className="truncate" title={formatAddress(patient)}>
                            {formatAddress(patient)}
                          </div>
                          {patient.province && (
                            <div className="text-gray-500 mt-1">{patient.province}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <Badge 
                          variant={patient.isActive ? "default" : "secondary"}
                          className={`text-xs ${patient.isActive 
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {patient.isActive ? "✅ Aktif" : "❌ Nonaktif"}
                        </Badge>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewPatient(patient)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat detail</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {patients.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-2">👥</div>
                          <p className="font-medium">
                            {searchQuery || genderFilter !== "ALL" || statusFilter !== "ALL" ? 
                              "Tidak ada pasien ditemukan" : 
                              "Belum ada data pasien"
                            }
                          </p>
                          <p className="text-sm mt-1">
                            {searchQuery || genderFilter !== "ALL" || statusFilter !== "ALL" ? 
                              "Coba ubah kriteria pencarian" : 
                              "Data pasien akan muncul di sini setelah didaftarkan"
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Modal - Simplified */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedPatient.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedPatient.fullName}</CardTitle>
                    <CardDescription>{selectedPatient.email}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedPatient(null)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Informasi Pribadi</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">NIK</label>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {selectedPatient.nik || 'Tidak tersedia'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tanggal Lahir</label>
                      <p className="text-sm">{formatDate(selectedPatient.dateOfBirth)} ({calculateAge(selectedPatient.dateOfBirth)})</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Jenis Kelamin</label>
                      <p className="text-sm">
                        {selectedPatient.gender === "MALE" ? "👨 Laki-laki" : 
                         selectedPatient.gender === "FEMALE" ? "👩 Perempuan" : 
                         "Tidak tersedia"}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Telepon</label>
                      <p className="text-sm">{selectedPatient.phone || 'Tidak tersedia'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Alamat</h3>
                  
                  <div className="space-y-2 text-sm">
                    {selectedPatient.street && (
                      <p><span className="font-medium">Jalan:</span> {selectedPatient.street}</p>
                    )}
                    {selectedPatient.village && (
                      <p><span className="font-medium">Kelurahan:</span> {selectedPatient.village}</p>
                    )}
                    {selectedPatient.district && (
                      <p><span className="font-medium">Kecamatan:</span> {selectedPatient.district}</p>
                    )}
                    {selectedPatient.regency && (
                      <p><span className="font-medium">Kabupaten/Kota:</span> {selectedPatient.regency}</p>
                    )}
                    {selectedPatient.province && (
                      <p><span className="font-medium">Provinsi:</span> {selectedPatient.province}</p>
                    )}
                    
                    {!selectedPatient.street && !selectedPatient.village && (
                      <p className="text-gray-500 italic">Alamat belum dilengkapi</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Status Akun</h3>
                <div className="flex gap-4">
                  <Badge 
                    variant={selectedPatient.isActive ? "default" : "secondary"}
                    className={selectedPatient.isActive 
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }
                  >
                    {selectedPatient.isActive ? "✅ Aktif" : "❌ Tidak Aktif"}
                  </Badge>
                  
                  <Badge 
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                  >
                    📋 {selectedPatient.role || 'USER'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pagination with Shadcn Component */}
      {pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {((currentPage - 1) * pageSize) + 1}
              </span>{' '}
              sampai{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Math.min(currentPage * pageSize, pagination.totalRecords)}
              </span>{' '}
              dari{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {pagination.totalRecords.toLocaleString()}
              </span>{' '}
              pasien
            </div>
            
            <Pagination className="justify-center sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.hasPrevPage) {
                        handlePageChange(currentPage - 1)
                      }
                    }}
                    className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {generatePaginationItems().map((item, index) => (
                  <PaginationItem key={index}>
                    {item === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(item as number)
                        }}
                        isActive={currentPage === item}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.hasNextPage) {
                        handlePageChange(currentPage + 1)
                      }
                    }}
                    className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      )}
    </div>
  )
}

export default PatientPage