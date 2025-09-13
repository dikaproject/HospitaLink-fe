// Update: hospitalink-fe/src/pages/doctor/create-prescription.tsx
import { useState, useEffect } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

import { CreatePrescriptionDialog } from '@/components/doctor/prescription/CreatePrescriptionDialog';
import { prescriptionService } from '@/services/doctor/prescription';
import { patientService } from '@/services/doctor/patient'; // Fixed import path
import type { CreatePrescriptionRequest } from '@/types/doctor/prescription';

interface Patient {
  id: string;
  fullName: string;
  nik: string;
  phone: string;
}

export default function CreatePrescriptionPage() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const navigate = useNavigate();

  // Load patients on mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await patientService.getAll();
        if (response.success) {
          setPatients(response.data);
        } else {
          // If API doesn't exist yet, use mock data
          setPatients([
            {
              id: '1',
              fullName: 'Ahmad Wijaya',
              nik: '1234567890123456',
              phone: '081234567890'
            },
            {
              id: '2', 
              fullName: 'Siti Nurhaliza',
              nik: '2345678901234567',
              phone: '081234567891'
            },
            {
              id: '3',
              fullName: 'Budi Santoso', 
              nik: '3456789012345678',
              phone: '081234567892'
            }
          ]);
        }
      } catch (error) {
        console.error('Load patients error:', error);
        
        // Use mock data as fallback
        setPatients([
          {
            id: '1',
            fullName: 'Ahmad Wijaya',
            nik: '1234567890123456',
            phone: '081234567890'
          },
          {
            id: '2',
            fullName: 'Siti Nurhaliza',
            nik: '2345678901234567',
            phone: '081234567891'
          },
          {
            id: '3',
            fullName: 'Budi Santoso',
            nik: '3456789012345678', 
            phone: '081234567892'
          }
        ]);
        
        toast.error('Menggunakan data pasien contoh');
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
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

  if (loadingPatients) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Memuat data pasien...</p>
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
              to="/doctor/prescription" 
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Resep
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Buat Resep Digital</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Buat resep digital baru untuk pasien
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
        patients={patients}
      />
    </div>
  );
}