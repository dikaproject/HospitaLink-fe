import { useForm } from "react-hook-form"
import { Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { FieldText, FieldDate, FieldSelectGender, type PatientFormValues } from "./PatientFields"

type Patient = PatientFormValues & { id: string }

export default function EditPatientDialog({
  patient,
  open,
  onOpenChange,
  onSave,
}: {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: Patient) => void
}) {
  const form = useForm<PatientFormValues>({
    values: patient
      ? {
          id: patient.id,
          name: patient.name,
          nik: patient.nik,
          birthDate: patient.birthDate,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address,
        }
      : undefined,
  })

  if (!patient) return null

  const handleSubmit = (values: PatientFormValues) => {
    onSave({ ...(values as Patient), id: patient.id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Edit Data Pasien
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Perbarui informasi pasien {patient.name} dengan data yang benar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid grid-cols-1 gap-6">
                <FieldText name="name" label="Nama Lengkap" form={form} required />
                <FieldText name="nik" label="Nomor NIK" form={form} required />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldDate name="birthDate" label="Tanggal Lahir" form={form} required />
                  <FieldSelectGender name="gender" label="Jenis Kelamin" form={form} />
                </div>
                
                <FieldText name="phone" label="Nomor Telepon" form={form} required />
                <FieldText name="address" label="Alamat Lengkap" form={form} required />
              </div>

              <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
