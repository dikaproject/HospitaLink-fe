import { User, Calendar, Phone, MapPin, CreditCard, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Patient = {
  id: string
  name: string
  nik: string
  birthDate: string
  gender: "L" | "P"
  phone: string
  address: string
}

export default function DetailPatientDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Detail Pasien
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Informasi lengkap data pasien {patient.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{patient.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">ID: {patient.id}</p>
                <Badge variant="secondary" className="mt-2">
                  {patient.gender === "L" ? "Laki-laki" : "Perempuan"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailCard
              icon={<CreditCard className="h-5 w-5" />}
              title="Nomor NIK"
              value={patient.nik}
              className="bg-gray-50 dark:bg-gray-800"
            />
            
            <DetailCard
              icon={<Calendar className="h-5 w-5" />}
              title="Tanggal Lahir"
              value={patient.birthDate}
              className="bg-gray-50 dark:bg-gray-800"
            />
            
            <DetailCard
              icon={<Phone className="h-5 w-5" />}
              title="Nomor Telepon"
              value={patient.phone}
              className="bg-blue-50 dark:bg-blue-950"
            />
            
            <DetailCard
              icon={<Users className="h-5 w-5" />}
              title="Jenis Kelamin"
              value={patient.gender === "L" ? "Laki-laki" : "Perempuan"}
              className="bg-pink-50 dark:bg-pink-950"
            />
          </div>

          {/* Address */}
          <DetailCard
            icon={<MapPin className="h-5 w-5" />}
            title="Alamat Lengkap"
            value={patient.address}
            className="bg-green-50 dark:bg-green-950 col-span-full"
          />

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailCard({ 
  icon, 
  title, 
  value, 
  className = "" 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  className?: string
}) {
  return (
    <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
          <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value || "-"}</p>
        </div>
      </div>
    </div>
  )
}
