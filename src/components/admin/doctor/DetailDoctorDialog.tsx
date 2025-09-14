import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Phone, MapPin, Stethoscope, Badge as BadgeIcon, DollarSign, Calendar, FileText, Clock, Activity, Edit } from 'lucide-react';
import { doctorService } from '@/services/admin/doctor';
import type { Doctor } from '@/types/admin/doctor';

interface DetailDoctorDialogProps {
  open: boolean;
  onClose: () => void;
  doctorId: string;
}

const DetailDoctorDialog: React.FC<DetailDoctorDialogProps> = ({
  open,
  onClose,
  doctorId,
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctor detail
  const fetchDoctorDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getDoctorById(doctorId);
      
      if (response.success) {
        setDoctor(response.data);
      } else {
        setError('Gagal memuat detail dokter');
      }
    } catch (err: any) {
      console.error('Fetch doctor detail error:', err);
      setError(err.response?.data?.message || 'Gagal memuat detail dokter');
    } finally {
      setLoading(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && doctorId) {
      fetchDoctorDetail();
    }
  }, [open, doctorId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setDoctor(null);
      setError(null);
    }
  }, [open]);

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format gender
  const formatGender = (gender: string | null) => {
    if (gender === 'MALE') return 'Laki-laki';
    if (gender === 'FEMALE') return 'Perempuan';
    return '-';
  };

  // Get full address
  const getFullAddress = () => {
    if (!doctor) return '-';
    
    const addressParts = [
      doctor.street,
      doctor.village,
      doctor.district,
      doctor.regency,
      doctor.province
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : '-';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold">Detail Dokter</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Memuat detail dokter...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border-0 shadow-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : doctor ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={doctor.profilePicture || undefined} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {doctor.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 rounded-full">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {doctor.fullName}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {doctor.doctorProfile?.specialty || 'Spesialisasi tidak tersedia'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={doctor.isActive ? 'default' : 'destructive'}
                        className="px-3 py-1"
                      >
                        {doctor.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                      {doctor.doctorProfile?.isAvailable && (
                        <Badge variant="secondary" className="px-3 py-1">
                          <Activity className="h-3 w-3 mr-1" />
                          Tersedia
                        </Badge>
                      )}
                      {doctor.doctorProfile?.isOnDuty && (
                        <Badge variant="secondary" className="px-3 py-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Sedang Bertugas
                        </Badge>
                      )}
                      {doctor.emailVerified && (
                        <Badge variant="secondary" className="px-3 py-1">
                          Email Terverifikasi
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">NIK</p>
                        <p className="font-medium">{doctor.nik || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Jenis Kelamin</p>
                        <p className="font-medium">{formatGender(doctor.gender)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Tanggal Lahir</p>
                        <p className="font-medium">{formatDate(doctor.dateOfBirth)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Mail className="h-4 w-4 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <p className="font-medium">{doctor.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Phone className="h-4 w-4 text-green-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Telepon</p>
                        <p className="font-medium">{doctor.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Informasi Profesi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <BadgeIcon className="h-4 w-4 text-purple-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Nomor Lisensi</p>
                        <p className="font-medium">{doctor.doctorProfile?.licenseNumber || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Spesialisasi</p>
                        <p className="font-medium">{doctor.doctorProfile?.specialty || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <DollarSign className="h-4 w-4 text-amber-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Biaya Konsultasi</p>
                        <p className="font-medium text-lg text-green-600">
                          {formatCurrency(doctor.doctorProfile?.consultationFee)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <p className="text-sm text-muted-foreground mb-2">Status Ketersediaan</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={doctor.doctorProfile?.isAvailable ? 'default' : 'destructive'}>
                          {doctor.doctorProfile?.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                        </Badge>
                        <Badge variant={doctor.doctorProfile?.isOnDuty ? 'secondary' : 'outline'}>
                          {doctor.doctorProfile?.isOnDuty ? 'Sedang Bertugas' : 'Tidak Bertugas'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  Alamat Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm leading-relaxed">{getFullAddress()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bio & Additional Info */}
            {(doctor.doctorProfile?.bio || doctor.doctorProfile?.schedule) && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                      <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    Informasi Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.doctorProfile?.bio && (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <p className="text-sm text-muted-foreground mb-2 font-medium">Biografi</p>
                      <p className="text-sm leading-relaxed">{doctor.doctorProfile.bio}</p>
                    </div>
                  )}
                  
                  {doctor.doctorProfile?.schedule && (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <p className="text-sm text-muted-foreground mb-2 font-medium">Jadwal Praktik</p>
                      <pre className="text-xs bg-white dark:bg-slate-900 p-3 rounded border overflow-x-auto">
                        {JSON.stringify(doctor.doctorProfile.schedule, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  Informasi Sistem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-muted-foreground mb-1">Tanggal Bergabung</p>
                    <p className="font-medium">{formatDate(doctor.createdAt)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-muted-foreground mb-1">Terakhir Diupdate</p>
                    <p className="font-medium">{formatDate(doctor.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} size="lg">
                Tutup
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Handle edit doctor
                  console.log('Edit doctor:', doctor.id);
                }} 
                size="lg"
                className="shadow-lg"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Data
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default DetailDoctorDialog;