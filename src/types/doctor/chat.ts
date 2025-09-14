export interface ChatSession {
  consultationId: string;
  patient: {
    id: string;
    fullName: string;
    profilePicture?: string;
    nik: string;
  };
  severity: string;
  urgency: string;
  symptoms: any;
  aiAnalysis: any;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
    timeAgo: string;
  };
  responseStatus: 'normal' | 'warning' | 'urgent' | 'overdue';
  timeToRespond: number;
  startedAt: string;
  lastActivity: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  type: string;
  attachments?: any[];
  timestamp: string;
  timeAgo: string;
  isFromDoctor: boolean;
  isRead: boolean;
}

export interface ChatConversation {
  consultationId: string;
  patient: {
    id: string;
    fullName: string;
    profilePicture?: string;
    nik: string;
    gender: string;
    age?: number;
    phone?: string;
  };
  chatInfo: {
    severity: string;
    urgency: string;
    symptoms: any;
    aiAnalysis: any;
    consultationFee: number;
    startedAt: string;
    lastActivity: string;
  };
  messages: ChatMessage[];
  doctorNotes?: string;
  recommendation?: string;
  isCompleted: boolean;
}