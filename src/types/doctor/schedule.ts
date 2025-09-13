export interface DoctorSchedule {
  id: string;
  doctorId: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxPatients?: number;
  currentPatients?: number;
  scheduleType: 'REGULAR' | 'OVERTIME' | 'EMERGENCY';
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields
  duration?: number;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  appointments?: ScheduleAppointment[];
}

export interface ScheduleAppointment {
  id: string;
  patientName: string;
  patientPhone?: string;
  appointmentTime: string;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY';
  notes?: string;
}

export interface WeeklyScheduleResponse {
  success: boolean;
  data: {
    schedules: DoctorSchedule[];
    weekInfo: {
      startDate: string;
      endDate: string;
      weekNumber: number;
      year: number;
    };
    summary: {
      totalSchedules: number;
      totalHours: number;
      totalPatients: number;
      availableDays: number;
    };
  };
}

export interface UpcomingScheduleResponse {
  success: boolean;
  data: {
    schedules: DoctorSchedule[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}