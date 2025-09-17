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
import { Progress } from "@/components/ui/progress"
import { Eye, Plus, Edit, Trash2, Package, AlertTriangle, Download, Upload } from "lucide-react"
import { 
  medicationService,
  type MedicationWithStatus,
  type MedicationStatistics,
  type MedicationListResponse
} from "@/services/admin/medication"
import {
  MEDICATION_CATEGORIES,
  type MedicationSummary
} from "@/types/admin/medication"

// Import Dialog Components
import { CreateMedicationDialog } from "@/components/admin/medication/CreateMedicationDialog"
import { EditMedicationDialog } from "@/components/admin/medication/EditMedicationDialog"
import { DetailMedicationDialog } from "@/components/admin/medication/DetailMedicationDialog"

function MedicationPage() {
  const [medications, setMedications] = useState<MedicationWithStatus[]>([])
  const [selectedMedication, setSelectedMedication] = useState<MedicationWithStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MedicationSummary>({ 
    total: 0, 
    active: 0,
    lowStock: 0,
    prescriptionOnly: 0,
    controlled: 0
  })

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [medicationToEdit, setMedicationToEdit] = useState<MedicationWithStatus | null>(null)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [prescriptionFilter, setPrescriptionFilter] = useState<"ALL" | "YES" | "NO">("ALL")
  const [controlledFilter, setControlledFilter] = useState<"ALL" | "YES" | "NO">("ALL")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false
  })

  // Load medications function
  const loadMedications = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await medicationService.getMedications(
        currentPage,
        pageSize,
        searchQuery,
        categoryFilter === "ALL" ? "" : categoryFilter,
        statusFilter,
        prescriptionFilter,
        controlledFilter
      )
      
      if (response.success) {
        setMedications(response.data.medications)
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.itemsPerPage,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev
        })
        setStats(response.data.summary)
      } else {
        setError('Failed to load medications')
        setMedications([])
      }
    } catch (err: any) {
      console.error("Error loading medications:", err)
      setError('An unexpected error occurred while loading medications')
      setMedications([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, statusFilter, prescriptionFilter, controlledFilter])

  // Load medications when dependencies change
  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      loadMedications()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, categoryFilter, statusFilter, prescriptionFilter, controlledFilter])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size))
    setCurrentPage(1)
  }

  // Handle view medication details
  const handleViewMedication = async (medication: MedicationWithStatus) => {
    try {
      const response = await medicationService.getMedicationById(medication.id)
      
      if (response.success) {
        setSelectedMedication(response.data)
        setShowDetailDialog(true)
      } else {
        setError('Failed to load medication details')
      }
    } catch (err) {
      console.error("Error loading medication details:", err)
      setError('Failed to load medication details')
    }
  }

  // Handle edit medication
  const handleEditMedication = (medication: MedicationWithStatus) => {
    setMedicationToEdit(medication)
    setShowEditDialog(true)
    setShowDetailDialog(false) // Close detail dialog if open
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get stock status badge
  const getStockStatusBadge = (medication: MedicationWithStatus) => {
    const { stockStatus, stock } = medication
    
    switch (stockStatus) {
      case 'LOW':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Stok Rendah ({stock})
          </Badge>
        )
      case 'HIGH':
        return (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            Stok Tinggi ({stock})
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Normal ({stock})
          </Badge>
        )
    }
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
                onClick={loadMedications}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Obat</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {(stats?.total || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Aktif</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {(stats?.active || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Stok Rendah</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {(stats?.lowStock || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-500 dark:bg-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Resep</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {(stats?.prescriptionOnly || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Terkontrol</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {(stats?.controlled || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-500 dark:bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">🔐</span>
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
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Obat</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Kelola dan lihat informasi obat. Total: {pagination.totalItems.toLocaleString()} obat
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Obat
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  placeholder="Cari nama obat, kode, atau merek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[140px] h-10">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  {MEDICATION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(value: "ALL" | "ACTIVE" | "INACTIVE") => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[120px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={prescriptionFilter} onValueChange={(value: "ALL" | "YES" | "NO") => setPrescriptionFilter(value)}>
                <SelectTrigger className="w-full sm:w-[120px] h-10">
                  <SelectValue placeholder="Resep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value="YES">Perlu Resep</SelectItem>
                  <SelectItem value="NO">Bebas</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Memuat data obat...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Obat</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kategori</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Dosis</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Harga</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Stok</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((medication) => (
                    <TableRow key={medication.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {/* Medication Info Column */}
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            💊
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{medication.genericName}</div>
                            {medication.brandName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{medication.brandName}</div>
                            )}
                            <div className="text-xs text-gray-400 font-mono">{medication.medicationCode}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category Column */}
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {medication.category}
                        </Badge>
                      </TableCell>

                      {/* Dosage Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="text-sm">
                          <div className="font-medium">{medication.strength} {medication.unit}</div>
                          <div className="text-xs text-gray-500">{medication.dosageForm}</div>
                        </div>
                      </TableCell>

                      {/* Price Column */}
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        <div className="font-medium text-sm">
                          {formatCurrency(medication.pricePerUnit)}
                        </div>
                      </TableCell>

                      {/* Stock Column */}
                      <TableCell>
                        <div className="space-y-2">
                          {getStockStatusBadge(medication)}
                          <Progress 
                            value={medication.stockPercentage} 
                            className="h-1 w-16"
                          />
                        </div>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={medication.isActive ? "default" : "secondary"}
                            className={`text-xs ${medication.isActive 
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {medication.isActive ? "✅ Aktif" : "❌ Nonaktif"}
                          </Badge>
                          <div className="flex gap-1">
                            {medication.requiresPrescription && (
                              <Badge variant="outline" className="text-xs">📋</Badge>
                            )}
                            {medication.isControlled && (
                              <Badge variant="outline" className="text-xs">🔐</Badge>
                            )}
                          </div>
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
                                  onClick={() => handleViewMedication(medication)}
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
                                  onClick={() => handleEditMedication(medication)}
                                  className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit obat</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {medications.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-2">💊</div>
                          <p className="font-medium">
                            {searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL" ? 
                              "Tidak ada obat ditemukan" : 
                              "Belum ada data obat"
                            }
                          </p>
                          <p className="text-sm mt-1">
                            {searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL" ? 
                              "Coba ubah kriteria pencarian" : 
                              "Data obat akan muncul di sini setelah ditambahkan"
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

      {/* Medication Detail Dialog */}
      <DetailMedicationDialog 
        open={showDetailDialog} 
        onOpenChange={() => setShowDetailDialog(false)} 
        medication={selectedMedication}
        onEdit={handleEditMedication}
      />

      {/* Create Medication Dialog */}
      <CreateMedicationDialog 
        open={showCreateDialog} 
        onOpenChange={() => setShowCreateDialog(false)} 
        onSuccess={loadMedications}
      />

      {/* Edit Medication Dialog */}
      <EditMedicationDialog 
        open={showEditDialog} 
        onOpenChange={() => setShowEditDialog(false)} 
        medication={medicationToEdit}
        onSuccess={loadMedications}
      />

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
                {Math.min(currentPage * pageSize, pagination.totalItems)}
              </span>{' '}
              dari{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {pagination.totalItems.toLocaleString()}
              </span>{' '}
              obat
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
    </div>
  )
}

export default MedicationPage