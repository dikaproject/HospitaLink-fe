import api from '@/types/api';
import type { 
  DoctorSchedule, 
  WeeklyScheduleResponse, 
  UpcomingScheduleResponse 
} from '@/types/doctor/schedule';

class ScheduleService {
  // Get current week schedule
  async getCurrentWeekSchedule(): Promise<WeeklyScheduleResponse> {
    const response = await api.get('/api/web/doctor/schedule/current-week');
    return response.data;
  }

  // Get specific week schedule
  async getWeekSchedule(weekOffset: number = 0): Promise<WeeklyScheduleResponse> {
    const response = await api.get('/api/web/doctor/schedule/week', {
      params: { offset: weekOffset }
    });
    return response.data;
  }

  // Get upcoming schedules (next weeks/months)
  async getUpcomingSchedules(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<UpcomingScheduleResponse> {
    const response = await api.get('/api/web/doctor/schedule/upcoming', { params });
    return response.data;
  }

  // Get schedule by date
  async getScheduleByDate(date: string): Promise<DoctorSchedule | null> {
    const response = await api.get(`/api/web/doctor/schedule/date/${date}`);
    return response.data.data?.schedule || null;
  }

  // Get schedule statistics
  async getScheduleStats(period: 'week' | 'month' = 'week'): Promise<{
    totalHours: number;
    totalPatients: number;
    avgPatientsPerDay: number;
    utilizationRate: number;
  }> {
    const response = await api.get('/api/web/doctor/schedule/stats', {
      params: { period }
    });
    return response.data.data;
  }
}

export const scheduleService = new ScheduleService();