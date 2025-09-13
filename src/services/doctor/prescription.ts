import api from '@/types/api';
import type { 
  Prescription,
  TodayPrescriptionsResponse,
  CreatePrescriptionRequest,
  CreatePrescriptionResponse,
  PrescriptionHistoryResponse,
  Medication,
  MedicationCategory
} from '@/types/doctor/prescription';

class PrescriptionService {
  // Search medications for prescription
  async searchMedications(query: string, category?: string, limit?: number): Promise<{
    medications: Medication[];
    query: string;
    total: number;
  }> {
    const params: any = { q: query };
    if (category) params.category = category;
    if (limit) params.limit = limit;
    
    const response = await api.get('/api/web/doctor/prescriptions/medications/search', { params });
    return response.data.data;
  }

  // Get medication categories
  async getMedicationCategories(): Promise<MedicationCategory[]> {
    const response = await api.get('/api/web/doctor/prescriptions/medications/categories');
    return response.data.data;
  }

  // Get medication detail
  async getMedicationDetail(id: string): Promise<Medication> {
    const response = await api.get(`/api/web/doctor/prescriptions/medications/${id}`);
    return response.data.data;
  }

  // Get today's prescriptions
  async getTodayPrescriptions(): Promise<TodayPrescriptionsResponse> {
    const response = await api.get('/api/web/doctor/prescriptions/today');
    return response.data.data;
  }

  // Get prescription history
  async getPrescriptionHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<PrescriptionHistoryResponse> {
    const response = await api.get('/api/web/doctor/prescriptions/history', { params });
    return response.data.data;
  }

  // Get prescription detail
  async getPrescriptionDetail(id: string): Promise<Prescription> {
    const response = await api.get(`/api/web/doctor/prescriptions/${id}`);
    return response.data.data;
  }

  // Create new prescription
  async createPrescription(data: CreatePrescriptionRequest): Promise<CreatePrescriptionResponse> {
    const response = await api.post('/api/web/doctor/prescriptions', data);
    return response.data.data;
  }
}

export const prescriptionService = new PrescriptionService();