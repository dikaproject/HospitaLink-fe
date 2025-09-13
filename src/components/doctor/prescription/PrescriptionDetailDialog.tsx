import { 
  Pill, 
  Clock, 
  User, 
  Calendar, 
  CreditCard, 
  FileText, 
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Prescription } from '@/types/doctor/prescription';

interface PrescriptionDetailDialogProps {
  prescription: Prescription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrescriptionDetailDialog({ 
  prescription, 
  open, 
  onOpenChange 
}: PrescriptionDetailDialogProps) {
  if (!prescription) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div>Detail Resep</div>
              <div className="text-lg font-normal text-blue-600 dark:text-blue-400">
                {prescription.prescriptionCode}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {prescription.user.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">NIK</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {prescription.user.nik}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No. Telepon</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {prescription.user.phone}
                  </p>
                </div>
                {prescription.user.gender && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Jenis Kelamin</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {prescription.user.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prescription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi Resep
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kode Resep</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-gray-100">
                    {prescription.prescriptionCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Dibuat</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDateTime(prescription.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status Pembayaran</p>
                  <Badge className={getStatusColor(prescription.paymentStatus)}>
                    {prescription.paymentStatus === 'PAID' ? 'Lunas' :
                     prescription.paymentStatus === 'PENDING' ? 'Menunggu Pembayaran' : 'Gagal'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status Pengambilan</p>
                  <Badge className={prescription.isDispensed ? 
                    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
                  }>
                    {prescription.isDispensed ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Sudah Diambil
                      </>
                    ) : (
                      'Belum Diambil'
                    )}
                  </Badge>
                </div>
              </div>

              {prescription.totalAmount && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Biaya</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(prescription.totalAmount)}
                  </p>
                </div>
              )}

              {prescription.expiresAt && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Berlaku hingga: {formatDateTime(prescription.expiresAt)}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Pastikan obat diambil sebelum tanggal kedaluwarsa
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications - Update this section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Daftar Obat ({prescription.medications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.medications.map((medication, index) => (
                  <div 
                    key={index} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {medication.genericName}
                          {medication.brandName && (
                            <span className="text-gray-600 dark:text-gray-400 ml-1">
                              ({medication.brandName})
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {medication.medicationCode} • {medication.dosageForm} {medication.strength}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                          {formatCurrency(medication.totalPrice)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Kuantitas</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {medication.quantity} {medication.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Frekuensi</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {medication.frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Durasi</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {medication.duration || 'Tidak ditentukan'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Harga/Unit</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(medication.pricePerUnit)}
                        </p>
                      </div>
                    </div>
                    
                    {medication.dosageInstructions && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        <p className="text-gray-500 dark:text-gray-400">Instruksi Dosis:</p>
                        <p className="text-gray-900 dark:text-gray-100">{medication.dosageInstructions}</p>
                      </div>
                    )}

                    {medication.notes && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <p className="text-gray-500 dark:text-gray-400">Catatan:</p>
                        <p className="text-gray-900 dark:text-gray-100">{medication.notes}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Total Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Total Biaya:
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(prescription.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {prescription.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Instruksi Umum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-gray-900 dark:text-gray-100">
                    {prescription.instructions}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultation Info */}
          {prescription.consultation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informasi Konsultasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipe Konsultasi</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {prescription.consultation.type}
                    </p>
                  </div>
                  {prescription.consultation.severity && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tingkat Keparahan</p>
                      <Badge variant="outline">
                        {prescription.consultation.severity}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {prescription.consultation.symptoms && prescription.consultation.symptoms.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Gejala</p>
                    <div className="flex flex-wrap gap-2">
                      {prescription.consultation.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="outline">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}