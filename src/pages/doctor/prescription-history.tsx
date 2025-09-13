import { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock,
  RefreshCw,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { PrescriptionCard } from '@/components/doctor/prescription/PrescriptionCard';
import { PrescriptionDetailDialog } from '@/components/doctor/prescription/PrescriptionDetailDialog';
import { prescriptionService } from '@/services/doctor/prescription';
import type { Prescription, PrescriptionSummary } from '@/types/doctor/prescription';

export default function PrescriptionHistory() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [summary, setSummary] = useState<PrescriptionSummary>({ total: 0, paid: 0, dispensed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const limit = 12; // Show 12 prescriptions per page

  const loadPrescriptionHistory = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...filters
      };
      
      const data = await prescriptionService.getPrescriptionHistory(params);
      setPrescriptions(data.prescriptions);
      setSummary(data.summary);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Load prescription history error:', error);
      toast.error('Gagal memuat riwayat resep');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionClick = async (prescription: Prescription) => {
    try {
      const detail = await prescriptionService.getPrescriptionDetail(prescription.id);
      setSelectedPrescription(detail);
      setShowDetailDialog(true);
    } catch (error) {
      console.error('Get prescription detail error:', error);
      toast.error('Gagal memuat detail resep');
    }
  };

  const handleFilterApply = () => {
    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    setCurrentPage(1);
    loadPrescriptionHistory(1, filters);
    setShowFilters(false);
    toast.success('Filter diterapkan');
  };

  const handleFilterReset = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadPrescriptionHistory(1);
    setShowFilters(false);
    toast.success('Filter direset');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const filters: any = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      loadPrescriptionHistory(page, filters);
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    loadPrescriptionHistory();
  }, []);

  if (loading && prescriptions.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg" />
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to="/doctor/prescription" 
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Riwayat Resep</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Semua resep yang pernah dibuat sebelumnya
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => loadPrescriptionHistory(currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Riwayat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={handleFilterApply} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Terapkan
                </Button>
                <Button variant="outline" onClick={handleFilterReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riwayat</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Semua resep</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
            <p className="text-xs text-muted-foreground">Dari {prescriptions.length} yang ditampilkan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Lunas</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.paid}</div>
            <p className="text-xs text-muted-foreground">Sudah dibayar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Diambil</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.dispensed}</div>
            <p className="text-xs text-muted-foreground">Obat diambil</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Riwayat Resep - Halaman {currentPage} dari {totalPages}
            {(startDate || endDate) && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                {startDate && `dari ${new Date(startDate).toLocaleDateString('id-ID')}`}
                {startDate && endDate && ' '}
                {endDate && `sampai ${new Date(endDate).toLocaleDateString('id-ID')}`}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onClick={handlePrescriptionClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Tidak ada riwayat resep
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {startDate || endDate ? 
                    'Tidak ada resep dalam rentang tanggal yang dipilih.' :
                    'Anda belum pernah membuat resep sebelumnya.'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {(startDate || endDate) && (
                    <Button variant="outline" onClick={handleFilterReset}>
                      Reset Filter
                    </Button>
                  )}
                  <Link to="/doctor/prescription">
                    <Button>
                      Lihat Resep Hari Ini
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan {prescriptions.length} dari {total} resep
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <Button
                        variant={totalPages === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog - Add this section */}
      <PrescriptionDetailDialog
        prescription={selectedPrescription}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  );
}