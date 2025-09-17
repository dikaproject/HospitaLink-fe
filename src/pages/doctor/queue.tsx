import { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  UserCheck, 
  RefreshCw,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { QueueCard } from '@/components/doctor/queue/QueueCard';
import { CompleteConsultationDialog } from '@/components/doctor/queue/CompleteConsultationDialog';
import { queueService } from '@/services/doctor/queue';
import type { Queue, TodayQueueResponse } from '@/types/doctor/queue';

export default function DoctorQueue() {
  const [queueData, setQueueData] = useState<TodayQueueResponse | null>(null);
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  // ✅ Control auto-refresh when dialog is open
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadQueueData = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      
      const [todayData, waitingData] = await Promise.all([
        queueService.getTodayQueue(),
        queueService.getWaitingQueues()
      ]);
      
      setQueueData(todayData);
      setWaitingQueues(waitingData.waitingQueues);
    } catch (error) {
      console.error('Load queue data error:', error);
      toast.error('Gagal memuat data antrian');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  // ✅ Setup auto-refresh with dialog awareness
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      // Only auto-refresh if no dialog is open
      if (!isDialogOpen) {
        console.log('🔄 Auto-refreshing queue data...');
        loadQueueData(false); // Don't show loading spinner for auto-refresh
      } else {
        console.log('⏸️ Skipping auto-refresh: Dialog is open');
      }
    }, 30000); // 30 seconds
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ✅ Handle dialog open/close with auto-refresh control
  const handleOpenCompleteDialog = (queue: Queue) => {
    console.log('🏁 Opening complete consultation dialog');
    setSelectedQueue(queue);
    setShowCompleteDialog(true);
    setIsDialogOpen(true);
    stopAutoRefresh(); // Stop auto-refresh when dialog opens
  };

  const handleCloseCompleteDialog = () => {
    console.log('❌ Closing complete consultation dialog');
    setShowCompleteDialog(false);
    setIsDialogOpen(false);
    setSelectedQueue(null);
    
    // Restart auto-refresh when dialog closes
    setTimeout(() => {
      startAutoRefresh();
      // Refresh data immediately after dialog closes
      loadQueueData(false);
    }, 100);
  };

  const handleCallNext = async () => {
    try {
      setCalling(true);
      const result = await queueService.callNextPatient();
      
      if (result.calledPatient) {
        toast.success(`Pasien ${result.queueNumber} berhasil dipanggil!`);
        loadQueueData(false); // Refresh without loading spinner
      } else {
        toast.info('Tidak ada pasien dalam antrian');
      }
    } catch (error) {
      console.error('Call next patient error:', error);
      toast.error('Gagal memanggil pasien berikutnya');
    } finally {
      setCalling(false);
    }
  };

  const handleCompleteConsultation = async (data: any) => {
    try {
      await queueService.completeConsultation(data);
      toast.success('Konsultasi berhasil diselesaikan!');
      handleCloseCompleteDialog(); // This will trigger refresh
    } catch (error) {
      console.error('Complete consultation error:', error);
      toast.error('Gagal menyelesaikan konsultasi');
    }
  };

  const handleSkipPatient = async (queue: Queue) => {
    try {
      await queueService.skipPatient(queue.id, 'Dilewati oleh dokter');
      toast.success(`Pasien ${queue.queueNumber} berhasil dilewati`);
      loadQueueData(false);
    } catch (error) {
      console.error('Skip patient error:', error);
      toast.error('Gagal melewati pasien');
    }
  };

  // ✅ Initial load and auto-refresh setup
  useEffect(() => {
    loadQueueData();
    startAutoRefresh();

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // ✅ Update auto-refresh when dialog state changes
  useEffect(() => {
    if (isDialogOpen) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  }, [isDialogOpen]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg" />
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kelola Antrian</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Kelola antrian pasien hari ini - {queueData?.doctorInfo.name} ({queueData?.doctorInfo.specialty})
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge 
            className={queueData?.doctorInfo.isOnDuty ? 
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }
          >
            {queueData?.doctorInfo.isOnDuty ? 'Sedang Bertugas' : 'Tidak Bertugas'}
          </Badge>
          
          {/* ✅ Show auto-refresh status */}
          <Badge variant="outline" className="text-xs">
            {isDialogOpen ? '⏸️ Auto-refresh paused' : '🔄 Auto-refresh aktif'}
          </Badge>
          
          <Button 
            variant="outline" 
            onClick={() => loadQueueData()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Patient */}
      {queueData?.current && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <UserCheck className="w-5 h-5" />
              Pasien Sedang Dilayani
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <QueueCard queue={queueData.current} />
              <Button 
                onClick={() => handleOpenCompleteDialog(queueData.current!)}
                className="bg-green-600 hover:bg-green-700"
                disabled={isDialogOpen}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Selesaikan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hari Ini</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Antrian hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{waitingQueues.length}</div>
            <p className="text-xs text-muted-foreground">Belum dilayani</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{queueData?.summary.completed || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/doctor/queue/history" className="text-blue-500 hover:underline">
                Lihat Riwayat
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Actions */}
      {!queueData?.current && waitingQueues.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Siap memanggil pasien berikutnya?
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Pasien berikutnya: {waitingQueues[0]?.queueNumber} - {waitingQueues[0]?.user.fullName}
                </p>
              </div>
              <Button 
                onClick={handleCallNext}
                disabled={calling || isDialogOpen}
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                {calling ? 'Memanggil...' : 'Panggil Pasien'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting Queues */}
      <Card>
        <CardHeader>
          <CardTitle>Antrian Menunggu ({waitingQueues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {waitingQueues.length > 0 ? (
              waitingQueues.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  showActions={!queueData?.current && !isDialogOpen}
                  onCall={handleCallNext}
                  onSkip={handleSkipPatient}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Tidak ada antrian menunggu
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Semua pasien sudah dilayani atau belum ada pasien yang mendaftar hari ini.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Complete Consultation Dialog */}
      <CompleteConsultationDialog
        queue={selectedQueue}
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onComplete={handleCompleteConsultation}
        onClose={handleCloseCompleteDialog}
      />
    </div>
  );
}