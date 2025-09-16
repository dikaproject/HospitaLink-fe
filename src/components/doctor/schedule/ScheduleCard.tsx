// Create: hospitalink-fe/src/components/doctor/schedule/ScheduleCard.tsx
import { 
  Clock, 
  Users, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DoctorSchedule } from '@/types/doctor/schedule';

interface ScheduleCardProps {
  schedule: DoctorSchedule;
  onClick?: (schedule: DoctorSchedule) => void;
  showDate?: boolean;
}

export function ScheduleCard({ schedule, onClick, showDate = true }: ScheduleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ONGOING': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <Clock className="w-3 h-3" />;
      case 'ONGOING': return <PlayCircle className="w-3 h-3" />;
      case 'COMPLETED': return <CheckCircle className="w-3 h-3" />;
      case 'CANCELLED': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const utilizationPercentage = schedule.maxPatients ? 
    Math.round(((schedule.currentPatients || 0) / schedule.maxPatients) * 100) : 0;

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
    }`} onClick={() => onClick?.(schedule)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {showDate && (
              <div className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-1">
                {formatDate(schedule.date)}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </div>
          </CardTitle>
          
          <Badge className={getStatusColor(schedule.status || 'UPCOMING')}>
            {getStatusIcon(schedule.status || 'UPCOMING')}
            <span className="ml-1 capitalize">
              {schedule.status === 'UPCOMING' ? 'Akan Datang' :
               schedule.status === 'ONGOING' ? 'Berlangsung' :
               schedule.status === 'COMPLETED' ? 'Selesai' :
               schedule.status === 'CANCELLED' ? 'Dibatalkan' :
               schedule.status === 'SCHEDULED' ? 'Dijadwalkan' : 'Unknown'}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Schedule Type & Location */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Badge variant="outline">
              {schedule.scheduleType === 'REGULAR' ? 'Reguler' :
               schedule.scheduleType === 'OVERTIME' ? 'Lembur' : 'Darurat'}
            </Badge>
          </div>
          
          {schedule.location && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{schedule.location}</span>
            </div>
          )}
        </div>

        {/* Patient Capacity */}
        {schedule.maxPatients && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4" />
                Kapasitas Pasien
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {schedule.currentPatients || 0}/{schedule.maxPatients}
              </span>
            </div>
            
            <Progress 
              value={utilizationPercentage} 
              className="h-2"
            />
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {utilizationPercentage}% terisi
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Durasi:</span>
          <span className="font-medium">
            {schedule.duration || 
             Math.round((new Date(`2000-01-01T${schedule.endTime}`) - new Date(`2000-01-01T${schedule.startTime}`)) / (1000 * 60 / 60))} jam
          </span>
        </div>

        {/* Notes */}
        {schedule.notes && (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
            <p className="text-gray-700 dark:text-gray-200">{schedule.notes}</p>
          </div>
        )}

        {/* Appointments Preview */}
        {schedule.appointments && schedule.appointments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Janji Temu ({schedule.appointments.length})
            </div>
            <div className="space-y-1">
              {schedule.appointments.slice(0, 2).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300">
                    {formatTime(appointment.appointmentTime)} - {appointment.patientName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {appointment.status === 'SCHEDULED' ? 'Dijadwalkan' :
                     appointment.status === 'CONFIRMED' ? 'Dikonfirmasi' :
                     appointment.status === 'IN_PROGRESS' ? 'Berlangsung' :
                     appointment.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
                  </Badge>
                </div>
              ))}
              {schedule.appointments.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  +{schedule.appointments.length - 2} janji temu lainnya
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}