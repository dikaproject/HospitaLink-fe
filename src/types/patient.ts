// Base types
export type Gender = "L" | "P"

export type PatientFormValues = {
  id?: string
  name: string
  nik: string
  birthDate: string
  gender: Gender
  phone: string
  address: string
}

export type Patient = {
  id: string
  name: string
  nik: string
  birthDate: string
  gender: Gender
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

// Extended types for different use cases
export type PatientListItem = Pick<Patient, 'id' | 'name' | 'nik' | 'gender' | 'phone'>

export type PatientDetail = Patient

export type PatientCreate = Omit<PatientFormValues, 'id'>

export type PatientUpdate = PatientFormValues & { id: string }

// Search and filter types
export type PatientSearchQuery = {
  query: string
  gender?: Gender
  limit?: number
}

export type PatientFilterOptions = {
  gender?: Gender
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// Response types for service operations
export type PatientServiceResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PatientListResponse = PatientServiceResponse<Patient[]>
export type PatientDetailResponse = PatientServiceResponse<Patient>
export type PatientCreateResponse = PatientServiceResponse<Patient>
export type PatientUpdateResponse = PatientServiceResponse<Patient>
export type PatientDeleteResponse = PatientServiceResponse<boolean>

// Statistics types
export type PatientStats = {
  total: number
  male: number
  female: number
  recentAdded: number
}

// All types are already exported above
