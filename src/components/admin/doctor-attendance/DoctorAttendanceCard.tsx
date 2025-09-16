import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
    User, 
    Phone, 
    Mail, 
    Stethoscope, 
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    UserCheck,
    UserX,
    Eye
} from "lucide-react"
import type { DoctorAttendanceItem } from "@/types/admin/doctor"

interface DoctorAttendanceCardProps {
    doctor: DoctorAttendanceItem
    onViewDetail: () => void
    onToggleDuty?: (isOnDuty: boolean) => void
    onToggleAvailability?: (isAvailable: boolean) => void
}

export default function DoctorAttendanceCard({ 
    doctor, 
    onViewDetail,
    onToggleDuty,
    onToggleAvailability 
}: DoctorAttendanceCardProps) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const formatCurrency = (amount: number | null) => {
        if (!amount) return 'Gratis'
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
    }

    const getStatusBadge = () => {
        const profile = doctor.doctorProfile
        if (!profile) return { variant: 'secondary', text: 'No Profile', icon: XCircle }

        if (profile.isOnDuty) {
            return { variant: 'default', text: 'Bertugas', icon: UserCheck, color: 'bg-green-500' }
        } else if (profile.isAvailable) {
            return { variant: 'outline', text: 'Tersedia', icon: CheckCircle, color: 'bg-blue-500' }
        } else {
            return { variant: 'secondary', text: 'Offline', icon: UserX, color: 'bg-gray-500' }
        }
    }

    const status = getStatusBadge()
    const StatusIcon = status.icon

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
            <CardContent className="p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                                <AvatarImage 
                                    src={doctor.profilePicture || ''} 
                                    alt={doctor.fullName} 
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                                    {getInitials(doctor.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            {/* Status indicator dot */}
                            <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${status.color} rounded-full border-2 border-white`}></div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                                {doctor.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {doctor.doctorProfile?.licenseNumber || 'No License'}
                            </p>
                        </div>
                    </div>

                    <Badge variant={status.variant as any} className="text-xs">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.text}
                    </Badge>
                </div>

                {/* Doctor Information */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Spesialis:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {doctor.doctorProfile?.specialty || '-'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Telepon:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {doctor.phone || '-'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {doctor.email}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Tarif:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(doctor.doctorProfile?.consultationFee)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Login Terakhir:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {doctor.lastLogin 
                                ? new Date(doctor.lastLogin).toLocaleString('id-ID')
                                : 'Belum pernah'
                            }
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={onViewDetail}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail Dokter
                    </Button>
                    
                    <div className="flex gap-2">
                        <Button 
                            variant={doctor.doctorProfile?.isOnDuty ? "destructive" : "default"}
                            size="sm"
                            className="flex-1"
                            onClick={() => onToggleDuty?.(!(doctor.doctorProfile?.isOnDuty || false))}
                        >
                            {doctor.doctorProfile?.isOnDuty ? (
                                <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Off Duty
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    On Duty
                                </>
                            )}
                        </Button>
                        
                        <Button 
                            variant={doctor.doctorProfile?.isAvailable ? "outline" : "secondary"}
                            size="sm"
                            className="flex-1"
                            onClick={() => onToggleAvailability?.(!(doctor.doctorProfile?.isAvailable || false))}
                        >
                            {doctor.doctorProfile?.isAvailable ? (
                                <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Unavailable
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Available
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}