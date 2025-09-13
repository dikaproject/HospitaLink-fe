import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, Search, Plus, Eye, Edit, Trash2, Users, Stethoscope, DollarSign } from 'lucide-react';
import { doctorService } from '@/services/admin/doctor';
import type { DoctorListItem } from '@/types/admin/doctor';
import DetailDoctorDialog from '@/components/admin/doctor/DetailDoctorDialog';
import CreateDoctorDialog from '@/components/admin/doctor/CreateDoctorDialog';
import EditDoctorDialog from '@/components/admin/doctor/EditDoctorDialog';
import DeleteDoctorDialog from '@/components/admin/doctor/DeleteDoctorDialog';

const DoctorPage: React.FC = () => {
  // State management
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog states
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; fullName: string } | null>(null);

  const limit = 10;

  // Fetch doctors data
  const fetchDoctors = async (currentPage: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getDoctors(currentPage, limit, searchQuery);
      
      if (response.success) {
        setDoctors(response.data.doctors);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      } else {
        setError('Gagal memuat data dokter');
      }
    } catch (err: any) {
      console.error('Fetch doctors error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data dokter');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle search
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    fetchDoctors(1, search);
  };

  // Handle view detail
  const handleViewDetail = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setDetailDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (doctor: DoctorListItem) => {
    setSelectedDoctor({ id: doctor.id, fullName: doctor.fullName });
    setDeleteDialogOpen(true);
  };

  // Handle success operations
  const handleOperationSuccess = () => {
    fetchDoctors(page, search); // Refresh current page
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manajemen Dokter</h1>
        <p className="text-muted-foreground">Kelola data dokter dan profil medis</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total Dokter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {doctors.filter(d => d.doctorProfile?.isAvailable).length}
                </p>
                <p className="text-sm text-muted-foreground">Dokter Tersedia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-10 w-10 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">
                  {doctors.filter(d => d.doctorProfile?.isOnDuty).length}
                </p>
                <p className="text-sm text-muted-foreground">Sedang Bertugas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari dokter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button type="submit" variant="outline">
            Cari
          </Button>
        </form>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Dokter
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Spesialisasi</TableHead>
                <TableHead>No. Lisensi</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="text-center">Biaya Konsultasi</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Terdaftar</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {search ? 'Tidak ada dokter yang ditemukan' : 'Belum ada data dokter'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doctor.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          NIK: {doctor.nik || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doctor.doctorProfile?.specialty || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doctor.doctorProfile?.licenseNumber || '-'}
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.phone || '-'}</TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(doctor.doctorProfile?.consultationFee)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <Badge variant={doctor.isActive ? 'default' : 'destructive'}>
                          {doctor.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        {doctor.doctorProfile?.isAvailable && (
                          <Badge variant="secondary" className="block">
                            Tersedia
                          </Badge>
                        )}
                        {doctor.doctorProfile?.isOnDuty && (
                          <Badge variant="secondary" className="block">
                            Bertugas
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(doctor.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(doctor.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(doctor.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doctor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedDoctorId && (
        <DetailDoctorDialog
          open={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedDoctorId(null);
          }}
          doctorId={selectedDoctorId}
        />
      )}

      <CreateDoctorDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleOperationSuccess}
      />

      {selectedDoctorId && (
        <EditDoctorDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedDoctorId(null);
          }}
          onSuccess={handleOperationSuccess}
          doctorId={selectedDoctorId}
        />
      )}

      {selectedDoctor && (
        <DeleteDoctorDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedDoctor(null);
          }}
          onSuccess={handleOperationSuccess}
          doctor={selectedDoctor}
        />
      )}
    </div>
  );
};

export default DoctorPage;