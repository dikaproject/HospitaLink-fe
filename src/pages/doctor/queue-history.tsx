import { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock,
  RefreshCw,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { QueueCard } from '@/components/doctor/queue/QueueCard';
import { queueService } from '@/services/doctor/queue';
import type { Queue } from '@/types/doctor/queue';

export default function QueueHistory() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const limit = 12; // Show 12 queues per page

  const loadQueueHistory = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...filters
      };
      
      const data = await queueService.getQueueHistory(params);
      setQueues(data.queues);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Load queue history error:', error);
      toast.error('Gagal memuat riwayat antrian');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    setCurrentPage(1);
    loadQueueHistory(1, filters);
    setShowFilters(false);
    toast.success('Filter diterapkan');
  };

  const handleFilterReset = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadQueueHistory(1);
    setShowFilters(false);
    toast.success('Filter direset');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const filters: any = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      loadQueueHistory(page, filters);
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    loadQueueHistory();
  }, []);

  if (loading && queues.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-32 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg" />
            ))}
          </div>
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
              to="/doctor/queue" 
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Antrian
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Riwayat Antrian</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Semua riwayat antrian yang pernah Anda tangani
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
            onClick={() => loadQueueHistory(currentPage)}
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
            <CardTitle className="text-lg">Filter Riwayat Antrian</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ringkasan Riwayat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{total}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Antrian</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {queues.filter(q => q.status === 'COMPLETED').length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Selesai Ditangani</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {currentPage}/{totalPages}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Halaman</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue History List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Riwayat Antrian - Halaman {currentPage} dari {totalPages}
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
            {queues.length > 0 ? (
              queues.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  showActions={false} // No actions in history
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Tidak ada riwayat antrian
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {startDate || endDate ? 
                    'Tidak ada antrian dalam rentang tanggal yang dipilih.' :
                    'Anda belum pernah menangani antrian sebelumnya.'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {(startDate || endDate) && (
                    <Button variant="outline" onClick={handleFilterReset}>
                      Reset Filter
                    </Button>
                  )}
                  <Link to="/doctor/queue">
                    <Button>
                      Lihat Antrian Hari Ini
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
                Menampilkan {queues.length} dari {total} antrian
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
    </div>
  );
}