import { useState, useEffect } from 'react';
import { Check, FileText, Pill, TestTube, Calendar, Plus, Trash2, Search } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { prescriptionService } from '@/services/doctor/prescription';
import type { Queue } from '@/types/doctor/queue';

// ✅ Gender utility function
const getGenderDisplay = (gender: string | undefined | null): string => {
  if (!gender) return 'Tidak diketahui';
  
  const normalizedGender = gender.toString().toUpperCase();
  
  switch (normalizedGender) {
    case 'MALE':
    case 'M':
    case 'L':
    case 'LAKI-LAKI':
      return 'Laki-laki';
    case 'FEMALE':
    case 'F':
    case 'P':
    case 'PEREMPUAN':
      return 'Perempuan';
    default:
      return 'Tidak diketahui';
  }
};

// ✅ Age calculation utility
const calculateAge = (dateOfBirth: string | Date | undefined): string => {
  if (!dateOfBirth) return '';
  
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? ` (${age} tahun)` : '';
  } catch (error) {
    return '';
  }
};

interface LabTest {
  testName: string;
  testType: string;
  category: string;
  notes: string;
  isCritical: boolean;
}

interface Prescription {
  medicationId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  price: number;
  instructions: string;
  notes: string;
}

interface Medication {
  id: string;
  genericName: string;
  brandName?: string;
  strength: string;
  dosageForm: string;
  category: string;
  pricePerUnit: number;
  stock: number;
  unit: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  dosageInstructions?: string;
}

interface MedicationCategory {
  category: string;
  count: number;
}

interface CompleteConsultationDialogProps {
  queue: Queue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    queueId: string;
    notes?: string;
    diagnosis: string;
    treatment: string;
    prescriptions?: Prescription[];
    labTests?: LabTest[];
    followUpDays?: number;
    vitalSigns?: any;
  }) => void;
  onClose?: () => void;
}

export function CompleteConsultationDialog({
  queue,
  open,
  onOpenChange,
  onComplete,
  onClose
}: CompleteConsultationDialogProps) {
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUpDays, setFollowUpDays] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ Enhanced Vital signs
  const [vitalSigns, setVitalSigns] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    weight: '',
    height: ''
  });

  // ✅ Enhanced prescriptions with medication integration
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showMedicationSearch, setShowMedicationSearch] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Medication[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState<MedicationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // ✅ Enhanced Lab tests
  const [labTests, setLabTests] = useState<LabTest[]>([]);

  // ✅ Load medication categories when dialog opens
  useEffect(() => {
    const loadCategories = async () => {
      if (!open) return;
      
      try {
        const data = await prescriptionService.getMedicationCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Load categories error:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, [open]);

  // ✅ Search medications with debouncing
  useEffect(() => {
    const searchMedications = async () => {
      if (!medicationSearch || medicationSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const data = await prescriptionService.searchMedications(
          medicationSearch, 
          selectedCategory || undefined, 
          20
        );
        setSearchResults(data?.medications || []);
      } catch (error) {
        console.error('Search medications error:', error);
        setSearchResults([]);
        toast.error('Gagal mencari obat');
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(searchMedications, 300);
    return () => clearTimeout(timer);
  }, [medicationSearch, selectedCategory]);

  // ✅ Add medication from database
  const addMedicationFromDatabase = (medication: Medication) => {
    const exists = prescriptions.find(p => p.medicationId === medication.id);
    if (exists) {
      toast.error('Obat sudah ditambahkan');
      return;
    }

    const newPrescription: Prescription = {
      medicationId: medication.id,
      medicationName: medication.genericName,
      dosage: medication.strength,
      frequency: '3x sehari',
      duration: '7 hari',
      quantity: 1,
      price: medication.pricePerUnit,
      instructions: medication.dosageInstructions || '1 tablet diminum setelah makan',
      notes: ''
    };

    setPrescriptions([...prescriptions, newPrescription]);
    setShowMedicationSearch(false);
    setMedicationSearch('');
    setSearchResults([]);
    toast.success(`${medication.genericName} ditambahkan`);
  };

  // ✅ Add manual prescription (for offline medications)
  const addManualPrescription = () => {
    const newPrescription: Prescription = {
      medicationName: '',
      dosage: '',
      frequency: '3x sehari',
      duration: '7 hari',
      quantity: 1,
      price: 5000,
      instructions: '',
      notes: ''
    };

    setPrescriptions([...prescriptions, newPrescription]);
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string | number) => {
    const updated = prescriptions.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setPrescriptions(updated);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
    toast.success('Obat dihapus dari resep');
  };

  const addLabTest = () => {
    setLabTests([...labTests, {
      testName: '',
      testType: 'BLOOD',
      category: 'GENERAL',
      notes: '',
      isCritical: false
    }]);
  };

  const updateLabTest = (index: number, field: keyof LabTest, value: string | boolean) => {
    const updated = labTests.map((test, i) => 
      i === index ? { ...test, [field]: value } : test
    );
    setLabTests(updated);
  };

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  // ✅ Enhanced form reset
  const resetForm = () => {
    setNotes('');
    setDiagnosis('');
    setTreatment('');
    setFollowUpDays(null);
    setVitalSigns({
      temperature: '', bloodPressure: '', heartRate: '',
      respiratoryRate: '', weight: '', height: ''
    });
    setPrescriptions([]);
    setLabTests([]);
    setShowMedicationSearch(false);
    setMedicationSearch('');
    setSearchResults([]);
    setSelectedCategory('');
  };

  // ✅ Enhanced form validation
  const validateForm = () => {
    if (!diagnosis.trim()) {
      toast.error('Diagnosis harus diisi');
      return false;
    }

    if (diagnosis.trim().length < 10) {
      toast.error('Diagnosis minimal 10 karakter');
      return false;
    }

    if (!treatment.trim()) {
      toast.error('Treatment harus diisi');
      return false;
    }

    if (treatment.trim().length < 10) {
      toast.error('Treatment minimal 10 karakter');
      return false;
    }

    // Validate prescriptions
    for (let i = 0; i < prescriptions.length; i++) {
      const med = prescriptions[i];
      if (!med.medicationName.trim()) {
        toast.error(`Nama obat #${i + 1} harus diisi`);
        return false;
      }
      if (med.quantity < 1) {
        toast.error(`Kuantitas obat #${i + 1} minimal 1`);
        return false;
      }
    }

    // Validate lab tests
    for (let i = 0; i < labTests.length; i++) {
      const test = labTests[i];
      if (!test.testName.trim()) {
        toast.error(`Nama test lab #${i + 1} harus diisi`);
        return false;
      }
    }

    return true;
  };

  // ✅ Enhanced submit handler
  const handleSubmit = async () => {
    if (!queue || !validateForm()) return;

    try {
      setSubmitting(true);

      const data = {
        queueId: queue.id,
        notes: notes.trim() || undefined,
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
        prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
        labTests: labTests.length > 0 ? labTests : undefined,
        followUpDays: followUpDays || undefined,
        vitalSigns: Object.values(vitalSigns).some(v => v) ? vitalSigns : undefined,
      };

      console.log('🏁 Submitting consultation completion:', {
        queueId: queue.id,
        patientName: queue.user.fullName,
        prescriptionsCount: prescriptions.length,
        labTestsCount: labTests.length,
        hasVitalSigns: !!data.vitalSigns,
        hasFollowUp: !!followUpDays
      });

      await onComplete(data);
      
      // Reset form after successful submission
      resetForm();
      
    } catch (error) {
      console.error('❌ Complete consultation error:', error);
      toast.error('Gagal menyelesaikan konsultasi');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Enhanced close handler
  const handleClose = () => {
    if (submitting) return; // Prevent closing while submitting

    const hasUnsavedData = diagnosis.trim() || treatment.trim() || 
                          prescriptions.length > 0 || labTests.length > 0 ||
                          Object.values(vitalSigns).some(v => v);

    if (hasUnsavedData) {
      const confirmed = confirm('Ada data yang belum disimpan. Yakin ingin menutup?');
      if (!confirmed) return;
    }

    resetForm();
    onOpenChange(false);
    onClose?.();
  };

  const calculateEstimatedTotal = () => {
    if (prescriptions.length === 0) return 0;
    return prescriptions.reduce((total, med) => total + (med.quantity * med.price), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!queue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Selesaikan Konsultasi Offline
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Lengkapi konsultasi untuk pasien <strong>{queue?.user.fullName}</strong> 
            <span className="ml-2 text-blue-600 dark:text-blue-400">({queue?.queueNumber})</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* ✅ Enhanced Patient Info Summary */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {queue?.user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {queue?.user.fullName}
                  {calculateAge(queue?.user.dateOfBirth)}
                </h4>
                
                {/* ✅ FIXED: Use utility function for gender display */}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {getGenderDisplay(queue?.user.gender)} • {queue?.user.phone || 'No phone'}
                </p>
                
                {queue?.user.nik && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    NIK: {queue.user.nik}
                  </p>
                )}
                
                {queue?.consultation?.symptoms && (
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Keluhan:</strong> {Array.isArray(queue.consultation.symptoms) ? 
                        queue.consultation.symptoms.join(', ') : 
                        typeof queue.consultation.symptoms === 'string' ?
                        queue.consultation.symptoms :
                        JSON.stringify(queue.consultation.symptoms)
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Main Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Diagnosis * (min. 10 karakter)
              </Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Masukkan diagnosis berdasarkan pemeriksaan..."
                className="mt-1 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {diagnosis.length}/500 karakter {diagnosis.length >= 10 ? '✓' : '(min. 10)'}
              </p>
            </div>

            <div>
              <Label htmlFor="treatment" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tindakan/Treatment * (min. 10 karakter)
              </Label>
              <Textarea
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Masukkan tindakan yang diberikan..."
                className="mt-1 min-h-[100px]"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {treatment.length}/1000 karakter {treatment.length >= 10 ? '✓' : '(min. 10)'}
              </p>
            </div>
          </div>

          {/* ✅ ENHANCED Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Vital Signs (Opsional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Suhu Tubuh (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                    placeholder="36.5"
                    className="mt-1"
                    min="35"
                    max="45"
                  />
                  <p className="text-xs text-gray-500 mt-1">Normal: 36.1-37.2°C</p>
                </div>
                <div>
                  <Label className="text-sm">Tekanan Darah</Label>
                  <Input
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                    placeholder="120/80"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: sistol/diastol</p>
                </div>
                <div>
                  <Label className="text-sm">Nadi (/menit)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                    placeholder="72"
                    className="mt-1"
                    min="40"
                    max="200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Normal: 60-100 bpm</p>
                </div>
                <div>
                  <Label className="text-sm">Pernapasan (/menit)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.respiratoryRate}
                    onChange={(e) => setVitalSigns({...vitalSigns, respiratoryRate: e.target.value})}
                    placeholder="20"
                    className="mt-1"
                    min="10"
                    max="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Normal: 12-20 /menit</p>
                </div>
                <div>
                  <Label className="text-sm">Berat Badan (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                    placeholder="65"
                    className="mt-1"
                    min="1"
                    max="300"
                  />
                </div>
                <div>
                  <Label className="text-sm">Tinggi Badan (cm)</Label>
                  <Input
                    type="number"
                    value={vitalSigns.height}
                    onChange={(e) => setVitalSigns({...vitalSigns, height: e.target.value})}
                    placeholder="170"
                    className="mt-1"
                    min="50"
                    max="250"
                  />
                </div>
              </div>
              
              {/* BMI Calculator */}
              {vitalSigns.weight && vitalSigns.height && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <div className="text-sm">
                    <strong>BMI:</strong> {(
                      parseFloat(vitalSigns.weight) / 
                      Math.pow(parseFloat(vitalSigns.height) / 100, 2)
                    ).toFixed(1)} kg/m²
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      ({(() => {
                        const bmi = parseFloat(vitalSigns.weight) / Math.pow(parseFloat(vitalSigns.height) / 100, 2);
                        if (bmi < 18.5) return 'Underweight';
                        if (bmi < 25) return 'Normal';
                        if (bmi < 30) return 'Overweight';
                        return 'Obese';
                      })()})
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ ENHANCED Prescriptions with Database Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Resep Digital ({prescriptions.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowMedicationSearch(true)}
                  >
                    <Search className="w-4 h-4 mr-1" />
                    Cari Database
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addManualPrescription}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Manual Entry
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Medication Search Modal */}
              {showMedicationSearch && (
                <Card className="border-2 border-blue-200 dark:border-blue-800 mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Pencarian Obat Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Filter */}
                    <div>
                      <Label className="text-sm">Kategori (Opsional)</Label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                      >
                        <option value="">Semua Kategori</option>
                        {categories.map(cat => (
                          <option key={cat.category} value={cat.category}>
                            {cat.category} ({cat.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Input */}
                    <div>
                      <Label className="text-sm">Cari Obat</Label>
                      <Input
                        value={medicationSearch}
                        onChange={(e) => setMedicationSearch(e.target.value)}
                        placeholder="Ketik nama obat, kode, atau merek..."
                        className="mt-1"
                      />
                    </div>

                    {/* Search Results */}
                    <div className="max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Mencari obat...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((medication) => (
                            <div
                              key={medication.id}
                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                              onClick={() => addMedicationFromDatabase(medication)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                    {medication.genericName}
                                    {medication.brandName && (
                                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                                        ({medication.brandName})
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {medication.dosageForm} {medication.strength} • Stok: {medication.stock}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {medication.category}
                                    </Badge>
                                    {medication.requiresPrescription && (
                                      <Badge variant="secondary" className="text-xs">
                                        Resep Dokter
                                      </Badge>
                                    )}
                                    {medication.isControlled && (
                                      <Badge variant="destructive" className="text-xs">
                                        Obat Keras
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(medication.pricePerUnit)}
                                  </p>
                                  <p className="text-xs text-gray-500">/{medication.unit}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : medicationSearch.length >= 2 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          Obat tidak ditemukan
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          Ketik minimal 2 karakter untuk mencari
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowMedicationSearch(false)}
                      >
                        Tutup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Prescriptions List */}
              {prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((med, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Obat {index + 1}</Badge>
                          {med.medicationId && (
                            <Badge variant="secondary" className="text-xs">Database</Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescription(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Nama Obat *</Label>
                          <Input
                            value={med.medicationName}
                            onChange={(e) => updatePrescription(index, 'medicationName', e.target.value)}
                            placeholder="Paracetamol"
                            className="mt-1"
                            disabled={!!med.medicationId}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Dosis</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                            placeholder="500mg"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Frekuensi</Label>
                          <select
                            value={med.frequency}
                            onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                          >
                            <option value="1x sehari">1x sehari</option>
                            <option value="2x sehari">2x sehari</option>
                            <option value="3x sehari">3x sehari</option>
                            <option value="4x sehari">4x sehari</option>
                            <option value="Sesuai kebutuhan">Sesuai kebutuhan</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm">Durasi</Label>
                          <select
                            value={med.duration}
                            onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                          >
                            <option value="3 hari">3 hari</option>
                            <option value="5 hari">5 hari</option>
                            <option value="7 hari">7 hari</option>
                            <option value="10 hari">10 hari</option>
                            <option value="14 hari">14 hari</option>
                            <option value="30 hari">30 hari</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm">Jumlah</Label>
                          <Input
                            type="number"
                            value={med.quantity}
                            onChange={(e) => updatePrescription(index, 'quantity', parseInt(e.target.value) || 1)}
                            placeholder="10"
                            className="mt-1"
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Harga per Unit (Rp)</Label>
                          <Input
                            type="number"
                            value={med.price}
                            onChange={(e) => updatePrescription(index, 'price', parseInt(e.target.value) || 0)}
                            placeholder="5000"
                            className="mt-1"
                            min="0"
                            disabled={!!med.medicationId}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Instruksi</Label>
                          <Input
                            value={med.instructions}
                            onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                            placeholder="Diminum setelah makan"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      {/* Total per medication */}
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Total: {formatCurrency(med.quantity * med.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total estimate */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Estimasi Total Resep:
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(calculateEstimatedTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Belum ada obat ditambahkan
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Gunakan pencarian database atau manual entry untuk menambah obat
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowMedicationSearch(true)}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Cari Database
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addManualPrescription}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ ENHANCED Lab Tests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Pemeriksaan Lab ({labTests.length})
                </CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addLabTest}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Lab
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {labTests.length > 0 ? (
                <div className="space-y-4">
                  {labTests.map((test, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Lab Test {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLabTest(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Nama Test *</Label>
                          <Input
                            value={test.testName}
                            onChange={(e) => updateLabTest(index, 'testName', e.target.value)}
                            placeholder="Complete Blood Count"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Tipe Test</Label>
                          <select
                            value={test.testType}
                            onChange={(e) => updateLabTest(index, 'testType', e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                          >
                            <option value="BLOOD">Darah</option>
                            <option value="URINE">Urin</option>
                            <option value="STOOL">Feses</option>
                            <option value="IMAGING">Imaging (Rontgen/CT/MRI)</option>
                            <option value="ECG">EKG</option>
                            <option value="OTHER">Lainnya</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm">Kategori</Label>
                          <select
                            value={test.category}
                            onChange={(e) => updateLabTest(index, 'category', e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                          >
                            <option value="GENERAL">Umum</option>
                            <option value="CHEMISTRY">Kimia Darah</option>
                            <option value="HEMATOLOGY">Hematologi</option>
                            <option value="MICROBIOLOGY">Mikrobiologi</option>
                            <option value="IMMUNOLOGY">Imunologi</option>
                            <option value="RADIOLOGY">Radiologi</option>
                            <option value="CARDIOLOGY">Kardiologi</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={test.isCritical}
                            onChange={(e) => updateLabTest(index, 'isCritical', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label className="text-sm">Kritis/Urgent</Label>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Catatan untuk Teknisi Lab</Label>
                          <Textarea
                            value={test.notes}
                            onChange={(e) => updateLabTest(index, 'notes', e.target.value)}
                            placeholder="Instruksi khusus, kondisi pasien, atau hal penting lainnya..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Belum ada pemeriksaan lab
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Tambahkan pemeriksaan lab yang diperlukan untuk pasien
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addLabTest}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Lab Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ Follow Up & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="followUpDays" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Follow Up (Opsional)
              </Label>
              <select
                id="followUpDays"
                value={followUpDays || ''}
                onChange={(e) => setFollowUpDays(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tidak perlu follow up</option>
                <option value="3">3 hari lagi</option>
                <option value="7">1 minggu lagi</option>
                <option value="14">2 minggu lagi</option>
                <option value="30">1 bulan lagi</option>
              </select>
            </div>
            <div>
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan khusus untuk pasien..."
                className="mt-1"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {notes.length}/500 karakter
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={submitting || !diagnosis.trim() || !treatment.trim() || diagnosis.length < 10 || treatment.length < 10}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Menyimpan...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Selesaikan Konsultasi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}