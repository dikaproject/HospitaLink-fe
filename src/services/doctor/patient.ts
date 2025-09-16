import api from '@/types/api';

export interface Patient {
  id: string;
  fullName: string;
  nik?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  email?: string;
  age?: number;
  dateOfBirth?: string;
  registeredAt?: string;
}

export interface PatientSearchResponse {
  success: boolean;
  message: string;
  data: Patient[];
  total: number;
  query?: string;
}

export interface PatientsResponse {
  success: boolean;
  message: string;
  data: Patient[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class PatientService {
  // Get doctor's patients (from consultations/appointments)
  async getPatients(): Promise<PatientsResponse> {
    try {
      const response = await api.get('/api/web/doctor/patients');
      return response.data;
    } catch (error) {
      console.error('Get patients error:', error);
      throw error;
    }
  }

  // Search patients
  async searchPatients(query: string, limit?: number): Promise<PatientSearchResponse> {
    try {
      const params: any = { q: query };
      if (limit) params.limit = limit;

      const response = await api.get('/api/web/doctor/patients/search', { params });
      return response.data;
    } catch (error) {
      console.error('Search patients error:', error);
      throw error;
    }
  }

  // Get all patients (for admin purposes)
  async getAllPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PatientsResponse> {
    try {
      const response = await api.get('/api/web/doctor/patients/all', { params });
      return response.data;
    } catch (error) {
      console.error('Get all patients error:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async getAll(): Promise<PatientsResponse> {
    return this.getPatients();
  }
}

export const patientService = new PatientService();