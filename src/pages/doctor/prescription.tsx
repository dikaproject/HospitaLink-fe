import { useState, useEffect } from 'react';
import { 
  Pill, 
  FileText, 
  Clock,
  RefreshCw,
  Plus,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { PrescriptionCard } from '@/components/doctor/prescription/PrescriptionCard';
import { PrescriptionDetailDialog } from '@/components/doctor/prescription/PrescriptionDetailDialog';
import { prescriptionService } from '@/services/doctor/prescription';
import type { Prescription, TodayPrescriptionsResponse } from '@/types/doctor/prescription';

export default function DoctorPrescription() {
  const [todayData, setTodayData] = useState<TodayPrescriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const loadTodayPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getTodayPrescriptions();
      setTodayData(data);
    } catch (error) {
      console.error('Load today prescriptions error:', error);
      toast.error('Gagal memuat data resep hari ini');
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

  useEffect(() => {
    loadTodayPrescriptions();
    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      loadTodayPrescriptions();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resep Digital</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Kelola resep digital untuk pasien
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={loadTodayPrescriptions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Link to="/doctor/prescription/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Resep
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resep Hari Ini</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayData?.summary.total || 0}</div>
            <p className="text-xs text-muted-foreground">Resep dibuat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Bayar</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayData?.summary.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Belum dibayar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Lunas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayData?.summary.paid || 0}</div>
            <p className="text-xs text-muted-foreground">Sudah dibayar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Diambil</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayData?.summary.dispensed || 0}</div>
            <p className="text-xs text-muted-foreground">Obat diambil</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Resep Hari Ini ({todayData?.prescriptions.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {todayData?.prescriptions && todayData.prescriptions.length > 0 ? (
              todayData.prescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onClick={handlePrescriptionClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Belum ada resep hari ini
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Resep yang dibuat hari ini akan muncul di sini.
                </p>
                <Link to="/doctor/prescription/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Resep Pertama
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <PrescriptionDetailDialog
        prescription={selectedPrescription}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  );
}