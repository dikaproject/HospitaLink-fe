import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { type MedicationWithStatus } from "@/types/admin/medication"

interface DetailMedicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medication: MedicationWithStatus | null
  onEdit?: (medication: MedicationWithStatus) => void
}

export function DetailMedicationDialog({ 
  open, 
  onOpenChange, 
  medication, 
  onEdit 
}: DetailMedicationDialogProps) {
  
  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get stock status badge
  const getStockStatusBadge = (medication: MedicationWithStatus) => {
    const { stockStatus, stock } = medication
    
    switch (stockStatus) {
      case 'LOW':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Stok Rendah ({stock})
          </Badge>
        )
      case 'HIGH':
        return (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            Stok Tinggi ({stock})
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Normal ({stock})
          </Badge>
        )
    }
  }

  if (!medication) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-lg">
                💊
              </div>
              <div>
                <div className="text-xl font-bold">{medication.genericName}</div>
                {medication.brandName && (
                  <div className="text-sm text-gray-500">{medication.brandName}</div>
                )}
              </div>
            </div>
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(medication)}
              >
                ✏️ Edit
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Kode: {medication.medicationCode} | Kategori: {medication.category}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Informasi Dasar</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kode Obat</label>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {medication.medicationCode}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Generik</label>
                <p className="text-sm font-medium">{medication.genericName}</p>
              </div>
              
              {medication.brandName && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Merek</label>
                  <p className="text-sm">{medication.brandName}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kategori</label>
                <Badge variant="secondary">{medication.category}</Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bentuk Sediaan</label>
                <p className="text-sm">{medication.dosageForm}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kekuatan</label>
                <p className="text-sm font-medium">{medication.strength} {medication.unit}</p>
              </div>
              
              {medication.manufacturer && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Produsen</label>
                  <p className="text-sm">{medication.manufacturer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock & Price Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Stok & Harga</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Harga per Unit</label>
                <p className="text-lg font-bold text-green-600">{formatCurrency(medication.pricePerUnit)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Stok Saat Ini</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{medication.stock}</span>
                  {getStockStatusBadge(medication)}
                </div>
                <Progress 
                  value={medication.stockPercentage} 
                  className="h-2 mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Stok Minimum</label>
                  <p className="text-sm font-medium text-orange-600">{medication.minStock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Stok Maksimum</label>
                  <p className="text-sm font-medium text-blue-600">{medication.maxStock}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          {(medication.description || medication.indications || medication.contraindications || medication.sideEffects || medication.dosageInstructions) && (
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Informasi Klinis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medication.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Deskripsi</label>
                    <p className="text-sm mt-1">{medication.description}</p>
                  </div>
                )}
                
                {medication.indications && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Indikasi</label>
                    <p className="text-sm mt-1">{medication.indications}</p>
                  </div>
                )}
                
                {medication.contraindications && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kontraindikasi</label>
                    <p className="text-sm mt-1 text-red-600">{medication.contraindications}</p>
                  </div>
                )}
                
                {medication.sideEffects && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Efek Samping</label>
                    <p className="text-sm mt-1 text-orange-600">{medication.sideEffects}</p>
                  </div>
                )}
              </div>
              
              {medication.dosageInstructions && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Petunjuk Penggunaan</label>
                  <p className="text-sm mt-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">{medication.dosageInstructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Information */}
          <div className="md:col-span-2 pt-6 border-t">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={medication.isActive ? "default" : "secondary"}
                className={medication.isActive 
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }
              >
                {medication.isActive ? "✅ Aktif" : "❌ Tidak Aktif"}
              </Badge>
              
              <Badge 
                variant="outline"
                className={medication.requiresPrescription
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200"
                  : "bg-gray-50 dark:bg-gray-800"
                }
              >
                📋 {medication.requiresPrescription ? 'Perlu Resep' : 'Obat Bebas'}
              </Badge>
              
              {medication.isControlled && (
                <Badge 
                  variant="outline"
                  className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
                >
                  🔐 Obat Terkontrol
                </Badge>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Dibuat: {formatDate(medication.createdAt)}</p>
              {medication.updatedAt && (
                <p>Diperbarui: {formatDate(medication.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}