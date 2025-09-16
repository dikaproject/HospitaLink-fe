import api from '@/types/api';
import type {
  QueueResponse,
  QueueDetailResponse,
  QueuePagination,
} from '@/types/admin/queue';

export const queueService = {
  // Get all queues with pagination and filters
  getQueues: async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = 'ALL',
    doctorId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<QueueResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status !== 'ALL' && { status }),
      ...(doctorId && { doctorId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await api.get(`/api/web/admin/queue?${params}`);
    return response.data;
  },

  // Get queue by ID
  getQueueById: async (id: string): Promise<QueueDetailResponse> => {
    try {
      console.log('Fetching queue with ID from service:', id);
      const response = await api.get(`/api/web/admin/queue/${id}`);
      console.log('Service response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Service error:', error);
      throw error;
    }
  },

  // Get queue history (completed queues)
  getQueueHistory: async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    doctorId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<QueueResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(doctorId && { doctorId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await api.get(`/api/web/admin/queue/history?${params}`);
    return response.data;
  },

  // Get today's queues
  getTodayQueues: async () => {
    const response = await api.get('/api/web/admin/queue/today');
    return response.data;
  },

  // Get queue analytics
  getQueueAnalytics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await api.get(`/api/web/admin/queue/analytics?${params}`);
    return response.data;
  },

  // Call patient (change status from WAITING to CALLED)
  callPatient: async (queueId: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await api.patch(`/api/web/admin/queue/${queueId}/call`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Start consultation (change status from CALLED to IN_PROGRESS)
  startConsultation: async (queueId: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await api.patch(`/api/web/admin/queue/${queueId}/start`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Complete consultation (change status to COMPLETED)
  completeConsultation: async (queueId: string, notes?: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await api.patch(`/api/web/admin/queue/${queueId}/complete`, { notes });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Cancel queue (change status to CANCELLED)
  cancelQueue: async (queueId: string, reason?: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await api.patch(`/api/web/admin/queue/${queueId}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default queueService;