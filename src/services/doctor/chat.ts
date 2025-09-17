import api from '@/types/api';
import type { ChatSession, ChatConversation, ChatMessage } from '@/types/doctor/chat';

class ChatService {
  async testConnection(): Promise<any> {
    try {
      console.log('🧪 Testing chat API connection...');
      const response = await api.get('/api/web/doctor/chat/test');
      console.log('✅ Chat test connection successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Chat test connection failed:', error);
      
      // Test alternative endpoint
      try {
        console.log('🔄 Testing alternative endpoint...');
        const altResponse = await api.get('/api/web/doctor/consultations/pending');
        console.log('✅ Alternative endpoint working:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('❌ Alternative endpoint also failed:', altError);
        throw error;
      }
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
      console.log('📱 Getting active chat sessions...');
      const response = await api.get('/api/web/doctor/chat/sessions');
      console.log('✅ Active sessions response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Get active sessions error:', error);
      
      // Log detailed error info
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      
      throw error;
    }
  }

  async getConversation(consultationId: string): Promise<ChatConversation> {
    try {
      console.log('💬 Getting conversation for:', consultationId);
      const response = await api.get(`/api/web/doctor/chat/conversation/${consultationId}`);
      console.log('✅ Conversation response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Get conversation error:', error);
      throw error;
    }
  }

  async sendMessage(consultationId: string, data: {
    message?: string;
    type?: string;
    attachments?: any[];
  }): Promise<ChatMessage> {
    try {
      console.log('📤 Sending message to:', consultationId, data);
      const response = await api.post(`/api/web/doctor/chat/conversation/${consultationId}/message`, data);
      console.log('✅ Message sent:', response.data);
      return response.data.data.message;
    } catch (error: any) {
      console.error('❌ Send message error:', error);
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