export interface PrescriptionUser {
  id?: string;
  fullName: string;
  phone?: string;
  nik?: string;
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
  symptoms?: any;
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

// Backend response format for prescription medication
export interface PrescriptionMedication {
  form: string;
  name: string;
  price: number;
  duration: string;
  quantity: number;
  strength: string;
  frequency: string;
  instructions: string;
}

export interface AdminPrescription {
  id: string;
  userId: string;
  doctorId: string;
  consultationId?: string;
  appointmentId?: string;
  prescriptionCode: string;
  medications: PrescriptionMedication[];
  instructions?: string;
  totalAmount: string;
  pharmacyNotes?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod?: 'CASH' | 'INSURANCE' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  isPaid: boolean;
  isDispensed: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user: PrescriptionUser;
  doctor?: PrescriptionDoctor;
  consultation?: PrescriptionConsultation;
  appointment?: PrescriptionAppointment;
  // Additional admin fields
  isExpired?: boolean;
  daysUntilExpiry?: number;
}

export interface SearchMedicationsResponse {
  medications: Medication[];
  query: string;
  total: number;
}

export interface UpdatePaymentRequest {
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod?: 'CASH' | 'INSURANCE' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  pharmacyNotes?: string;
}

export interface DispensePrescriptionRequest {
  pharmacyNotes?: string;
}

export interface PrescriptionHistoryResponse {
  prescriptions: AdminPrescription[];
  summary?: {
    total: number;
    paid: number;
    dispensed: number;
    pending: number;
    totalValue?: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}