export interface QueueUser {
  id: string;
  fullName: string;
  nik: string;
  phone: string;
  gender: 'L' | 'P';
  dateOfBirth?: string;
}

export interface QueueDoctor {
  name: string;
  specialty: string;
}

export interface QueueConsultation {
  id: string;
  type: 'AI' | 'GENERAL' | 'CHAT_DOCTOR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  symptoms: string[];
  aiAnalysis?: any;
  recommendation?: string;
}

export interface Queue {
  id: string;
  queueNumber: string;
  currentNumber?: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  position: number;
  estimatedWaitTime?: number;
  checkInTime: string;
  calledTime?: string;
  completedTime?: string;
  queueDate: string;
  queueType?: 'WALK_IN' | 'APPOINTMENT';
  isPriority?: boolean;
  notes?: string;
  user: QueueUser;
  doctor?: QueueDoctor;
  consultation?: QueueConsultation;
}

export interface QueueSummary {
  waiting: number;
  completed: number;
  total: number;
}

export interface TodayQueueResponse {
  total: number;
  current: Queue | null;
  waiting: Queue[];
  completed: Queue[];
  summary: QueueSummary;
  doctorInfo: {
    name: string;
    specialty: string;
    isOnDuty: boolean;
  };
}

export interface CallNextPatientResponse {
  calledPatient: Queue | null;
  queueNumber?: string;
  assignedDoctor?: {
    name: string;
    specialty: string;
  };
  hasMore: boolean;
}

export interface CompleteConsultationRequest {
  queueId: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: any[];
}