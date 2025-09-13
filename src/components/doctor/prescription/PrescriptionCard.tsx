import { Pill, Clock, CreditCard, CheckCircle, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Prescription } from '@/types/doctor/prescription';

interface PrescriptionCardProps {
  prescription: Prescription;
  onClick?: (prescription: Prescription) => void;
}

export function PrescriptionCard({ prescription, onClick }: PrescriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
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
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border dark:border-gray-700"
      onClick={() => onClick?.(prescription)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {prescription.prescriptionCode}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {prescription.user.fullName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(prescription.paymentStatus)}>
              {prescription.paymentStatus === 'PAID' ? 'Lunas' :
               prescription.paymentStatus === 'PENDING' ? 'Pending' : 'Gagal'}
            </Badge>
            
            {prescription.isDispensed && (
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Sudah Diambil
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{prescription.user.nik}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatTime(prescription.createdAt)}</span>
          </div>

          {prescription.totalAmount && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>{formatCurrency(prescription.totalAmount)}</span>
            </div>
          )}
          
          {prescription.expiresAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Berlaku hingga: {formatTime(prescription.expiresAt)}
              </span>
            </div>
          )}
        </div>

        {prescription.medications && prescription.medications.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Obat:</p>
            <div className="flex flex-wrap gap-1">
              {prescription.medications.slice(0, 3).map((med, index) => (
                <Badge key={index} variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                  {med.name}
                </Badge>
              ))}
              {prescription.medications.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                  +{prescription.medications.length - 3} lainnya
                </Badge>
              )}
            </div>
          </div>
        )}

        {prescription.instructions && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <strong>Instruksi:</strong> {prescription.instructions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}