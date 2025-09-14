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
import { Eye, Plus, Edit, Trash2 } from "lucide-react"
import { doctorService } from "@/services/admin/doctor"
import type { DoctorListItem, DoctorPagination } from "@/types/admin/doctor"
import CreateDoctorDialog from "@/components/admin/doctor/CreateDoctorDialog"
import EditDoctorDialog from "@/components/admin/doctor/EditDoctorDialog"
import DetailDoctorDialog from "@/components/admin/doctor/DetailDoctorDialog"
import DeleteDoctorDialog from "@/components/admin/doctor/DeleteDoctorDialog"

function DoctorPage() {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [availabilityFilter, setAvailabilityFilter] = useState<"ALL" | "AVAILABLE" | "UNAVAILABLE">("ALL")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState<DoctorPagination>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; fullName: string } | null>(null)

  // Load doctors function
  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await doctorService.getDoctors(currentPage, pageSize, searchQuery)
      
      if (response.success) {
        setDoctors(response.data.doctors)
        setPagination(response.data.pagination)
      } else {
        setError(response.message || 'Failed to load doctors')
        setDoctors([])
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false
        })
      }
    } catch (err: any) {
      console.error("Error loading doctors:", err)
      setError(err.response?.data?.message || 'An unexpected error occurred while loading doctors')
      setDoctors([])
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchQuery])

  // Load doctors when dependencies change
  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      loadDoctors()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Filter doctors based on filters
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      if (statusFilter === "ACTIVE" && !doctor.isActive) return false
      if (statusFilter === "INACTIVE" && doctor.isActive) return false
      if (availabilityFilter === "AVAILABLE" && !doctor.doctorProfile?.isAvailable) return false
      if (availabilityFilter === "UNAVAILABLE" && doctor.doctorProfile?.isAvailable) return false
      return true
    })
  }, [doctors, statusFilter, availabilityFilter])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size))
    setCurrentPage(1)
  }

  // Handle view doctor details
  const handleViewDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId)
    setDetailDialogOpen(true)
  }

  // Handle edit doctor
  const handleEditDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId)
    setEditDialogOpen(true)
  }

  // Handle delete doctor
  const handleDeleteDoctor = (doctor: DoctorListItem) => {
    setSelectedDoctor({ id: doctor.id, fullName: doctor.fullName })
    setDeleteDialogOpen(true)
  }

  // Handle success callbacks
  const handleCreateSuccess = () => {
    loadDoctors()
  }

  const handleEditSuccess = () => {
    loadDoctors()
  }

  const handleDeleteSuccess = () => {
    loadDoctors()
  }

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = []
    const totalPages = pagination.totalPages
    const current = currentPage
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalDoctors = doctors.length
    const activeDoctors = doctors.filter(d => d.isActive).length
    const availableDoctors = doctors.filter(d => d.doctorProfile?.isAvailable).length
    const onDutyDoctors = doctors.filter(d => d.doctorProfile?.isOnDuty).length

    return {
      total: totalDoctors,
      active: activeDoctors,
      available: availableDoctors,
      onDuty: onDutyDoctors
    }
  }, [doctors])

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
                onClick={loadDoctors}
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
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Dokter</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.total.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Semua dokter terdaftar</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">👨‍⚕️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Dokter Aktif</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.active.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Status aktif</p>
              </div>
              <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Tersedia</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.available.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Siap praktik</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🟢</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Bertugas</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.onDuty.toLocaleString()}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Sedang bertugas</p>
              </div>
              <div className="h-12 w-12 bg-amber-500 dark:bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">⏰</span>
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
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Dokter</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Kelola dan lihat informasi dokter. Total: {pagination.totalCount.toLocaleString()} dokter
                </CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} className="shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Dokter
              </Button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  placeholder="Cari nama, email, atau spesialisasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value: "ALL" | "ACTIVE" | "INACTIVE") => {
                setStatusFilter(value)
              }}>
                <SelectTrigger className="w-full sm:w-[140px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={availabilityFilter} onValueChange={(value: "ALL" | "AVAILABLE" | "UNAVAILABLE") => {
                setAvailabilityFilter(value)
              }}>
                <SelectTrigger className="w-full sm:w-[150px] h-10">
                  <SelectValue placeholder="Ketersediaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                  <SelectItem value="UNAVAILABLE">Tidak Tersedia</SelectItem>
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
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Memuat data dokter...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Dokter</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Spesialisasi</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Lisensi</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kontak</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Biaya</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {/* Doctor Info Column */}
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {doctor.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{doctor.fullName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{doctor.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Specialty Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-sm font-medium">
                          {doctor.doctorProfile?.specialty || '-'}
                        </div>
                      </TableCell>

                      {/* License Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {doctor.doctorProfile?.licenseNumber || '-'}
                        </code>
                      </TableCell>

                      {/* Contact Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-sm">
                          {doctor.phone ? (
                            <div className="font-medium">{doctor.phone}</div>
                          ) : (
                            <span className="text-gray-400 text-xs">Tidak ada telepon</span>
                          )}
                          {doctor.nik && (
                            <div className="text-xs text-gray-500">NIK: {doctor.nik}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Fee Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(doctor.doctorProfile?.consultationFee)}
                        </div>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={doctor.isActive ? "default" : "secondary"}
                            className={`text-xs ${doctor.isActive 
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {doctor.isActive ? "✅ Aktif" : "❌ Nonaktif"}
                          </Badge>
                          {doctor.doctorProfile?.isAvailable && (
                            <Badge variant="secondary" className="text-xs">
                              🟢 Tersedia
                            </Badge>
                          )}
                          {doctor.doctorProfile?.isOnDuty && (
                            <Badge variant="secondary" className="text-xs">
                              ⏰ Bertugas
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDoctor(doctor.id)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Lihat detail</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditDoctor(doctor.id)}
                                  className="h-8 w-8 p-0 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                >
                                  <Edit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit dokter</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteDoctor(doctor)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Hapus dokter</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredDoctors.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-2">👨‍⚕️</div>
                          <p className="font-medium">
                            {searchQuery || statusFilter !== "ALL" || availabilityFilter !== "ALL" ? 
                              "Tidak ada dokter ditemukan" : 
                              "Belum ada data dokter"
                            }
                          </p>
                          <p className="text-sm mt-1">
                            {searchQuery || statusFilter !== "ALL" || availabilityFilter !== "ALL" ? 
                              "Coba ubah kriteria pencarian" : 
                              "Tambah dokter baru untuk memulai"
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

      {/* Pagination */}
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
                {Math.min(currentPage * pageSize, pagination.totalCount)}
              </span>{' '}
              dari{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {pagination.totalCount.toLocaleString()}
              </span>{' '}
              dokter
            </div>
            
            <Pagination className="justify-center sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.hasPrev) {
                        handlePageChange(currentPage - 1)
                      }
                    }}
                    className={!pagination.hasPrev ? "pointer-events-none opacity-50" : ""}
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
                      if (pagination.hasNext) {
                        handlePageChange(currentPage + 1)
                      }
                    }}
                    className={!pagination.hasNext ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <CreateDoctorDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditDoctorDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        doctorId={selectedDoctorId}
      />

      <DetailDoctorDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        doctorId={selectedDoctorId}
      />

      {selectedDoctor && (
        <DeleteDoctorDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onSuccess={handleDeleteSuccess}
          doctor={selectedDoctor}
        />
      )}
    </div>
  )
}

export default DoctorPage