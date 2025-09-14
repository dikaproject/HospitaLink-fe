export interface QueueUser {
  id: string;
  fullName: string;
  nik: string | null;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  dateOfBirth: string | null;
  email?: string;
  street?: string | null;
  village?: string | null;
  district?: string | null;
  regency?: string | null;
  province?: string | null;
}

export interface QueueDoctor {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  consultationFee?: number | null;
  user?: {
    email: string;
    phone: string | null;
  };
}

export interface QueueConsultation {
  id: string;
  type: 'AI' | 'GENERAL' | 'CHAT_DOCTOR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  symptoms: string[];
  aiAnalysis?: any;
  recommendation?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  symptoms: string;
  notes: string | null;
  visitDate: string;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  medications: any;
  instructions: string | null;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string | null;
}

export interface Queue {
  id: string;
  queueNumber: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  position: number;
  estimatedWaitTime?: number | null;
  checkInTime: string;
  calledTime?: string | null;
  completedTime?: string | null;
  queueDate: string;
  queueType?: 'WALK_IN' | 'APPOINTMENT';
  isPriority: boolean;
  notes?: string | null;
  user: QueueUser;
  doctor?: QueueDoctor | null;
  consultation?: QueueConsultation | null;
  medicalRecords?: MedicalRecord[];
  prescriptions?: Prescription[];
}

export interface QueueListItem {
  id: string;
  queueNumber: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  position: number;
  queueDate: string;
  checkInTime: string;
  calledTime?: string | null;
  completedTime?: string | null;
  isPriority: boolean;
  user: {
    id: string;
    fullName: string;
    nik: string | null;
    phone: string | null;
    gender: 'MALE' | 'FEMALE' | null;
  };
  doctor?: {
    id: string;
    name: string;
    specialty: string;
  } | null;
  consultation?: {
    type: 'AI' | 'GENERAL' | 'CHAT_DOCTOR';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    symptoms: string[];
  } | null;
}

export interface QueueStatistics {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface QueuePagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueueResponse {
  success: boolean;
  message: string;
  data: {
    queues: QueueListItem[];
    pagination: QueuePagination;
    statistics: QueueStatistics;
  };
}

export interface QueueDetailResponse {
  success: boolean;
  message: string;
  data: Queue;
}