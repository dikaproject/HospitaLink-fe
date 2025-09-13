import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Phone, MapPin, Stethoscope, Badge as BadgeIcon, DollarSign, Calendar, FileText } from 'lucide-react';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Dokter</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : doctor ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={doctor.profilePicture || undefined} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{doctor.fullName}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {doctor.doctorProfile?.specialty || 'Spesialisasi tidak tersedia'}
                      </Badge>
                      <Badge variant={doctor.isActive ? 'default' : 'destructive'}>
                        {doctor.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {doctor.doctorProfile?.isAvailable && (
                        <Badge variant="secondary">Tersedia</Badge>
                      )}
                      {doctor.doctorProfile?.isOnDuty && (
                        <Badge variant="secondary">Sedang Bertugas</Badge>
                      )}
                      {doctor.emailVerified && (
                        <Badge variant="secondary">Email Terverifikasi</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">NIK</p>
                    <p className="font-medium">{doctor.nik || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                    <p className="font-medium">{formatGender(doctor.gender)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                    <p className="font-medium">{formatDate(doctor.dateOfBirth)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{doctor.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telepon</p>
                      <p className="font-medium">{doctor.phone || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Informasi Profesi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BadgeIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nomor Lisensi</p>
                      <p className="font-medium">{doctor.doctorProfile?.licenseNumber || '-'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Spesialisasi</p>
                    <p className="font-medium">{doctor.doctorProfile?.specialty || '-'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Biaya Konsultasi</p>
                      <p className="font-medium">{formatCurrency(doctor.doctorProfile?.consultationFee)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status Ketersediaan</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={doctor.doctorProfile?.isAvailable ? 'default' : 'destructive'}>
                        {doctor.doctorProfile?.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                      </Badge>
                      <Badge variant={doctor.doctorProfile?.isOnDuty ? 'secondary' : 'outline'}>
                        {doctor.doctorProfile?.isOnDuty ? 'Bertugas' : 'Tidak Bertugas'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{getFullAddress()}</p>
              </CardContent>
            </Card>

            {/* Bio & Schedule */}
            {(doctor.doctorProfile?.bio || doctor.doctorProfile?.schedule) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informasi Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.doctorProfile?.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Biografi</p>
                      <p>{doctor.doctorProfile.bio}</p>
                    </div>
                  )}
                  
                  {doctor.doctorProfile?.schedule && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Jadwal Praktik</p>
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(doctor.doctorProfile.schedule, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informasi Sistem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Bergabung</p>
                    <p className="font-medium">{formatDate(doctor.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Terakhir Diupdate</p>
                    <p className="font-medium">{formatDate(doctor.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
              <Button onClick={() => {
                // TODO: Handle edit doctor
                console.log('Edit doctor:', doctor.id);
              }}>
                Edit
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default DetailDoctorDialog;