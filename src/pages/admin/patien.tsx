import { useMemo, useState, useEffect } from "react"

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
import AddPatientDialog from "@/components/patient/AddPatientDialog"
import EditPatientDialog from "@/components/patient/EditPatientDialog"
import DetailPatientDialog from "@/components/patient/DetailPatientDialog"
import DeletePatientDialog from "@/components/patient/DeletePatientDialog"
import { patientService, type Patient, type PatientCreate, type PatientUpdate } from "@/services/patient"

function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState("")
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, male: 0, female: 0, recentAdded: 0 })

  // Load patients on component mount
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true)
      try {
        const response = patientService.getAll()
        if (response.success && response.data) {
          setPatients(response.data)
        }

        // Load stats
        const statsResponse = patientService.getStats()
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      } catch (error) {
        console.error("Error loading patients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return patients
    
    const searchResponse = patientService.search({ query: query.trim() })
    return searchResponse.success && searchResponse.data ? searchResponse.data : patients
  }, [patients, query])

  const handleAddPatient = (values: PatientCreate) => {
    try {
      const response = patientService.create(values)
      if (response.success && response.data) {
        setPatients(prev => [response.data!, ...prev])
        
        // Update stats
        const statsResponse = patientService.getStats()
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      }
    } catch (error) {
      console.error("Error adding patient:", error)
    }
  }

  const handleUpdatePatient = (values: PatientUpdate) => {
    if (!values.id) return
    
    try {
      const response = patientService.update(values.id, values)
      if (response.success && response.data) {
        setPatients(prev => prev.map(p => p.id === values.id ? response.data! : p))
      }
    } catch (error) {
      console.error("Error updating patient:", error)
    }
  }

  const handleDeletePatient = (id: string) => {
    try {
      const response = patientService.delete(id)
      if (response.success) {
        setPatients(prev => prev.filter(p => p.id !== id))
        if (detailPatient?.id === id) setDetailPatient(null)
        if (editPatient?.id === id) setEditPatient(null)
        setDeletePatient(null)
        
        // Update stats
        const statsResponse = patientService.getStats()
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      }
    } catch (error) {
      console.error("Error deleting patient:", error)
    }
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Pasien</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
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
                <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.male}</p>
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
                <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.female}</p>
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
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.recentAdded}</p>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manajemen Pasien</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Kelola data pasien: tambah, lihat, ubah, hapus. Total: {patients.length} pasien
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Input
                  placeholder="Cari nama/NIK/telepon/alamat..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-11 pl-10 pr-4 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  🔍
                </div>
              </div>
              <AddPatientDialog onAdd={handleAddPatient} />
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
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Nama</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">NIK</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Tgl Lahir</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Gender</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Telepon</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Alamat</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 w-[200px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">{p.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 py-4">{p.nik}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 py-4">{p.birthDate}</TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            p.gender === "L" 
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700" 
                              : "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700"
                          }`}
                        >
                          {p.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 py-4">{p.phone}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-gray-700 dark:text-gray-300 py-4">{p.address}</TableCell>
                      <TableCell className="py-4">
                        <TooltipProvider>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setDetailPatient(p)}
                                  className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  Detail
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Lihat detail pasien</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditPatient(p)}
                                  className="border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit data pasien</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setDeletePatient(p)}
                                  className="border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  Hapus
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Hapus pasien</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-2">📋</div>
                          <p className="font-medium">
                            {query ? "Tidak ada hasil pencarian" : "Tidak ada data pasien"}
                          </p>
                          <p className="text-sm mt-1">
                            {query ? "Coba ubah kata kunci pencarian" : "Mulai dengan menambahkan pasien baru"}
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

      <DetailPatientDialog
        patient={detailPatient}
        open={!!detailPatient}
        onOpenChange={(open: boolean) => !open && setDetailPatient(null)}
      />
      <EditPatientDialog
        patient={editPatient}
        open={!!editPatient}
        onOpenChange={(open: boolean) => !open && setEditPatient(null)}
        onSave={handleUpdatePatient}
      />
      <DeletePatientDialog
        patient={deletePatient}
        open={!!deletePatient}
        onOpenChange={(open: boolean) => !open && setDeletePatient(null)}
        onConfirm={handleDeletePatient}
      />
    </div>
  )
}

export default PatientPage


