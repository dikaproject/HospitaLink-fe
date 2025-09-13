import { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

import { CreatePrescriptionDialog } from '@/components/doctor/prescription/CreatePrescriptionDialog';
import { prescriptionService } from '@/services/doctor/prescription';
import type { CreatePrescriptionRequest } from '@/types/doctor/prescription';

// Mock patients data - replace with actual patient service
const mockPatients = [
  { id: '1', fullName: 'John Doe', nik: '1234567890123456', phone: '081234567890' },
  { id: '2', fullName: 'Jane Smith', nik: '1234567890123457', phone: '081234567891' },
  { id: '3', fullName: 'Ahmad Budi', nik: '1234567890123458', phone: '081234567892' },
  { id: '4', fullName: 'Siti Nurhaliza', nik: '1234567890123459', phone: '081234567893' },
];

export default function CreatePrescriptionPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreatePrescription = async (data: CreatePrescriptionRequest) => {
    try {
      setLoading(true);
      await prescriptionService.createPrescription(data);
      toast.success('Resep berhasil dibuat!');
      navigate('/doctor/prescription');
    } catch (error) {
      console.error('Create prescription error:', error);
      toast.error('Gagal membuat resep');
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
        patients={mockPatients}
      />
    </div>
  );
}