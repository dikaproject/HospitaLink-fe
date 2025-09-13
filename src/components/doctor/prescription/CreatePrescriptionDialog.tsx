import { useState } from 'react';
import { Plus, Trash2, Pill, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { CreatePrescriptionRequest, Medication } from '@/types/doctor/prescription';

interface Patient {
  id: string;
  fullName: string;
  nik: string;
  phone: string;
}

interface CreatePrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePrescriptionRequest) => void;
  patients?: Patient[];
}

export function CreatePrescriptionDialog({
  open,
  onOpenChange,
  onSubmit,
  patients = []
}: CreatePrescriptionDialogProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [consultationId, setConsultationId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [medications, setMedications] = useState<Medication[]>([
    {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    }
  ]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.nik.includes(patientSearch)
  );

  const addMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handleSubmit = () => {
    if (!selectedPatientId || medications.some(m => !m.name || !m.dosage || !m.frequency)) {
      return;
    }

    const data: CreatePrescriptionRequest = {
      userId: selectedPatientId,
      medications: medications.filter(m => m.name.trim() !== ''),
      instructions: instructions || undefined,
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      consultationId: consultationId || undefined,
    };

    onSubmit(data);
    
    // Reset form
    setSelectedPatientId('');
    setPatientSearch('');
    setConsultationId('');
    setInstructions('');
    setTotalAmount('');
    setMedications([{
      name: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1
    }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Buat Resep Digital
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Buat resep digital untuk pasien
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Patient Selection */}
          <div className="space-y-3">
            <Label htmlFor="patientSearch" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Pilih Pasien
            </Label>
            
            {selectedPatient ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPatient.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      NIK: {selectedPatient.nik} • {selectedPatient.phone}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPatientId('')}
                  >
                    Ganti
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="patientSearch"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Cari nama atau NIK pasien..."
                  className="w-full"
                />
                
                {patientSearch && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setPatientSearch('');
                          }}
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            NIK: {patient.nik} • {patient.phone}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                        Pasien tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consultation ID (Optional) */}
          <div>
            <Label htmlFor="consultationId" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              ID Konsultasi (Opsional)
            </Label>
            <Input
              id="consultationId"
              value={consultationId}
              onChange={(e) => setConsultationId(e.target.value)}
              placeholder="Masukkan ID konsultasi..."
              className="mt-1"
            />
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Daftar Obat
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Obat
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Obat {index + 1}</Badge>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Nama Obat *</Label>
                    <Input
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      placeholder="Contoh: Paracetamol"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Dosis *</Label>
                    <Input
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="Contoh: 500mg"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Frekuensi *</Label>
                    <Input
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="Contoh: 3x sehari"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Durasi</Label>
                    <Input
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      placeholder="Contoh: 7 hari"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Jumlah</Label>
                    <Input
                      type="number"
                      value={medication.quantity}
                      onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      className="mt-1"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Instruksi Tambahan</Label>
                    <Input
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      placeholder="Setelah makan"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Instruksi Umum
            </Label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instruksi tambahan untuk pasien..."
              className="mt-1 w-full min-h-[80px] p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Total Amount */}
          <div>
            <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Total Biaya (Opsional)
            </Label>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              className="mt-1"
              min="0"
              step="1000"
            />
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!selectedPatientId || medications.some(m => !m.name || !m.dosage || !m.frequency)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Buat Resep
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}