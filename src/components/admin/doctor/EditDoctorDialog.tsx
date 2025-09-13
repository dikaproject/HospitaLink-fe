import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { doctorService } from '@/services/admin/doctor';
import type { Doctor, UpdateDoctorData } from '@/types/admin/doctor';

interface EditDoctorDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctorId: string;
}

const EditDoctorDialog: React.FC<EditDoctorDialogProps> = ({
  open,
  onClose,
  onSuccess,
  doctorId,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<UpdateDoctorData>({});

  // Fetch doctor data
  const fetchDoctorData = async () => {
    try {
      setFetchLoading(true);
      setError(null);

      const response = await doctorService.getDoctorById(doctorId);

      if (response.success) {
        const doctorData = response.data;
        setDoctor(doctorData);
        
        // Set form data
        setFormData({
          fullName: doctorData.fullName,
          nik: doctorData.nik || '',
          phone: doctorData.phone || '',
          gender: doctorData.gender || undefined,
          dateOfBirth: doctorData.dateOfBirth ? doctorData.dateOfBirth.split('T')[0] : '',
          street: doctorData.street || '',
          village: doctorData.village || '',
          district: doctorData.district || '',
          regency: doctorData.regency || '',
          province: doctorData.province || '',
          licenseNumber: doctorData.doctorProfile?.licenseNumber || '',
          specialty: doctorData.doctorProfile?.specialty || '',
          consultationFee: doctorData.doctorProfile?.consultationFee || undefined,
          bio: doctorData.doctorProfile?.bio || '',
          isAvailable: doctorData.doctorProfile?.isAvailable || false,
          isOnDuty: doctorData.doctorProfile?.isOnDuty || false,
        });
      } else {
        setError('Gagal memuat data dokter');
      }
    } catch (err: any) {
      console.error('Fetch doctor error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data dokter');
    } finally {
      setFetchLoading(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && doctorId) {
      fetchDoctorData();
    }
  }, [open, doctorId]);

  // Handle form input change
  const handleInputChange = (name: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Prepare data
      const submitData: UpdateDoctorData = { ...formData };
      
      // Convert consultationFee to number if provided
      if (submitData.consultationFee) {
        submitData.consultationFee = Number(submitData.consultationFee);
      }

      // Remove empty optional fields
      Object.keys(submitData).forEach(key => {
        const value = submitData[key as keyof UpdateDoctorData];
        if (value === '' || value === undefined) {
          delete submitData[key as keyof UpdateDoctorData];
        }
      });

      const response = await doctorService.updateDoctor(doctorId, submitData);

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setError(response.message || 'Gagal memperbarui data dokter');
      }
    } catch (err: any) {
      console.error('Update doctor error:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui data dokter');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setDoctor(null);
    setFormData({});
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Dokter</DialogTitle>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : doctor ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Dasar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nik">NIK</Label>
                  <Input
                    id="nik"
                    value={formData.nik || ''}
                    onChange={(e) => handleInputChange('nik', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select 
                    value={formData.gender || ''} 
                    onValueChange={(value) => handleInputChange('gender', value as 'MALE' | 'FEMALE')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Laki-laki</SelectItem>
                      <SelectItem value="FEMALE">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Profesi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Nomor Lisensi</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Spesialisasi</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty || ''}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Biaya Konsultasi</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0"
                    value={formData.consultationFee || ''}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Status Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable || false}
                    onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
                  />
                  <Label htmlFor="isAvailable">Tersedia</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isOnDuty"
                    checked={formData.isOnDuty || false}
                    onCheckedChange={(checked) => handleInputChange('isOnDuty', checked)}
                  />
                  <Label htmlFor="isOnDuty">Sedang Bertugas</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografi</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Alamat</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Jalan</Label>
                  <Input
                    id="street"
                    value={formData.street || ''}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Kelurahan</Label>
                  <Input
                    id="village"
                    value={formData.village || ''}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">Kecamatan</Label>
                  <Input
                    id="district"
                    value={formData.district || ''}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regency">Kota/Kabupaten</Label>
                  <Input
                    id="regency"
                    value={formData.regency || ''}
                    onChange={(e) => handleInputChange('regency', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input
                    id="province"
                    value={formData.province || ''}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditDoctorDialog;