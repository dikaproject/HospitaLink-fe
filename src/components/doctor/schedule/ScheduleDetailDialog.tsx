import { 
  Clock, 
  Users, 
  MapPin, 
  Calendar,
  FileText,
  X,
  Phone,
  User
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DoctorSchedule } from '@/types/doctor/schedule';

interface ScheduleDetailDialogProps {
  schedule: DoctorSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDetailDialog({ 
  schedule, 
  open, 
  onOpenChange 
}: ScheduleDetailDialogProps) {
  if (!schedule) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ONGOING': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div>Detail Jadwal Praktik</div>
              <div className="text-lg font-normal text-blue-600 dark:text-blue-400">
                {formatDate(schedule.date)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Informasi Jadwal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Waktu Praktik</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <Badge className={getStatusColor(schedule.status || 'UPCOMING')}>
                    {schedule.status === 'UPCOMING' ? 'Akan Datang' :
                     schedule.status === 'ONGOING' ? 'Berlangsung' :
                     schedule.status === 'COMPLETED' ? 'Selesai' :
                     schedule.status === 'CANCELLED' ? 'Dibatalkan' : 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tipe Jadwal</p>
                  <Badge variant="outline">
                    {schedule.scheduleType === 'REGULAR' ? 'Reguler' :
                     schedule.scheduleType === 'OVERTIME' ? 'Lembur' : 'Darurat'}
                  </Badge>
                </div>
                {schedule.location && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {schedule.location}
                    </p>
                  </div>
                )}
              </div>

              {schedule.maxPatients && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kapasitas Pasien</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {schedule.currentPatients || 0} / {schedule.maxPatients}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({Math.round(((schedule.currentPatients || 0) / schedule.maxPatients) * 100)}% terisi)
                    </span>
                  </div>
                </div>
              )}

              {schedule.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Catatan</p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">{schedule.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments List */}
          {schedule.appointments && schedule.appointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Daftar Janji Temu ({schedule.appointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.appointments.map((appointment, index) => (
                    <div key={appointment.id}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {appointment.patientName}
                              </span>
                            </div>
                            {appointment.patientPhone && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {appointment.patientPhone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {formatTime(appointment.appointmentTime)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {appointment.type === 'CONSULTATION' ? 'Konsultasi' :
                               appointment.type === 'FOLLOW_UP' ? 'Kontrol' : 'Darurat'}
                            </Badge>
                            <Badge 
                              variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {appointment.status === 'SCHEDULED' ? 'Dijadwalkan' :
                               appointment.status === 'CONFIRMED' ? 'Dikonfirmasi' :
                               appointment.status === 'IN_PROGRESS' ? 'Berlangsung' :
                               appointment.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="ml-11 mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          <p className="text-gray-700 dark:text-gray-200">{appointment.notes}</p>
                        </div>
                      )}
                      
                      {index < schedule.appointments!.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State for Appointments - FIX: Add safe check */}
          {(!schedule.appointments || schedule.appointments.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Daftar Janji Temu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Belum ada janji temu
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Janji temu untuk jadwal ini belum ada atau belum dijadwalkan.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}