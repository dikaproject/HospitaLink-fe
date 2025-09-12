import { Trash2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

type Patient = {
  id: string
  name: string
  nik: string
  birthDate: string
  gender: "L" | "P"
  phone: string
  address: string
}

export default function DeletePatientDialog({
  patient,
  open,
  onOpenChange,
  onConfirm,
}: {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (id: string) => void
}) {
  if (!patient) return null

  const handleConfirm = () => {
    onConfirm(patient.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            Konfirmasi Hapus
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{patient.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">NIK: {patient.nik}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Telepon: {patient.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
            variant="destructive"
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Pasien
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
