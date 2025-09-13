import api from '@/types/api';
import type { 
  Queue, 
  TodayQueueResponse, 
  CallNextPatientResponse, 
  CompleteConsultationRequest 
} from '@/types/doctor/queue';

class QueueService {
  // Get today's queue overview
  async getTodayQueue(): Promise<TodayQueueResponse> {
    const response = await api.get('/api/web/doctor/queue/today');
    return response.data.data;
  }

  // Get active queue (current patient)
  async getActiveQueue(): Promise<{ activeQueue: Queue | null; isOnDuty: boolean }> {
    const response = await api.get('/api/web/doctor/queue/active');
    return response.data.data;
  }

  // Get waiting queues
  async getWaitingQueues(): Promise<{ waitingQueues: Queue[]; total: number }> {
    const response = await api.get('/api/web/doctor/queue/waiting');
    return response.data.data;
  }

  // Get queue history
  async getQueueHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    queues: Queue[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/api/web/doctor/queue/history', { params });
    return response.data.data;
  }

  // Call next patient
  async callNextPatient(): Promise<CallNextPatientResponse> {
    const response = await api.post('/api/web/doctor/queue/call-next');
    return response.data.data;
  }

  // Complete consultation
  async completeConsultation(data: CompleteConsultationRequest): Promise<{
    completedQueue: Queue;
    medicalRecordCreated: boolean;
    prescriptionCreated: boolean;
  }> {
    const response = await api.post('/api/web/doctor/queue/complete', data);
    return response.data.data;
  }

  // Skip patient
  async skipPatient(queueId: string, reason?: string): Promise<void> {
    await api.post('/api/web/doctor/queue/skip', { queueId, reason });
  }
}

export const queueService = new QueueService();