import api from '@/types/api';
import type { Patient } from '@/types/admin/patientCard';

export interface PatientCardPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PatientCardResponse {
  success: boolean;
  message: string;
  data: Patient[];
  pagination?: PatientCardPagination;
  error?: string;
}

export interface PatientCardDetailResponse {
  success: boolean;
  message: string;
  data: Patient;
  error?: string;
}

class PatientCardService {
  async getCards(
    page: number = 1,
    limit: number = 50,
    search: string = '',
    gender: string = 'ALL',
    isActive: string = 'ALL'
  ): Promise<PatientCardResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(gender !== 'ALL' && { gender }),
        ...(isActive !== 'ALL' && { isActive: isActive === 'ACTIVE' ? 'true' : 'false' }),
      });

      const response = await api.get(`/api/web/admin/cards?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async getCardById(id: string): Promise<PatientCardDetailResponse> {
    try {
      const response = await api.get(`/api/web/admin/cards/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async downloadCard(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/api/web/admin/cards/${id}/download`, {
        responseType: 'blob', // Important for PDF download
      });
      return response.data;
    } catch (error: any) {
      console.error('Download service error:', error);
      throw error;
    }
  }

  // Helper method to trigger download in browser
  downloadPdfFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const patientCardService = new PatientCardService();
export default patientCardService;