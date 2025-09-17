import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MedicationField } from './MedicationField'
import { medicationService } from "@/services/admin/medication"
import {
  MEDICATION_CATEGORIES,
  DOSAGE_FORMS,
  UNITS,
  type MedicationWithStatus,
  type UpdateMedicationRequest,
  type MedicationFormErrors
} from "@/types/admin/medication"

interface EditMedicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medication: MedicationWithStatus | null
  onSuccess: () => void
}

export function EditMedicationDialog({ open, onOpenChange, medication, onSuccess }: EditMedicationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<MedicationFormErrors>({})
  const [formData, setFormData] = useState<UpdateMedicationRequest>({})

  // Initialize form data when medication changes
  useEffect(() => {
    if (medication) {
      setFormData({
        medicationCode: medication.medicationCode,
        genericName: medication.genericName,
        brandName: medication.brandName || '',
        category: medication.category,
        dosageForm: medication.dosageForm,
        strength: medication.strength,
        unit: medication.unit,
        manufacturer: medication.manufacturer || '',
        description: medication.description || '',
        indications: medication.indications || '',
        contraindications: medication.contraindications || '',
        sideEffects: medication.sideEffects || '',
        dosageInstructions: medication.dosageInstructions || '',
        pricePerUnit: medication.pricePerUnit,
        stock: medication.stock,
        minStock: medication.minStock,
        maxStock: medication.maxStock,
        requiresPrescription: medication.requiresPrescription,
        isControlled: medication.isControlled,
        isActive: medication.isActive
      })
      setErrors({})
    }
  }, [medication])

  const handleInputChange = (field: keyof UpdateMedicationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: MedicationFormErrors = {}

    if (!formData.medicationCode?.trim()) {
      newErrors.medicationCode = 'Kode obat wajib diisi'
    }

    if (!formData.genericName?.trim()) {
      newErrors.genericName = 'Nama generik wajib diisi'
    }

    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih'
    }

    if (!formData.dosageForm) {
      newErrors.dosageForm = 'Bentuk sediaan wajib dipilih'
    }

    if (!formData.strength?.trim()) {
      newErrors.strength = 'Kekuatan obat wajib diisi'
    }

    if (!formData.unit) {
      newErrors.unit = 'Satuan wajib dipilih'
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = 'Harga harus lebih dari 0'
    }

    if (formData.minStock !== undefined && formData.minStock < 0) {
      newErrors.minStock = 'Stok minimum tidak boleh negatif'
    }

    if (formData.maxStock !== undefined && formData.maxStock <= 0) {
      newErrors.maxStock = 'Stok maksimum harus lebih dari 0'
    }

    if (formData.minStock !== undefined && formData.maxStock !== undefined && formData.minStock >= formData.maxStock) {
      newErrors.minStock = 'Stok minimum harus kurang dari stok maksimum'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!medication || !validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await medicationService.updateMedication(medication.id, formData)
      
      if (response.success) {
        onSuccess()
        onOpenChange(false)
      } else {
        // Handle API errors
        if (response.message) {
          setErrors({ genericName: response.message })
        }
      }
    } catch (error: any) {
      console.error('Update medication error:', error)
      setErrors({ genericName: 'Terjadi kesalahan saat menyimpan data' })
    } finally {
      setLoading(false)
    }
  }

  if (!medication) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
              ✏️
            </div>
            Edit Obat
          </DialogTitle>
          <DialogDescription>
            Ubah informasi obat: {medication.genericName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Dasar</h3>
            
            <MedicationField label="Kode Obat" required error={errors.medicationCode}>
              <Input
                placeholder="Contoh: MED001"
                value={formData.medicationCode || ''}
                onChange={(e) => handleInputChange('medicationCode', e.target.value)}
              />
            </MedicationField>

            <MedicationField label="Nama Generik" required error={errors.genericName}>
              <Input
                placeholder="Nama generik obat"
                value={formData.genericName || ''}
                onChange={(e) => handleInputChange('genericName', e.target.value)}
              />
            </MedicationField>

            <MedicationField label="Nama Merek" error={errors.brandName}>
              <Input
                placeholder="Nama merek (opsional)"
                value={formData.brandName || ''}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
              />
            </MedicationField>

            <MedicationField label="Kategori" required error={errors.category}>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICATION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MedicationField>

            <MedicationField label="Bentuk Sediaan" required error={errors.dosageForm}>
              <Select value={formData.dosageForm} onValueChange={(value) => handleInputChange('dosageForm', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bentuk sediaan" />
                </SelectTrigger>
                <SelectContent>
                  {DOSAGE_FORMS.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MedicationField>

            <div className="grid grid-cols-2 gap-3">
              <MedicationField label="Kekuatan" required error={errors.strength}>
                <Input
                  placeholder="500"
                  value={formData.strength || ''}
                  onChange={(e) => handleInputChange('strength', e.target.value)}
                />
              </MedicationField>

              <MedicationField label="Satuan" required error={errors.unit}>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MedicationField>
            </div>

            <MedicationField label="Produsen" error={errors.manufacturer}>
              <Input
                placeholder="Nama produsen"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </MedicationField>
          </div>

          {/* Stock & Price Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stok & Harga</h3>
            
            <MedicationField label="Harga per Unit" required error={errors.pricePerUnit} description="Dalam Rupiah">
              <Input
                type="number"
                placeholder="5000"
                value={formData.pricePerUnit || ''}
                onChange={(e) => handleInputChange('pricePerUnit', parseFloat(e.target.value) || 0)}
              />
            </MedicationField>

            <MedicationField label="Stok Saat Ini" error={errors.stock}>
              <Input
                type="number"
                placeholder="100"
                value={formData.stock || ''}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              />
            </MedicationField>

            <div className="grid grid-cols-2 gap-3">
              <MedicationField label="Stok Minimum" error={errors.minStock}>
                <Input
                  type="number"
                  placeholder="5"
                  value={formData.minStock || ''}
                  onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                />
              </MedicationField>

              <MedicationField label="Stok Maksimum" error={errors.maxStock}>
                <Input
                  type="number"
                  placeholder="1000"
                  value={formData.maxStock || ''}
                  onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)}
                />
              </MedicationField>
            </div>

            {/* Status Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresPrescription"
                  checked={formData.requiresPrescription || false}
                  onCheckedChange={(checked) => handleInputChange('requiresPrescription', checked)}
                />
                <Label htmlFor="requiresPrescription" className="text-sm font-medium">
                  📋 Memerlukan resep dokter
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isControlled"
                  checked={formData.isControlled || false}
                  onCheckedChange={(checked) => handleInputChange('isControlled', checked)}
                />
                <Label htmlFor="isControlled" className="text-sm font-medium">
                  🔐 Obat terkontrol/narkotika
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  ✅ Status aktif
                </Label>
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-lg">Informasi Klinis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicationField label="Deskripsi" error={errors.description}>
                <Textarea
                  placeholder="Deskripsi obat..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </MedicationField>

              <MedicationField label="Indikasi" error={errors.indications}>
                <Textarea
                  placeholder="Indikasi penggunaan..."
                  value={formData.indications || ''}
                  onChange={(e) => handleInputChange('indications', e.target.value)}
                  rows={3}
                />
              </MedicationField>

              <MedicationField label="Kontraindikasi" error={errors.contraindications}>
                <Textarea
                  placeholder="Kontraindikasi..."
                  value={formData.contraindications || ''}
                  onChange={(e) => handleInputChange('contraindications', e.target.value)}
                  rows={3}
                />
              </MedicationField>

              <MedicationField label="Efek Samping" error={errors.sideEffects}>
                <Textarea
                  placeholder="Efek samping yang mungkin terjadi..."
                  value={formData.sideEffects || ''}
                  onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                  rows={3}
                />
              </MedicationField>
            </div>

            <MedicationField label="Petunjuk Penggunaan" error={errors.dosageInstructions}>
              <Textarea
                placeholder="Cara penggunaan dan dosis..."
                value={formData.dosageInstructions || ''}
                onChange={(e) => handleInputChange('dosageInstructions', e.target.value)}
                rows={2}
              />
            </MedicationField>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}