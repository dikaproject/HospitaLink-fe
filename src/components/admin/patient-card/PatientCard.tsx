import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    Download,
    Eye,
    CheckCircle,
    XCircle,
    QrCode
} from "lucide-react"
import type { Patient } from "@/types/admin/patientCard"
import { sensorNIK } from "@/utils/formatters"
import QRCodeDisplay from "./QRCodeDisplay"

interface PatientCardProps {
    patient: Patient
    onClick: () => void
    onDownload?: () => void
}

export default function PatientCard({ patient, onClick, onDownload }: PatientCardProps) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID')
    }

    const handleDownloadClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click when download button is clicked
        onDownload?.()
    }

    return (
        <Card 
            className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"
            onClick={onClick}
        >
            <CardContent className="p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                            <AvatarImage 
                                src={patient.profilePicture || ''} 
                                alt={patient.fullName} 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                {getInitials(patient.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                                {patient.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                ID: {patient.id.slice(0, 8)}...
                            </p>
                        </div>
                    </div>

                    <Badge variant={patient.isActive ? "default" : "secondary"} className="text-xs">
                        {patient.isActive ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {patient.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </div>

                {/* Patient Information */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">NIK:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 font-mono">
                            {sensorNIK(patient.nik)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Telepon:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.phone || '-'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {patient.email || '-'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Lahir:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatDate(patient.dateOfBirth)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.gender === 'MALE' ? 'Laki-laki' : 
                             patient.gender === 'FEMALE' ? 'Perempuan' : '-'}
                        </span>
                    </div>

                    {/* QR Code Section */}
                    {patient.qrCode && (
                        <div className="flex items-start gap-2 text-sm pt-2">
                            <QrCode className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1" />
                            <div>
                                <span className="text-gray-600 dark:text-gray-400 block">Kode QR:</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <QRCodeDisplay 
                                        value={patient.qrCode} 
                                        size={40}
                                        className="border border-gray-200 dark:border-gray-700"
                                    />
                                    <span className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs">
                                        {patient.qrCode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                            e.stopPropagation()
                            onClick()
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadClick}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}