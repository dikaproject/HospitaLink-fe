import api from '@/types/api';
import type { ChatSession, ChatConversation, ChatMessage } from '@/types/doctor/chat';

class ChatService {
  async testConnection(): Promise<any> {
    try {
      const response = await api.get('/api/web/doctor/chat/test');
      return response.data;
    } catch (error) {
      console.error('Test connection error:', error);
      throw error;
    }
  }

  async getActiveSessions(): Promise<{
    sessions: ChatSession[];
    summary: {
      emergency: number;
      urgent: number;
      normal: number;
      needsResponse: number;
    };
    doctorInfo?: {
      specialty: string;
      consultationType: string;
    };
  }> {
    try {
      const response = await api.get('/api/web/doctor/chat/sessions');
      return response.data.data;
    } catch (error) {
      console.error('Get active sessions error:', error);
      throw error;
    }
  }

  async getConversation(consultationId: string): Promise<ChatConversation> {
    try {
      const response = await api.get(`/api/web/doctor/chat/conversation/${consultationId}`);
      return response.data.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  }

  async sendMessage(consultationId: string, data: {
    message?: string;
    type?: string;
    attachments?: any[];
  }): Promise<ChatMessage> {
    try {
      const response = await api.post(`/api/web/doctor/chat/conversation/${consultationId}/message`, data);
      return response.data.data.message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async completeConsultation(consultationId: string, data: {
    decision: string;
    doctorNotes: string;
    prescriptions?: any[];
    followUpDays?: number;
    referralSpecialty?: string;
    appointmentNeeded?: boolean;
  }): Promise<any> {
    try {
      const response = await api.post(`/api/web/doctor/chat/conversation/${consultationId}/complete`, data);
      return response.data.data;
    } catch (error) {
      console.error('Complete consultation error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();