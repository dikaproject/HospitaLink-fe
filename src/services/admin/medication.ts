import api from '@/types/api';
import type {
  Medication,
  MedicationWithStatus,
  CreateMedicationRequest,
  UpdateMedicationRequest,
  UpdateStockRequest,
  MedicationQueryParams,
  MedicationListResponse,
  MedicationResponse,
  MedicationStatisticsResponse,
  LowStockResponse,
  UpdateStockResponseData
} from '@/types/admin/medication';

export interface MedicationPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MedicationErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class MedicationService {
  /**
   * Get all medications with pagination and filtering
   */
  async getMedications(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    category: string = '',
    isActive: string = 'ALL',
    requiresPrescription: string = 'ALL',
    isControlled: string = 'ALL',
    sortBy: string = 'genericName',
    sortOrder: string = 'asc'
  ): Promise<MedicationListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category && { category }),
        ...(isActive !== 'ALL' && { isActive: isActive === 'ACTIVE' ? 'true' : 'false' }),
        ...(requiresPrescription !== 'ALL' && { requiresPrescription: requiresPrescription === 'YES' ? 'true' : 'false' }),
        ...(isControlled !== 'ALL' && { isControlled: isControlled === 'YES' ? 'true' : 'false' }),
        sortBy,
        sortOrder
      });

      const response = await api.get(`/api/web/admin/medications?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Get medications service error:', error);
      throw error;
    }
  }

  /**
   * Get medication by ID
   */
  async getMedicationById(id: string): Promise<MedicationResponse> {
    try {
      const response = await api.get(`/api/web/admin/medications/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get medication by ID service error:', error);
      throw error;
    }
  }

  /**
   * Create new medication
   */
  async createMedication(data: CreateMedicationRequest): Promise<MedicationResponse> {
    try {
      const response = await api.post('/api/web/admin/medications', data);
      return response.data;
    } catch (error: any) {
      console.error('Create medication service error:', error);
      throw error;
    }
  }

  /**
   * Update existing medication
   */
  async updateMedication(id: string, data: UpdateMedicationRequest): Promise<MedicationResponse> {
    try {
      const response = await api.put(`/api/web/admin/medications/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update medication service error:', error);
      throw error;
    }
  }

  /**
   * Delete medication (soft delete by default)
   */
  async deleteMedication(id: string, permanent: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const params = permanent ? '?permanent=true' : '';
      const response = await api.delete(`/api/web/admin/medications/${id}${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete medication service error:', error);
      throw error;
    }
  }

  /**
   * Update medication stock
   */
  async updateMedicationStock(id: string, data: UpdateStockRequest): Promise<UpdateStockResponseData> {
    try {
      const response = await api.patch(`/api/web/admin/medications/${id}/stock`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update medication stock service error:', error);
      throw error;
    }
  }

  /**
   * Get low stock medications
   */
  async getLowStockMedications(): Promise<LowStockResponse> {
    try {
      const response = await api.get('/api/web/admin/medications/low-stock');
      return response.data;
    } catch (error: any) {
      console.error('Get low stock medications service error:', error);
      throw error;
    }
  }

  /**
   * Get medication statistics
   */
  async getMedicationStatistics(): Promise<MedicationStatisticsResponse> {
    try {
      const response = await api.get('/api/web/admin/medications/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Get medication statistics service error:', error);
      throw error;
    }
  }

  /**
   * Search medications by name or code
   */
  async searchMedications(query: string, limit: number = 10): Promise<MedicationWithStatus[]> {
    try {
      const response = await this.getMedications(1, limit, query, '', 'ACTIVE');
      return response.data.medications;
    } catch (error: any) {
      console.error('Search medications service error:', error);
      throw error;
    }
  }

  /**
   * Get medications by category
   */
  async getMedicationsByCategory(
    category: string,
    page: number = 1,
    limit: number = 20,
    search: string = ''
  ): Promise<MedicationListResponse> {
    try {
      return await this.getMedications(page, limit, search, category);
    } catch (error: any) {
      console.error('Get medications by category service error:', error);
      throw error;
    }
  }

  /**
   * Get active medications only
   */
  async getActiveMedications(
    page: number = 1,
    limit: number = 20,
    search: string = ''
  ): Promise<MedicationListResponse> {
    try {
      return await this.getMedications(page, limit, search, '', 'ACTIVE');
    } catch (error: any) {
      console.error('Get active medications service error:', error);
      throw error;
    }
  }

  /**
   * Get prescription-only medications
   */
  async getPrescriptionMedications(
    page: number = 1,
    limit: number = 20,
    search: string = ''
  ): Promise<MedicationListResponse> {
    try {
      return await this.getMedications(page, limit, search, '', 'ALL', 'YES');
    } catch (error: any) {
      console.error('Get prescription medications service error:', error);
      throw error;
    }
  }

  /**
   * Get controlled medications
   */
  async getControlledMedications(
    page: number = 1,
    limit: number = 20,
    search: string = ''
  ): Promise<MedicationListResponse> {
    try {
      return await this.getMedications(page, limit, search, '', 'ALL', 'ALL', 'YES');
    } catch (error: any) {
      console.error('Get controlled medications service error:', error);
      throw error;
    }
  }

  /**
   * Bulk stock update
   */
  async bulkUpdateStock(
    updates: Array<{ id: string; stock: number; operation?: 'set' | 'add' | 'subtract' }>
  ): Promise<UpdateStockResponseData[]> {
    try {
      const promises = updates.map(update =>
        this.updateMedicationStock(update.id, {
          stock: update.stock,
          operation: update.operation || 'set'
        })
      );

      return await Promise.all(promises);
    } catch (error: any) {
      console.error('Bulk update stock service error:', error);
      throw error;
    }
  }

  /**
   * Check if medication code exists
   */
  async checkMedicationCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await this.getMedications(1, 1, code);
      
      const exists = response.data.medications.some(med =>
        med.medicationCode.toLowerCase() === code.toLowerCase() &&
        (!excludeId || med.id !== excludeId)
      );

      return exists;
    } catch (error: any) {
      console.error('Check medication code exists service error:', error);
      return false;
    }
  }

  /**
   * Get medication categories with counts
   */
  async getMedicationCategories(): Promise<Array<{ name: string; count: number }>> {
    try {
      const response = await this.getMedications(1, 1); // Just to get categories
      return response.data.filters.categories;
    } catch (error: any) {
      console.error('Get medication categories service error:', error);
      throw error;
    }
  }

  /**
   * Export medications data
   */
  async exportMedications(
    search: string = '',
    category: string = '',
    isActive: string = 'ALL'
  ): Promise<Blob> {
    try {
      // Get all medications without pagination for export
      const allMedications = await this.getMedications(1, 10000, search, category, isActive);

      // Convert to CSV
      const csvContent = this.convertToCSV(allMedications.data.medications);
      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error: any) {
      console.error('Export medications service error:', error);
      throw error;
    }
  }

  /**
   * Helper method to trigger download in browser
   */
  downloadCsvFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Convert medications to CSV format
   */
  private convertToCSV(medications: MedicationWithStatus[]): string {
    if (medications.length === 0) return '';

    const headers = [
      'Code',
      'Generic Name',
      'Brand Name',
      'Category',
      'Dosage Form',
      'Strength',
      'Unit',
      'Manufacturer',
      'Price per Unit',
      'Stock',
      'Min Stock',
      'Max Stock',
      'Stock Status',
      'Requires Prescription',
      'Is Controlled',
      'Is Active',
      'Created At'
    ];

    const rows = medications.map(med => [
      med.medicationCode,
      med.genericName,
      med.brandName || '',
      med.category,
      med.dosageForm,
      med.strength,
      med.unit,
      med.manufacturer || '',
      med.pricePerUnit,
      med.stock,
      med.minStock,
      med.maxStock,
      med.stockStatus,
      med.requiresPrescription ? 'Yes' : 'No',
      med.isControlled ? 'Yes' : 'No',
      med.isActive ? 'Active' : 'Inactive',
      new Date(med.createdAt).toLocaleDateString()
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }
}

export const medicationService = new MedicationService();
export default medicationService;