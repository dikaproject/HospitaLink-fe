import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { FieldText, FieldDate, FieldSelectGender, type PatientFormValues } from "./PatientFields"

export default function AddPatientDialog({ onAdd }: { onAdd: (values: PatientFormValues) => void }) {
  const form = useForm<PatientFormValues>({
    defaultValues: {
      name: "",
      nik: "",
      birthDate: "",
      gender: "L",
      phone: "",
      address: "",
    },
  })

  const handleSubmit = (values: PatientFormValues) => {
    onAdd(values)
    form.reset()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pasien
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Tambah Pasien Baru
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Masukkan informasi lengkap pasien untuk menambahkan data baru ke sistem.
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
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)}>
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Simpan Pasien
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
