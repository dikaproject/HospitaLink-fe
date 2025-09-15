import api from '@/types/api';
import type { 
  AdminPrescription,
  SearchMedicationsResponse,
  Medication,
  MedicationCategory,
  UpdatePaymentRequest,
  DispensePrescriptionRequest,
  PrescriptionHistoryResponse
} from '@/types/admin/prescription';

class AdminPrescriptionService {
  // Search medications for prescription
  async searchMedications(query: string, category?: string, limit?: number): Promise<SearchMedicationsResponse> {
    const params: any = { q: query };
    if (category) params.category = category;
    if (limit) params.limit = limit;
    
    const response = await api.get('/api/web/admin/prescriptions/search-medications', { params });
    return response.data.data;
  }

  // Get medication categories
  async getMedicationCategories(): Promise<MedicationCategory[]> {
    const response = await api.get('/api/web/admin/prescriptions/medication-categories');
    return response.data.data;
  }

  // Get medication detail
  async getMedicationDetail(id: string): Promise<Medication> {
    const response = await api.get(`/api/web/admin/prescriptions/medication/${id}`);
    return response.data.data;
  }

  // Get prescription detail by code - Main feature requested
  async getPrescriptionByCode(code: string): Promise<AdminPrescription> {
    const response = await api.get(`/api/web/admin/prescriptions/code/${code}`);
    return response.data.data;
  }

  // Get prescription detail by ID
  async getPrescriptionById(id: string): Promise<AdminPrescription> {
    const response = await api.get(`/api/web/admin/prescriptions/${id}`);
    return response.data.data;
  }

  // Update prescription payment status
  async updatePrescriptionPayment(id: string, data: UpdatePaymentRequest): Promise<AdminPrescription> {
    const response = await api.put(`/api/web/admin/prescriptions/${id}/payment`, data);
    return response.data.data;
  }

  // Mark prescription as dispensed
  async dispensePrescription(id: string, data: DispensePrescriptionRequest): Promise<AdminPrescription> {
    const response = await api.put(`/api/web/admin/prescriptions/${id}/dispense`, data);
    return response.data.data;
  }

  // Get prescription history with filters
  async getPrescriptionHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    paymentStatus?: string;
    isDispensed?: boolean;
  }): Promise<PrescriptionHistoryResponse> {
    const response = await api.get('/api/web/admin/prescriptions', { params });
    return response.data.data;
  }
}

export const adminPrescriptionService = new AdminPrescriptionService();