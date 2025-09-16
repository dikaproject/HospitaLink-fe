// Base types matching Prisma User schema
export type Gender = "MALE" | "FEMALE"

export type Role = "USER" | "PATIENT" | "DOCTOR" | "ADMIN" | "FAMILY_MEMBER"

export type FamilyRelation = "SELF" | "SPOUSE" | "CHILD" | "PARENT" | "GRANDPARENT" | "SIBLING" | "OTHER"

export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type QueueStatus = "WAITING" | "CALLED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type PaymentStatus = "PENDING" | "PAID" | "FAILED"

export type PaymentMethod = "CASH" | "BPJS" | "INSURANCE" | "CREDIT_CARD"

export type NotificationType = "QUEUE" | "APPOINTMENT" | "LAB_RESULT" | "PAYMENT" | "SYSTEM" | "CONSULTATION"

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW"

// Patient types based on Prisma User model
export interface Patient {
  id: string
  email: string
  role: Role
  nik?: string | null
  fullName: string
  phone?: string | null
  gender?: Gender | null
  dateOfBirth?: string | null
  qrCode?: string | null
  fingerprintData?: string | null
  profilePicture?: string | null
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string | null
  createdAt: string
  updatedAt: string
  // Address fields
  street?: string | null
  village?: string | null
  district?: string | null
  regency?: string | null
  province?: string | null
  // Relations (for detailed view)
  familyMembers?: FamilyMember[]
  familyOf?: FamilyMember[]
  appointments?: Appointment[]
  medicalRecords?: MedicalRecord[]
  consultations?: Consultation[]
  labResults?: LabResult[]
  prescriptions?: Prescription[]
  queues?: Queue[]
  notifications?: Notification[]
}

// Related types for nested data
export interface FamilyMember {
  id: string
  userId: string
  memberId: string
  relation: FamilyRelation
  nickname?: string | null
  isEmergencyContact: boolean
  isActive: boolean
  addedAt: string
  member?: {
    id: string
    fullName: string
    email: string
    phone?: string | null
    gender?: Gender | null
    dateOfBirth?: string | null
    profilePicture?: string | null
  }
  user?: {
    id: string
    fullName: string
    email: string
    phone?: string | null
  }
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  phone?: string | null
  email?: string | null
  consultationFee?: number | null
  licenseNumber?: string
  isAvailable?: boolean
  isOnDuty?: boolean
}

export interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  type: string
  status: AppointmentStatus
  reason?: string | null
  notes?: string | null
  queueNumber?: string | null
  rating?: number | null
  feedback?: string | null
  createdAt: string
  updatedAt: string
  doctor?: Doctor
  prescriptions?: Prescription[]
  queue?: Queue | null
}

export interface MedicalRecord {
  id: string
  visitDate: string
  queueNumber?: string | null
  diagnosis: string
  treatment: string
  symptoms?: Record<string, unknown> | null
  vitalSigns?: Record<string, unknown> | null
  medications?: Record<string, unknown> | null
  followUpDate?: string | null
  totalCost?: number | null
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  notes?: string | null
  createdAt: string
  updatedAt: string
  doctor?: Doctor
  consultation?: {
    id: string
    type: string
    severity?: string | null
    urgency?: string | null
    symptoms: Record<string, unknown>
    aiAnalysis?: Record<string, unknown> | null
  }
  labResults?: LabResult[]
}

export interface Consultation {
  id: string
  type: string
  severity?: string | null
  urgency?: string | null
  symptoms: Record<string, unknown>
  aiAnalysis?: Record<string, unknown> | null
  chatHistory?: Record<string, unknown> | null
  doctorNotes?: string | null
  recommendation?: string | null
  prescriptions?: Record<string, unknown> | null
  followUpDate?: string | null
  consultationFee?: number | null
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  isCompleted: boolean
  rating?: number | null
  feedback?: string | null
  createdAt: string
  updatedAt: string
  doctor?: Doctor
  appointment?: {
    id: string
    appointmentDate: string
    startTime: string
    endTime: string
  }
  digitalPrescriptions?: Prescription[]
}

export interface LabResult {
  id: string
  testName: string
  testType: string
  category?: string | null
  results: Record<string, unknown>
  normalRange?: Record<string, unknown> | null
  isNormal?: boolean | null
  isCritical: boolean
  doctorNotes?: string | null
  testDate: string
  resultDate?: string | null
  isNew: boolean
  reportUrl?: string | null
  createdAt: string
  updatedAt: string
  medicalRecord?: {
    id: string
    visitDate: string
    diagnosis: string
  }
}

export interface Prescription {
  id: string
  prescriptionCode: string
  medications: Record<string, unknown>
  instructions?: string | null
  totalAmount?: number | null
  pharmacyNotes?: string | null
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  isPaid: boolean
  isDispensed: boolean
  dispensedAt?: string | null
  dispensedBy?: string | null
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
  doctor?: Doctor
  consultation?: {
    id: string
    type: string
    createdAt: string
  }
  appointment?: {
    id: string
    appointmentDate: string
  }
}

export interface Queue {
  id: string
  queueNumber: string
  queueType: string
  currentNumber?: string | null
  status: QueueStatus
  position: number
  estimatedWaitTime?: number | null
  checkInTime?: string | null
  calledTime?: string | null
  completedTime?: string | null
  isPriority: boolean
  queueDate: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  doctor?: Doctor
  appointment?: {
    id: string
    appointmentDate: string
  }
}

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  actionUrl?: string | null
  relatedData?: Record<string, unknown> | null
  expiresAt?: string | null
  createdAt: string
  readAt?: string | null
}

// Form types - Fixed to match backend expectations
export interface PatientFormValues {
  id?: string
  email: string
  password: string // Added password for create operations
  fullName: string
  phone?: string
  nik?: string
  gender?: Gender
  dateOfBirth?: string
  street?: string
  village?: string
  district?: string
  regency?: string
  province?: string
}

// Create type - make sure it matches backend expectations
export interface PatientCreate {
  email: string           // Required
  password: string        // Required - must meet complexity requirements
  fullName: string        // Required - only letters, spaces, dots, hyphens
  phone?: string | null   // Optional - Indonesian format: 08xxxxxxxxx
  nik?: string | null     // Optional - exactly 16 digits
  gender?: Gender | null  // Optional - MALE or FEMALE
  dateOfBirth?: string | null // Optional - ISO date string (backend converts to DateTime)
  street?: string | null  // Optional - max 200 chars
  village?: string | null // Optional - max 100 chars
  district?: string | null // Optional - max 100 chars
  regency?: string | null  // Optional - max 100 chars
  province?: string | null // Optional - max 100 chars
}

// Update type - password not needed for updates
export interface PatientUpdate {
  fullName?: string
  phone?: string | null
  nik?: string | null
  gender?: Gender | null
  dateOfBirth?: string | null
  street?: string | null
  village?: string | null
  district?: string | null
  regency?: string | null
  province?: string | null
  isActive?: boolean
}

// API Query types
export interface PatientSearchQuery {
  page?: number
  limit?: number
  search?: string
  gender?: Gender
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PatientFilterOptions {
  gender?: Gender
  isActive?: boolean
  sortBy?: 'fullName' | 'createdAt' | 'updatedAt' | 'email'
  sortOrder?: 'asc' | 'desc'
  dateRange?: {
    start: string
    end: string
  }
}

// API Response types - Fixed to handle both success and error states
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
}

// Update response types to use union properly
export type PatientCreateResponse = ApiSuccessResponse<{ patient: Patient }> | ApiErrorResponse
export type PatientUpdateResponse = ApiSuccessResponse<{ patient: Patient }> | ApiErrorResponse
export type PatientDeleteResponse = ApiSuccessResponse<{ patientId: string }> | ApiErrorResponse

// Also fix the general ApiResponse type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Statistics types
export interface PatientStats {
  total: number
  male: number
  female: number
  active: number
  inactive: number
  recentAdded: number
  withAppointments: number
  withMedicalRecords: number
}

// List item type for table views
export type PatientListItem = Pick<Patient, 'id' | 'fullName' | 'email' | 'nik' | 'gender' | 'phone' | 'isActive' | 'createdAt'>

// Pagination interface
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalRecords: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

// Patient summary for detailed view
export interface PatientSummary {
  totalAppointments: number
  completedAppointments: number
  totalConsultations: number
  totalMedicalRecords: number
  totalLabResults: number
  totalPrescriptions: number
  unreadNotifications: number
  lastVisit?: string | null
  lastAppointment?: string | null
}

// List response type
export interface PatientListResponse {
  success: boolean
  data: {
    patients: Patient[]
    pagination: PaginationInfo
  }
  message?: string
  error?: string
}

// Detail response type
export interface PatientDetailResponse {
  success: boolean
  data?: {
    patient: Patient
    summary: PatientSummary
  }
  message?: string
  error?: string
}

// Service response type (for stats)
export interface PatientServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
