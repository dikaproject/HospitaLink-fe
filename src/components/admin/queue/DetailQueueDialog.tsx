import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  User, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Stethoscope, 
  Activity,
  FileText,
  Pill,
  CreditCard
} from 'lucide-react';
import { queueService } from '@/services/admin/queue';
import type { Queue } from '@/types/admin/queue';

interface DetailQueueDialogProps {
  open: boolean;
  onClose: () => void;
  queueId: string;
}

const DetailQueueDialog: React.FC<DetailQueueDialogProps> = ({
  open,
  onClose,
  queueId,
}) => {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch queue detail
  const fetchQueueDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await queueService.getQueueById(queueId);
      
      if (response.success) {
        setQueue(response.data);
      } else {
        setError('Gagal memuat detail antrian');
      }
    } catch (err: any) {
      console.error('Fetch queue detail error:', err);
      setError(err.response?.data?.message || 'Gagal memuat detail antrian');
    } finally {
      setLoading(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && queueId) {
      fetchQueueDetail();
    }
  }, [open, queueId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQueue(null);
      setError(null);
    }
  }, [open]);

  // Format date and time
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date only
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time only
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format gender
  const formatGender = (gender: string | null) => {
    if (gender === 'MALE') return 'Laki-laki';
    if (gender === 'FEMALE') return 'Perempuan';
    return '-';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING': return '⏳ Menunggu';
      case 'IN_PROGRESS': return '🔄 Sedang Dilayani';
      case 'COMPLETED': return '✅ Selesai';
      case 'CANCELLED': return '❌ Dibatalkan';
      default: return status;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get full address
  const getFullAddress = () => {
    if (!queue?.user) return '-';
    
    const addressParts = [
      queue.user.street,
      queue.user.village,
      queue.user.district,
      queue.user.regency,
      queue.user.province
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : '-';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold">Detail Antrian</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat detail antrian...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border-0 shadow-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : queue ? (
          <div className="space-y-6">
            {/* Queue Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Informasi Antrian
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Nomor Antrian</div>
                  <div className="text-2xl font-bold text-blue-600">{queue.queueNumber}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                  <Badge className={getStatusColor(queue.status)}>
                    {getStatusText(queue.status)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Posisi</div>
                  <div className="font-semibold">{queue.position}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Prioritas</div>
                  <Badge variant={queue.isPriority ? "destructive" : "secondary"}>
                    {queue.isPriority ? "🚨 Prioritas" : "Normal"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tanggal Antrian</div>
                  <div className="font-semibold">{formatDate(queue.queueDate)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Check-in</div>
                  <div className="font-semibold">{formatTime(queue.checkInTime)}</div>
                </div>
                {queue.calledTime && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dipanggil</div>
                    <div className="font-semibold">{formatTime(queue.calledTime)}</div>
                  </div>
                )}
                {queue.completedTime && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Selesai</div>
                    <div className="font-semibold">{formatTime(queue.completedTime)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pasien
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Nama Lengkap</div>
                  <div className="font-semibold">{queue.user.fullName}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">NIK</div>
                  <div className="font-mono text-sm">{queue.user.nik || '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jenis Kelamin</div>
                  <div className="font-semibold">{formatGender(queue.user.gender)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tanggal Lahir</div>
                  <div className="font-semibold">{formatDate(queue.user.dateOfBirth)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Telepon
                  </div>
                  <div className="font-semibold">{queue.user.phone || '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="font-semibold">{queue.user.email || '-'}</div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </div>
                  <div className="font-semibold">{getFullAddress()}</div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Info */}
            {queue.doctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Informasi Dokter
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Nama Dokter</div>
                    <div className="font-semibold">{queue.doctor.name}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Spesialisasi</div>
                    <div className="font-semibold">{queue.doctor.specialty}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Lisensi</div>
                    <div className="font-mono text-sm">{queue.doctor.licenseNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Biaya Konsultasi</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(queue.doctor.consultationFee)}
                    </div>
                  </div>
                  {queue.doctor.user && (
                    <>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Email Dokter</div>
                        <div className="font-semibold">{queue.doctor.user.email}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Telepon Dokter</div>
                        <div className="font-semibold">{queue.doctor.user.phone || '-'}</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Consultation Info */}
            {queue.consultation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Informasi Konsultasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tipe Konsultasi</div>
                      <Badge variant="outline">{queue.consultation.type}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tingkat Keparahan</div>
                      <Badge className={getSeverityColor(queue.consultation.severity)}>
                        {queue.consultation.severity}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gejala</div>
                    <div className="flex flex-wrap gap-2">
                      {queue.consultation.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {queue.consultation.recommendation && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rekomendasi</div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm">{queue.consultation.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {queue.consultation.aiAnalysis && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Analisis AI</div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(queue.consultation.aiAnalysis, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medical Records */}
            {queue.medicalRecords && queue.medicalRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Rekam Medis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {queue.medicalRecords.map((record, index) => (
                    <div key={record.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          Kunjungan #{index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs">
                            {formatDate(record.visitDate)}
                          </Badge>
                          <Badge 
                            variant={record.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {record.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-600 dark:text-gray-400">Diagnosis</div>
                          <div>{record.diagnosis}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600 dark:text-gray-400">Pengobatan</div>
                          <div>{record.treatment}</div>
                        </div>
                      </div>
                      
                      {record.symptoms && (
                        <div className="text-sm">
                          <div className="font-medium text-gray-600 dark:text-gray-400">Gejala</div>
                          <div>{record.symptoms}</div>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="text-sm">
                          <div className="font-medium text-gray-600 dark:text-gray-400">Catatan</div>
                          <div className="italic">{record.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Prescriptions */}
            {queue.prescriptions && queue.prescriptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Resep Obat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {queue.prescriptions.map((prescription, index) => (
                    <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {prescription.prescriptionCode}
                        </div>
                        <Badge 
                          variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {prescription.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <div className="font-medium text-gray-600 dark:text-gray-400">Obat-obatan</div>
                          <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap">
                            {JSON.stringify(prescription.medications, null, 2)}
                          </pre>
                        </div>
                        
                        {prescription.instructions && (
                          <div>
                            <div className="font-medium text-gray-600 dark:text-gray-400">Instruksi</div>
                            <div>{prescription.instructions}</div>
                          </div>
                        )}
                        
                        <div className="flex gap-4 text-xs text-gray-500">
                          <div>Dibuat: {formatDateTime(prescription.createdAt)}</div>
                          {prescription.expiresAt && (
                            <div>Kadaluarsa: {formatDateTime(prescription.expiresAt)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {queue.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{queue.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailQueueDialog;