import { useState, useEffect } from 'react';
import { Plus, Trash2, Pill, Save, Search, ShoppingCart, Users } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { prescriptionService } from '@/services/doctor/prescription';
import { patientService, type Patient } from '@/services/doctor/patient';
import type { 
  CreatePrescriptionRequest, 
  CreatePrescriptionMedication,
  Medication,
  MedicationCategory
} from '@/types/doctor/prescription';

interface CreatePrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePrescriptionRequest) => void;
  patients?: Patient[]; // Keep for backward compatibility
}

export function CreatePrescriptionDialog({
  open,
  onOpenChange,
  onSubmit,
  patients = [] // Not used anymore, will fetch from API
}: CreatePrescriptionDialogProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null); // Store selected patient separately
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false); // Control dropdown visibility
  const [consultationId, setConsultationId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medications, setMedications] = useState<CreatePrescriptionMedication[]>([]);
  
  // Medication search state
  const [medicationSearch, setMedicationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Medication[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState<MedicationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMedicationSearch, setShowMedicationSearch] = useState(false);

  // Search patients with API
  const searchPatients = async (query: string) => {
    if (!query || query.length < 2) {
      setPatientSearchResults([]);
      setShowPatientDropdown(false);
      return;
    }

    try {
      setPatientSearchLoading(true);
      const response = await patientService.searchPatients(query, 10);
      
      if (response.success) {
        setPatientSearchResults(response.data || []);
        setShowPatientDropdown(true); // Show dropdown when results are available
      } else {
        setPatientSearchResults([]);
        setShowPatientDropdown(false);
        toast.error('Gagal mencari pasien');
      }
    } catch (error) {
      console.error('Search patients error:', error);
      setPatientSearchResults([]);
      setShowPatientDropdown(false);
      toast.error('Gagal mencari pasien');
    } finally {
      setPatientSearchLoading(false);
    }
  };

  // Debounced patient search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPatients(patientSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Load medication categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await prescriptionService.getMedicationCategories();
        setCategories(data);
      } catch (error) {
        console.error('Load categories error:', error);
        toast.error('Gagal memuat kategori obat');
      }
    };

    if (open) {
      loadCategories();
    }
  }, [open]);

  // Search medications with error handling
  const searchMedications = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const data = await prescriptionService.searchMedications(
        query, 
        selectedCategory || undefined, 
        20
      );
      setSearchResults(data.medications || []);
    } catch (error) {
      console.error('Search medications error:', error);
      toast.error('Gagal mencari obat');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced medication search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMedications(medicationSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [medicationSearch, selectedCategory]);

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setSelectedPatient(patient);
    setPatientSearch(''); // Clear search input
    setPatientSearchResults([]); // Clear search results
    setShowPatientDropdown(false); // Hide dropdown
  };

  // Handle change patient
  const handleChangePatient = () => {
    setSelectedPatientId('');
    setSelectedPatient(null);
    setPatientSearch('');
    setPatientSearchResults([]);
    setShowPatientDropdown(false);
  };

  const addMedicationToList = (medication: Medication) => {
    const exists = medications.find(m => m.medicationId === medication.id);
    if (exists) {
      toast.error('Obat sudah ditambahkan');
      return;
    }

    const newMedication: CreatePrescriptionMedication = {
      medicationId: medication.id,
      quantity: 1,
      frequency: '3x sehari',
      duration: '3 hari',
      dosageInstructions: medication.dosageInstructions || '',
      notes: ''
    };

    setMedications([...medications, newMedication]);
    setShowMedicationSearch(false);
    setMedicationSearch('');
    toast.success(`${medication.genericName} ditambahkan`);
  };

  const removeMedication = (medicationId: string) => {
    setMedications(medications.filter(m => m.medicationId !== medicationId));
  };

  const updateMedication = (medicationId: string, field: keyof CreatePrescriptionMedication, value: string | number) => {
    setMedications(medications.map(med => 
      med.medicationId === medicationId ? { ...med, [field]: value } : med
    ));
  };

  const calculateTotalEstimate = () => {
    return medications.length > 0 ? 'Dihitung otomatis' : 'Rp 0';
  };

  const handleSubmit = () => {
    if (!selectedPatientId || medications.length === 0) {
      toast.error('Pilih pasien dan tambahkan minimal 1 obat');
      return;
    }

    const data: CreatePrescriptionRequest = {
      userId: selectedPatientId,
      medications,
      instructions: instructions || undefined,
      consultationId: consultationId || undefined,
    };

    onSubmit(data);
    
    // Reset form
    setSelectedPatientId('');
    setSelectedPatient(null);
    setPatientSearch('');
    setPatientSearchResults([]);
    setShowPatientDropdown(false);
    setConsultationId('');
    setInstructions('');
    setMedications([]);
    setMedicationSearch('');
    setSearchResults([]);
    setShowMedicationSearch(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Buat Resep Digital
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Buat resep digital dengan sistem pencarian pasien dan obat otomatis
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Patient Selection */}
          <div className="space-y-3">
            <Label htmlFor="patientSearch" className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pilih Pasien *
            </Label>
            
            {selectedPatient ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {selectedPatient.fullName}
                      {selectedPatient.age && (
                        <Badge variant="outline" className="text-xs">
                          {selectedPatient.age} tahun
                        </Badge>
                      )}
                      {selectedPatient.gender && (
                        <Badge variant="outline" className="text-xs">
                          {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                        </Badge>
                      )}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-1">
                      <p>NIK: {selectedPatient.nik || 'Tidak tersedia'}</p>
                      <p>Telepon: {selectedPatient.phone || 'Tidak tersedia'}</p>
                      {selectedPatient.email && (
                        <p>Email: {selectedPatient.email}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleChangePatient}
                  >
                    Ganti Pasien
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="patientSearch"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    onFocus={() => {
                      if (patientSearchResults.length > 0) {
                        setShowPatientDropdown(true);
                      }
                    }}
                    placeholder="Cari nama, NIK, telepon, atau email pasien..."
                    className="w-full pl-10"
                  />
                  {patientSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Dropdown - Only show when conditions are met */}
                {showPatientDropdown && patientSearch.length >= 2 && (
                  <div className="absolute z-50 w-full max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                    {patientSearchLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Mencari pasien...
                      </div>
                    ) : patientSearchResults.length > 0 ? (
                      patientSearchResults.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-0"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {patient.fullName}
                                {patient.age && (
                                  <Badge variant="outline" className="text-xs">
                                    {patient.age} th
                                  </Badge>
                                )}
                                {patient.gender && (
                                  <Badge variant="outline" className="text-xs">
                                    {patient.gender === 'MALE' ? 'L' : 'P'}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                                <div>NIK: {patient.nik || 'Tidak tersedia'}</div>
                                <div>Telepon: {patient.phone || 'Tidak tersedia'}</div>
                                {patient.email && (
                                  <div>Email: {patient.email}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Pasien tidak ditemukan
                        <p className="text-xs mt-1">
                          Pastikan pasien sudah pernah berkonsultasi atau membuat janji
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {patientSearch.length > 0 && patientSearch.length < 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ketik minimal 2 karakter untuk mencari pasien
                  </p>
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
              placeholder="Masukkan ID konsultasi jika ada..."
              className="mt-1"
            />
          </div>

          {/* Medications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Daftar Obat ({medications.length})
              </Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMedicationSearch(true)}
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
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
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
                {medications.map((medication, index) => (
                  <Card key={medication.medicationId} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">Obat {index + 1}</Badge>
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
                          <Input
                            value={medication.frequency || ''}
                            onChange={(e) => updateMedication(medication.medicationId, 'frequency', e.target.value)}
                            placeholder="3x sehari"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Durasi</Label>
                          <Input
                            value={medication.duration || ''}
                            onChange={(e) => updateMedication(medication.medicationId, 'duration', e.target.value)}
                            placeholder="7 hari"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Catatan</Label>
                          <Input
                            value={medication.notes || ''}
                            onChange={(e) => updateMedication(medication.medicationId, 'notes', e.target.value)}
                            placeholder="Setelah makan"
                            className="mt-1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-sm">Instruksi Dosis</Label>
                          <Input
                            value={medication.dosageInstructions || ''}
                            onChange={(e) => updateMedication(medication.medicationId, 'dosageInstructions', e.target.value)}
                            placeholder="1 tablet diminum 3x sehari setelah makan"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Belum ada obat dipilih
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Klik "Cari Obat" untuk menambahkan obat ke resep
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

          {/* Total Estimate */}
          {medications.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800 dark:text-green-200">
                  Estimasi Total:
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {calculateTotalEstimate()}
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                Total akan dihitung otomatis berdasarkan harga obat terkini
              </p>
            </div>
          )}
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
            disabled={!selectedPatientId || medications.length === 0}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Buat Resep ({medications.length} obat)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}