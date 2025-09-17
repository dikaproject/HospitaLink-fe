import { useState, useEffect } from 'react';
import { X, Stethoscope, Pill, FileText, Calendar, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { chatService } from '@/services/doctor/chat';
import { prescriptionService } from '@/services/doctor/prescription';

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

interface SelectedMedication {
  medicationId: string;
  quantity: number;
  frequency: string;
  duration: string;
  dosageInstructions: string;
  notes: string;
}

interface CompleteConsultationDialogProps {
  consultationId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export function CompleteConsultationDialog({
  consultationId,
  patientName,
  isOpen,
  onClose,
  onCompleted
}: CompleteConsultationDialogProps) {
  // Form state
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState<number | null>(null);
  const [medications, setMedications] = useState<SelectedMedication[]>([]);
  const [completing, setCompleting] = useState(false);

  // Medication search state
  const [medicationSearch, setMedicationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Medication[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState<MedicationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMedicationSearch, setShowMedicationSearch] = useState(false);

  // Load medication categories
  useEffect(() => {
    const loadCategories = async () => {
      if (!isOpen) return;
      
      try {
        const data = await prescriptionService.getMedicationCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Load categories error:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, [isOpen]);

  // Search medications with debouncing
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

  const addMedicationToList = (medication: Medication) => {
    const exists = medications.find(m => m.medicationId === medication.id);
    if (exists) {
      toast.error('Obat sudah ditambahkan');
      return;
    }

    const newMedication: SelectedMedication = {
      medicationId: medication.id,
      quantity: 1,
      frequency: '3x sehari',
      duration: '7 hari',
      dosageInstructions: medication.dosageInstructions || '1 tablet diminum setelah makan',
      notes: ''
    };

    setMedications(prev => [...prev, newMedication]);
    setShowMedicationSearch(false);
    setMedicationSearch('');
    setSearchResults([]);
    toast.success(`${medication.genericName} ditambahkan`);
  };

  const removeMedication = (medicationId: string) => {
    setMedications(prev => prev.filter(m => m.medicationId !== medicationId));
    toast.success('Obat dihapus');
  };

  const updateMedication = (medicationId: string, field: keyof SelectedMedication, value: string | number) => {
    setMedications(prev => prev.map(med => 
      med.medicationId === medicationId ? { ...med, [field]: value } : med
    ));
  };

  const handleComplete = async () => {
    // Validation
    if (!diagnosis.trim()) {
      toast.error('Diagnosis harus diisi');
      return;
    }

    if (diagnosis.trim().length < 10) {
      toast.error('Diagnosis minimal 10 karakter');
      return;
    }

    if (!treatment.trim()) {
      toast.error('Treatment harus diisi');
      return;
    }

    if (treatment.trim().length < 10) {
      toast.error('Treatment minimal 10 karakter');
      return;
    }

    try {
      setCompleting(true);

      // Prepare prescriptions data - clean format
      const prescriptionsData = medications.map(med => {
        const medicationDetail = searchResults.find(m => m.id === med.medicationId);
        
        return {
          medicationId: med.medicationId,
          quantity: med.quantity,
          frequency: med.frequency,
          duration: med.duration,
          dosageInstructions: med.dosageInstructions,
          notes: med.notes,
          // Include medication details for backend processing
          medicationName: medicationDetail?.genericName || 'Unknown',
          dosage: medicationDetail?.strength || '',
          price: medicationDetail?.pricePerUnit || 5000,
          instructions: med.dosageInstructions
        };
      });

      const completionData = {
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
        doctorNotes: doctorNotes.trim() || undefined,
        prescriptions: prescriptionsData,
        followUpDays: followUpDays || undefined,
        decision: 'PRESCRIPTION_ONLY'
      };

      console.log('🏁 Completing consultation with data:', {
        consultationId,
        dataKeys: Object.keys(completionData),
        prescriptionsCount: prescriptionsData.length,
        diagnosisLength: completionData.diagnosis.length,
        treatmentLength: completionData.treatment.length
      });

      const result = await chatService.completeConsultation(consultationId, completionData);

      console.log('✅ Consultation completed successfully:', result);

      toast.success('Konsultasi berhasil diselesaikan');
      onCompleted();
      onClose();

      // Reset form
      setDiagnosis('');
      setTreatment('');
      setDoctorNotes('');
      setFollowUpDays(null);
      setMedications([]);
      setMedicationSearch('');
      setSearchResults([]);
      setShowMedicationSearch(false);

    } catch (error: any) {
      console.error('❌ Complete consultation error:', error);
      
      let errorMessage = 'Gagal menyelesaikan konsultasi';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = errors.map((err: any) => err.msg || err.message).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setCompleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Selesaikan Konsultasi Chat
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pasien: <span className="font-medium">{patientName}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Diagnosis */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Diagnosis * (min. 10 karakter)
            </Label>
            <Textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Contoh: Berdasarkan gejala yang dialami pasien yaitu demam, batuk, dan pilek selama 3 hari, pasien mengalami infeksi saluran pernapasan atas (ISPA)."
              className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {diagnosis.length}/500 karakter {diagnosis.length >= 10 ? '✓' : '(min. 10)'}
            </p>
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <Label htmlFor="treatment" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Treatment & Recommendations * (min. 10 karakter)
            </Label>
            <Textarea
              id="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Contoh: Pemberian obat simtomatik untuk meredakan gejala. Perbanyak istirahat, minum air putih minimal 8 gelas per hari. Hindari makanan pedas dan berminyak. Jika gejala memburuk atau demam tidak turun dalam 3 hari, segera konsultasi kembali."
              className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {treatment.length}/1000 karakter {treatment.length >= 10 ? '✓' : '(min. 10)'}
            </p>
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Resep Digital ({medications.length} obat)
              </Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMedicationSearch(true)}
                className="bg-white dark:bg-gray-700"
              >
                <Search className="w-4 h-4 mr-1" />
                Cari Obat
              </Button>
            </div>

            {/* Medication Search Modal */}
            {showMedicationSearch && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Pencarian Obat
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
                            onClick={() => addMedicationToList(medication)}
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

            {/* Selected Medications List */}
            {medications.length > 0 ? (
              <div className="space-y-3">
                {medications.map((medication, index) => {
                  const medicationDetail = searchResults.find(m => m.id === medication.medicationId);
                  
                  return (
                    <Card key={medication.medicationId} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Obat {index + 1}</Badge>
                            {medicationDetail && (
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {medicationDetail.genericName}
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(medication.medicationId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Kuantitas *</Label>
                            <Input
                              type="number"
                              value={medication.quantity}
                              onChange={(e) => updateMedication(medication.medicationId, 'quantity', parseInt(e.target.value) || 1)}
                              placeholder="1"
                              className="mt-1"
                              min="1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm">Frekuensi *</Label>
                            <select
                              value={medication.frequency}
                              onChange={(e) => updateMedication(medication.medicationId, 'frequency', e.target.value)}
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
                              value={medication.duration}
                              onChange={(e) => updateMedication(medication.medicationId, 'duration', e.target.value)}
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
                            <Label className="text-sm">Catatan</Label>
                            <Input
                              value={medication.notes}
                              onChange={(e) => updateMedication(medication.medicationId, 'notes', e.target.value)}
                              placeholder="Setelah makan"
                              className="mt-1"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label className="text-sm">Instruksi Dosis</Label>
                            <Input
                              value={medication.dosageInstructions}
                              onChange={(e) => updateMedication(medication.medicationId, 'dosageInstructions', e.target.value)}
                              placeholder="1 tablet diminum 3x sehari setelah makan"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Belum ada obat dipilih
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Klik "Cari Obat" untuk menambahkan obat ke resep (opsional)
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowMedicationSearch(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Cari Obat
                </Button>
              </div>
            )}
          </div>

          {/* Follow Up & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUpDays" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Follow Up (Opsional)
              </Label>
              <select
                id="followUpDays"
                value={followUpDays || ''}
                onChange={(e) => setFollowUpDays(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tidak perlu follow up</option>
                <option value="3">3 hari lagi</option>
                <option value="7">1 minggu lagi</option>
                <option value="14">2 minggu lagi</option>
                <option value="30">1 bulan lagi</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorNotes">Catatan Tambahan</Label>
              <Textarea
                id="doctorNotes"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Catatan khusus untuk pasien..."
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={completing}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              Batal
            </Button>
            <Button
              onClick={handleComplete}
              disabled={completing || diagnosis.length < 10 || treatment.length < 10}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {completing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Menyelesaikan...
                </div>
              ) : (
                '✅ Selesaikan Konsultasi'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}