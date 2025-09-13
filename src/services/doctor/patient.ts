import api from '@/types/api';

interface Patient {
  id: string;
  fullName: string;
  nik?: string; // Make optional
  phone?: string; // Make optional
  email?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
}

class PatientService {
  async getAll(): Promise<{ success: boolean; data: Patient[] }> {
    try {
      const response = await api.get('/api/web/doctor/patients');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get patients error:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  async search(query: string): Promise<Patient[]> {
    try {
      const response = await api.get('/api/web/doctor/patients/search', {
        params: { q: query }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Search patients error:', error);
      return [];
    }
  }
}

export const patientService = new PatientService();