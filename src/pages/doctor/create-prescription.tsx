import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

import { CreatePrescriptionDialog } from '@/components/doctor/prescription/CreatePrescriptionDialog';
import { prescriptionService } from '@/services/doctor/prescription';
import { patientService } from '@/services/doctor/patient';
import type { CreatePrescriptionRequest } from '@/types/doctor/prescription';

export default function CreatePrescriptionPage() {
  const [loading, setLoading] = useState(false);
  const [patientStats, setPatientStats] = useState<{
    total: number;
    loading: boolean;
  }>({
    total: 0,
    loading: true
  });
  const navigate = useNavigate();

  // Load patient statistics
  useEffect(() => {
    const loadPatientStats = async () => {
      try {
        const response = await patientService.getPatients();
        if (response.success) {
          setPatientStats({
            total: response.total || response.data.length,
            loading: false
          });
        }
      } catch (error) {
        console.error('Load patient stats error:', error);
        setPatientStats({
          total: 0,
          loading: false
        });
        toast.error('Gagal memuat statistik pasien');
      }
    };

    loadPatientStats();
  }, []);

  const handleCreatePrescription = async (data: CreatePrescriptionRequest) => {
    try {
      setLoading(true);
      const result = await prescriptionService.createPrescription(data);
      toast.success(`Resep berhasil dibuat! Kode: ${result.summary.prescriptionCode}`);
      navigate('/doctor/prescription');
    } catch (error: any) {
      console.error('Create prescription error:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || 'Gagal membuat resep';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              Kembali ke Resep
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Buat Resep Digital</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Buat resep digital baru dengan sistem pencarian pasien otomatis
          </p>
        </div>

        {/* Patient Stats */}
        <div className="text-right">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Total Pasien</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
              {patientStats.loading ? (
                <div className="animate-pulse bg-blue-200 dark:bg-blue-800 h-8 w-16 rounded"></div>
              ) : (
                patientStats.total
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Fitur Pencarian Pasien Otomatis
        </h3>
        <div className="text-blue-700 dark:text-blue-200 space-y-2">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Pencarian real-time dari database pasien yang sudah terdaftar
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Cari berdasarkan nama, NIK, telepon, atau email
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Hanya menampilkan pasien yang sudah pernah berkonsultasi
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Sistem pencarian obat dengan kategori dan stok real-time
          </p>
        </div>
      </div>

      {/* Always show dialog on this page */}
      <CreatePrescriptionDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            navigate('/doctor/prescription');
          }
        }}
        onSubmit={handleCreatePrescription}
      />
    </div>
  );
}