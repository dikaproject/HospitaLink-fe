export interface DoctorProfile {
  licenseNumber: string;
  name: string;
  specialty: string;
  consultationFee: number | null;
  isAvailable: boolean;
  isOnDuty: boolean;
  bio: string | null;
  schedule: any | null;
}

export interface Doctor {
  id: string;
  email: string;
  fullName: string;
  nik: string | null;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  dateOfBirth: string | null;
  profilePicture: string | null;
  isActive: boolean;
  emailVerified: boolean;
  street: string | null;
  village: string | null;
  district: string | null;
  regency: string | null;
  province: string | null;
  createdAt: string;
  updatedAt: string;
  doctorProfile: DoctorProfile | null;
}

export interface DoctorListItem {
  id: string;
  fullName: string;
  email: string;
  nik: string | null;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  doctorProfile: {
    licenseNumber: string;
    specialty: string;
    consultationFee: number | null;
    isAvailable: boolean;
    isOnDuty: boolean;
  } | null;
}

export interface DoctorSearchResult {
  id: string;
  fullName: string;
  nik: string | null;
  phone: string | null;
  email: string;
  doctorProfile: {
    specialty: string;
    licenseNumber: string;
  } | null;
}

export interface DoctorPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DoctorResponse {
  success: boolean;
  message: string;
  data: {
    doctors: DoctorListItem[];
    pagination: DoctorPagination;
  };
}

export interface DoctorDetailResponse {
  success: boolean;
  message: string;
  data: Doctor;
}

export interface DoctorSearchResponse {
  success: boolean;
  message: string;
  data: DoctorSearchResult[];
}

export interface CreateDoctorData {
  email: string;
  password: string;
  fullName: string;
  nik?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  street?: string;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  licenseNumber: string;
  specialty: string;
  consultationFee?: number;
  bio?: string;
  schedule?: any;
}

export interface UpdateDoctorData {
  fullName?: string;
  nik?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  street?: string;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  licenseNumber?: string;
  specialty?: string;
  consultationFee?: number;
  bio?: string;
  schedule?: any;
  isAvailable?: boolean;
  isOnDuty?: boolean;
}