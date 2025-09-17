import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, User, Clock, AlertTriangle, FileText, X, MessageCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { chatService } from '@/services/doctor/chat';

interface Message {
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

interface Patient {
  id: string;
  fullName: string;
  profilePicture?: string;
  nik: string;
  gender: string;
  age?: number;
  phone?: string;
}

interface ChatInfo {
  severity: string;
  urgency: string;
  symptoms: any;
  aiAnalysis: any;
  consultationFee: number;
  startedAt: string;
  lastActivity: string;
}

interface ChatConversationProps {
  consultationId: string;
}

export function ChatConversation({ consultationId }: ChatConversationProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consultationId) {
      loadConversation();
    }
  }, [consultationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💬 Loading conversation for:', consultationId);
      
      // Use the proper service instead of direct fetch
      const data = await chatService.getConversation(consultationId);
      
      console.log('✅ Conversation loaded:', data);
      
      setPatient(data.patient);
      setChatInfo(data.chatInfo);
      setMessages(data.messages || []);
      
    } catch (error: any) {
      console.error('❌ Load conversation error:', error);
      
      let errorMessage = 'Gagal memuat percakapan';
      
      if (error.response?.status === 404) {
        errorMessage = 'Konsultasi tidak ditemukan';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi login telah berakhir';
        // Redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth';
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      
      console.log('📤 Sending message to:', consultationId);
      
      // Use the proper service
      const sentMessage = await chatService.sendMessage(consultationId, {
        message: newMessage,
        type: 'text'
      });
      
      console.log('✅ Message sent:', sentMessage);
      
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      toast.success('Pesan terkirim');
      
    } catch (error: any) {
      console.error('❌ Send message error:', error);
      
      let errorMessage = 'Gagal mengirim pesan';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'URGENT': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Memuat percakapan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            {error}
          </p>
          <Button onClick={loadConversation} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!patient || !chatInfo) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Konsultasi Chat Online
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Pilih sesi chat di sidebar untuk memulai percakapan dengan pasien
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {patient.profilePicture ? (
                <img 
                  src={patient.profilePicture} 
                  alt={patient.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{patient.fullName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {patient.gender} • {patient.age ? `${patient.age} tahun` : 'Usia tidak diketahui'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getUrgencyColor(chatInfo.urgency)}>
              {chatInfo.urgency === 'EMERGENCY' ? 'Emergency' :
               chatInfo.urgency === 'URGENT' ? 'Urgent' : 'Normal'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <FileText className="w-4 h-4 mr-1" />
              Selesaikan Konsultasi
            </Button>
          </div>
        </div>

        {/* Patient Info & AI Analysis */}
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>NIK:</strong> {patient.nik}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Telepon:</strong> {patient.phone || 'Tidak tersedia'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Severity:</strong> {chatInfo.severity}
              </p>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300"><strong>Keluhan:</strong></p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(chatInfo.symptoms) ? 
                  chatInfo.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                      {symptom}
                    </Badge>
                  )) : 
                  <span className="text-gray-600 dark:text-gray-400">Tidak ada data keluhan</span>
                }
              </div>
            </div>
          </div>
          
          {chatInfo.aiAnalysis && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>AI Analysis:</strong> {chatInfo.aiAnalysis.message || 'No AI analysis available'}
                {chatInfo.aiAnalysis.confidence && (
                  <span className="ml-2">
                    (Confidence: {Math.round(chatInfo.aiAnalysis.confidence * 100)}%)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada percakapan</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Mulai percakapan dengan mengirim pesan pertama
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isFromDoctor ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.isFromDoctor
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : message.sender === 'SYSTEM'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
              >
                {message.sender !== 'SYSTEM' && (
                  <div className={`text-xs mb-1 ${
                    message.isFromDoctor 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.senderName} • {formatTime(message.timestamp)}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.message}</div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className={`text-xs ${
                        message.isFromDoctor ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        📎 {attachment.name}
                      </div>
                    ))}
                  </div>
                )}
                <div className={`text-xs mt-1 ${
                  message.isFromDoctor 
                    ? 'text-blue-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timeAgo}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan untuk pasien..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
          />
          <Button 
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm"
          >
            {sending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Complete Consultation Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Selesaikan Konsultasi
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleteDialog(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Fitur penyelesaian konsultasi dengan opsi resep digital, rujukan, atau follow-up akan segera tersedia.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCompleteDialog(false)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Tutup
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                onClick={() => {
                  // TODO: Implement completion logic
                  toast.info('Fitur akan segera tersedia');
                  setShowCompleteDialog(false);
                }}
              >
                Selesaikan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}