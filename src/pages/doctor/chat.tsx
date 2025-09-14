import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatSessionList } from '@/components/doctor/chat/ChatSessionList';
import { ChatConversation } from '@/components/doctor/chat/ChatConversation';

interface ChatSession {
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

export default function DoctorChatPage() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar - Chat Sessions */}
      <div className="w-1/3 min-w-[320px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <ChatSessionList 
          onSelectSession={handleSelectSession}
          selectedSessionId={selectedSession?.consultationId}
        />
      </div>

      {/* Main Area - Chat Conversation */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        {selectedSession ? (
          <ChatConversation consultationId={selectedSession.consultationId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            <div className="text-center px-6">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Konsultasi Chat Online
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Pilih sesi chat di sidebar untuk memulai percakapan dengan pasien. 
                Chat akan tersinkronisasi secara real-time.
              </p>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Fitur Chat:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Real-time messaging</li>
                  <li>• Prioritas berdasarkan urgensi</li>
                  <li>• Riwayat AI analysis pasien</li>
                  <li>• Opsi selesaikan konsultasi</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}