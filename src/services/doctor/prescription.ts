import api from '@/types/api';
import type { 
  Prescription,
  TodayPrescriptionsResponse,
  CreatePrescriptionRequest,
  PrescriptionHistoryResponse,
  PrescriptionSummary
} from '@/types/doctor/prescription';

class PrescriptionService {
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
  }): Promise<{
    prescriptions: Prescription[];
    summary: PrescriptionSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/api/web/doctor/prescriptions/history', { params });
    return response.data.data;
  }

  // Get prescription detail
  async getPrescriptionDetail(id: string): Promise<Prescription> {
    const response = await api.get(`/api/web/doctor/prescriptions/${id}`);
    return response.data.data;
  }

  // Create new prescription
  async createPrescription(data: CreatePrescriptionRequest): Promise<Prescription> {
    const response = await api.post('/api/web/doctor/prescriptions', data);
    return response.data.data;
  }
}

export const prescriptionService = new PrescriptionService();