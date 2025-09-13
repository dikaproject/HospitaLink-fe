import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Users,
  TrendingUp,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { ScheduleCard } from '@/components/doctor/schedule/ScheduleCard';
import { ScheduleDetailDialog } from '@/components/doctor/schedule/ScheduleDetailDialog';
import { scheduleService } from '@/services/doctor/schedule';
import type { DoctorSchedule, WeeklyScheduleResponse } from '@/types/doctor/schedule';

export default function DoctorSchedule() {
  const [weekData, setWeekData] = useState<WeeklyScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const loadWeekSchedule = async (offset = 0) => {
    try {
      setLoading(true);
      const data = offset === 0 ? 
        await scheduleService.getCurrentWeekSchedule() :
        await scheduleService.getWeekSchedule(offset);
      setWeekData(data);
    } catch (error) {
      console.error('Load week schedule error:', error);
      toast.error('Gagal memuat jadwal minggu ini');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = (schedule: DoctorSchedule) => {
    setSelectedSchedule(schedule);
    setShowDetailDialog(true);
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const newOffset = direction === 'prev' ? currentWeekOffset - 1 : currentWeekOffset + 1;
    setCurrentWeekOffset(newOffset);
    loadWeekSchedule(newOffset);
  };

  useEffect(() => {
    loadWeekSchedule();
  }, []);

  const formatWeekRange = () => {
    if (!weekData?.data.weekInfo) return '';
    const start = new Date(weekData.data.weekInfo.startDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    const end = new Date(weekData.data.weekInfo.endDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  if (loading && !weekData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-32 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Jadwal Praktik</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Kelola dan lihat jadwal praktik Anda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => loadWeekSchedule(currentWeekOffset)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Link to="/doctor/schedule/upcoming">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Jadwal Mendatang
            </Button>
          </Link>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Minggu {weekData?.data.weekInfo.weekNumber || 1}, {weekData?.data.weekInfo.year}
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {formatWeekRange()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWeekNavigation('prev')}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Minggu Lalu
              </Button>
              
              {currentWeekOffset !== 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setCurrentWeekOffset(0);
                    loadWeekSchedule(0);
                  }}
                  disabled={loading}
                >
                  Minggu Ini
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWeekNavigation('next')}
                disabled={loading}
              >
                Minggu Depan
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jadwal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekData?.data.summary.totalSchedules || 0}</div>
            <p className="text-xs text-muted-foreground">Jadwal minggu ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jam Praktik</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{weekData?.data.summary.totalHours || 0}</div>
            <p className="text-xs text-muted-foreground">Total jam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{weekData?.data.summary.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">Pasien terjadwal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Aktif</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{weekData?.data.summary.availableDays || 0}</div>
            <p className="text-xs text-muted-foreground">Dari 7 hari</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Minggu Ini ({weekData?.data.schedules.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {weekData?.data.schedules && weekData.data.schedules.length > 0 ? (
              weekData.data.schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onClick={handleScheduleClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Tidak ada jadwal minggu ini
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Jadwal praktik untuk minggu ini belum diatur atau sedang libur.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link to="/doctor/schedule/upcoming">
                    <Button variant="outline">
                      Lihat Jadwal Mendatang
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ScheduleDetailDialog
        schedule={selectedSchedule}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  );
}