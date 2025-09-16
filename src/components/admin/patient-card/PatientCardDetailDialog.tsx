import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
    Download, 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    MapPin, 
    CreditCard,
    CheckCircle,
    XCircle,
    Loader2,
    QrCode
} from "lucide-react"
import type { Patient } from "@/types/admin/patientCard"
import { patientCardService } from "@/services/admin/patientCard"
import { sensorNIK, formatDate } from "@/utils/formatters"
import QRCodeDisplay from "./QRCodeDisplay"

interface PatientCardDetailDialogProps {
    patient: Patient | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function PatientCardDetailDialog({
    patient,
    open,
    onOpenChange
}: PatientCardDetailDialogProps) {
    const [downloading, setDownloading] = useState(false)

    const handleDownload = async () => {
        if (!patient) return

        try {
            setDownloading(true)
            const blob = await patientCardService.downloadCard(patient.id)
            const filename = `kartu-pasien-${patient.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`
            patientCardService.downloadPdfFile(blob, filename)
        } catch (error) {
            console.error('Error downloading patient card:', error)
            alert('Gagal mengunduh kartu pasien. Silakan coba lagi.')
        } finally {
            setDownloading(false)
        }
    }

    if (!patient) return null

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getFullAddress = () => {
        const addressParts = [
            patient.street,
            patient.village,
            patient.district,
            patient.regency,
            patient.province
        ].filter(Boolean)
        
        return addressParts.length > 0 ? addressParts.join(', ') : 'Alamat tidak tersedia'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Detail Kartu Pasien
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Patient Header */}
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                            <AvatarImage 
                                src={patient.profilePicture || ''} 
                                alt={patient.fullName} 
                            />
                            <AvatarFallback className="bg-blue-500 text-white font-semibold text-lg">
                                {getInitials(patient.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {patient.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                ID: {patient.id}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={patient.isActive ? "default" : "secondary"}>
                                    {patient.isActive ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {patient.isActive ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                                <Badge variant="outline">
                                    {patient.role}
                                </Badge>
                            </div>
                        </div>

                        <Button 
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Mengunduh...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </>
                            )}
                        </Button>
                    </div>

                    {/* QR Code Section - Prominent display */}
                    {patient.qrCode && (
                        <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-center gap-6">
                                    <div className="text-center">
                                        <h4 className="text-lg font-semibold flex items-center justify-center gap-2 mb-3">
                                            <QrCode className="h-5 w-5" />
                                            QR Code Pasien
                                        </h4>
                                        <QRCodeDisplay 
                                            value={patient.qrCode} 
                                            size={120}
                                            className="border-2 border-gray-300 dark:border-gray-600 shadow-lg mx-auto"
                                        />
                                        <p className="mt-3 text-base font-medium text-gray-900 dark:text-gray-100 font-mono">
                                            {patient.qrCode}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Kode registrasi unik pasien
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Pribadi
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    NIK (Tersensor)
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 font-mono">
                                    {sensorNIK(patient.nik)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    * Beberapa digit disensor untuk privasi
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Jenis Kelamin
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {patient.gender === 'MALE' ? 'Laki-laki' : 
                                     patient.gender === 'FEMALE' ? 'Perempuan' : '-'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Tanggal Lahir
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {formatDate(patient.dateOfBirth)}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Email Verified
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {patient.emailVerified ? '✅ Terverifikasi' : '❌ Belum Terverifikasi'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Informasi Kontak
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Nomor Telepon
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {patient.phone || '-'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Email
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 break-all">
                                    {patient.email || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Address */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Alamat
                        </h4>
                        
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-base text-gray-900 dark:text-gray-100">
                                {getFullAddress()}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Additional Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Informasi Tambahan
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Terdaftar
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {formatDate(patient.createdAt)}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Login Terakhir
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                                    {formatDate(patient.lastLogin)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}