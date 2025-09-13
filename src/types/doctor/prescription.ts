export interface PrescriptionUser {
  id: string;
  fullName: string;
  phone?: string; // Make optional
  nik?: string; // Make optional
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
}

export interface PrescriptionDoctor {
  name: string;
  specialty: string;
  licenseNumber?: string;
}

export interface PrescriptionConsultation {
  type: string;
  severity?: string;
  symptoms?: any; // Backend returns JSON object
  recommendation?: string;
}

export interface PrescriptionAppointment {
  appointmentDate: string;
  type: string;
}

// For search/selection - different from prescription medication
export interface Medication {
  id: string;
  medicationCode: string;
  genericName: string;
  brandName?: string;
  category: string;
  dosageForm: string;
  strength: string;
  unit: string;
  pricePerUnit: number;
  stock: number;
  indications?: string;
  dosageInstructions?: string;
  requiresPrescription: boolean;
  isControlled: boolean;
}

export interface MedicationCategory {
  category: string;
  count: number;
}

export interface CreatePrescriptionMedication {
  medicationId: string;
  quantity: number;
  dosageInstructions?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

// Update medication interface to match backend response
export interface PrescriptionMedication {
  medicationId: string;
  medicationCode: string;
  genericName: string;
  brandName?: string;
  dosageForm: string;
  strength: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  dosageInstructions?: string;
  frequency: string;
  duration?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  medications: PrescriptionMedication[]; // Updated type
  instructions?: string;
  totalAmount: number;
  pharmacyNotes?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod?: 'CASH' | 'BPJS' | 'INSURANCE' | 'CREDIT_CARD';
  isPaid: boolean;
  isDispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  user: PrescriptionUser;
  doctor?: PrescriptionDoctor;
  consultation?: PrescriptionConsultation;
  appointment?: PrescriptionAppointment;
}

export interface PrescriptionSummary {
  total: number;
  paid: number;
  dispensed: number;
  pending: number;
  totalValue?: number;
}

export interface TodayPrescriptionsResponse {
  prescriptions: Prescription[];
  summary: PrescriptionSummary;
}

export interface CreatePrescriptionRequest {
  userId: string;
  consultationId?: string;
  appointmentId?: string;
  medications: CreatePrescriptionMedication[];
  instructions?: string;
}

export interface CreatePrescriptionResponse {
  prescription: Prescription;
  summary: {
    medicationCount: number;
    totalAmount: number;
    prescriptionCode: string;
  };
}

export interface PrescriptionHistoryResponse {
  prescriptions: Prescription[];
  summary: PrescriptionSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}