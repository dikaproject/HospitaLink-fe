export interface PrescriptionUser {
  id: string;
  fullName: string;
  phone: string;
  nik: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
}

export interface PrescriptionConsultation {
  type: string;
  severity?: string;
  symptoms?: string[];
  recommendation?: string;
}

export interface PrescriptionAppointment {
  appointmentDate: string;
  type: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  medications: Medication[];
  instructions?: string;
  totalAmount?: number;
  pharmacyNotes?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: 'CASH' | 'BPJS' | 'INSURANCE' | 'CREDIT_CARD';
  isPaid: boolean;
  isDispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  user: PrescriptionUser;
  consultation?: PrescriptionConsultation;
  appointment?: PrescriptionAppointment;
}

export interface PrescriptionSummary {
  total: number;
  paid: number;
  dispensed: number;
  pending: number;
}

export interface TodayPrescriptionsResponse {
  prescriptions: Prescription[];
  summary: PrescriptionSummary;
}

export interface CreatePrescriptionRequest {
  userId: string;
  consultationId?: string;
  appointmentId?: string;
  medications: Medication[];
  instructions?: string;
  totalAmount?: number;
}

export interface PrescriptionHistoryResponse {
  prescriptions: Prescription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}