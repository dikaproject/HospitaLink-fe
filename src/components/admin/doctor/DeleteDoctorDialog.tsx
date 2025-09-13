import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { doctorService } from '@/services/admin/doctor';

interface DeleteDoctorDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor: {
    id: string;
    fullName: string;
  };
}

const DeleteDoctorDialog: React.FC<DeleteDoctorDialogProps> = ({
  open,
  onClose,
  onSuccess,
  doctor,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await doctorService.deleteDoctor(doctor.id);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Gagal menghapus dokter');
      }
    } catch (err: any) {
      console.error('Delete doctor error:', err);
      setError(err.response?.data?.message || 'Gagal menghapus dokter');
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Dokter</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus dokter <strong>{doctor.fullName}</strong>? 
            Tindakan ini akan menonaktifkan akun dokter dan tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDoctorDialog;