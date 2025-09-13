import { Clock, User, Phone, Stethoscope, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Queue } from '@/types/doctor/queue';

interface QueueCardProps {
  queue: Queue;
  showActions?: boolean;
  onCall?: (queue: Queue) => void;
  onSkip?: (queue: Queue) => void;
}

export function QueueCard({ queue, showActions = false, onCall, onSkip }: QueueCardProps) {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'WAITING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow border dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                {queue.queueNumber}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{queue.user.fullName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{queue.user.nik}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(queue.status)}>
              {queue.status === 'IN_PROGRESS' ? 'Sedang Dilayani' :
               queue.status === 'WAITING' ? 'Menunggu' :
               queue.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
            </Badge>
            
            {queue.isPriority && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Prioritas
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{queue.user.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{queue.user.phone}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Check-in: {formatTime(queue.checkInTime)}</span>
          </div>

          {queue.consultation && (
            <>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>Tipe: {queue.consultation.type}</span>
                {queue.consultation.severity && (
                  <Badge className={getSeverityColor(queue.consultation.severity)}>
                    {queue.consultation.severity}
                  </Badge>
                )}
              </div>
              
              {queue.consultation.symptoms.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gejala:</p>
                  <div className="flex flex-wrap gap-1">
                    {queue.consultation.symptoms.slice(0, 3).map((symptom, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                        {symptom}
                      </Badge>
                    ))}
                    {queue.consultation.symptoms.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                        +{queue.consultation.symptoms.length - 3} lainnya
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {queue.notes && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
              <strong>Catatan:</strong> {queue.notes}
            </div>
          )}
        </div>

        {showActions && queue.status === 'WAITING' && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onCall?.(queue)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              Panggil
            </button>
            <button
              onClick={() => onSkip?.(queue)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}