// Update: hospitalink-fe/src/components/doctor/chat/ChatSessionList.tsx
import { useState, useEffect } from 'react';
import { MessageCircle, Clock, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { chatService } from '@/services/doctor/chat';
import type { ChatSession } from '@/types/doctor/chat';

interface ChatSessionListProps {
  onSelectSession: (session: ChatSession) => void;
  selectedSessionId?: string;
}

export function ChatSessionList({ onSelectSession, selectedSessionId }: ChatSessionListProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    emergency: 0,
    urgent: 0,
    normal: 0,
    needsResponse: 0
  });
  const [doctorInfo, setDoctorInfo] = useState<{
    specialty: string;
    consultationType: string;
  } | null>(null);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('Testing API connection...');
      await chatService.testConnection();
      console.log('Connection test successful');

      console.log('Loading chat sessions...');
      const data = await chatService.getActiveSessions();
      
      setSessions(data.sessions || []);
      setSummary(data.summary || {
        emergency: 0,
        urgent: 0,
        normal: 0,
        needsResponse: 0
      });
      setDoctorInfo(data.doctorInfo || null);

      console.log('Sessions loaded successfully:', data.sessions?.length || 0);

    } catch (error: any) {
      console.error('Load sessions error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Server may not be running on port 5000.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        localStorage.removeItem('token');
        window.location.href = '/auth';
        return;
      } else if (error.response?.status === 404) {
        errorMessage = 'Chat API endpoints not found. Check server routes.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server internal error. Check server logs.';
      } else if (error.message?.includes('<!doctype') || error.message?.includes('<html')) {
        errorMessage = 'Server returned HTML instead of JSON. API endpoint may be incorrect.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'URGENT': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 dark:text-red-400';
      case 'urgent': return 'text-orange-600 dark:text-orange-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.patient?.nik?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Chat Sessions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm max-w-md mx-auto">
            {error}
          </p>
          <div className="space-y-2">
            <Button onClick={loadSessions} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <strong>Debugging steps:</strong>
              <ul className="mt-1 space-y-1 text-left">
                <li>1. Check if backend server is running</li>
                <li>2. Verify port 5000 is accessible</li>
                <li>3. Check browser Network tab for request URL</li>
                <li>4. Verify authentication token exists</li>
                <li>5. Check server console logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Chat Konsultasi
          </h2>
          {doctorInfo && (
            <Badge variant="outline" className="text-xs">
              {doctorInfo.specialty}
            </Badge>
          )}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{summary.emergency}</div>
            <div className="text-xs text-red-500 dark:text-red-400">Emergency</div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{summary.urgent}</div>
            <div className="text-xs text-orange-500 dark:text-orange-400">Urgent</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.normal}</div>
            <div className="text-xs text-blue-500 dark:text-blue-400">Normal</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{summary.needsResponse}</div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400">Perlu Respon</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pasien..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="mb-2">
              {sessions.length === 0 ? 'Tidak ada sesi chat aktif' : 'Tidak ada hasil pencarian'}
            </p>
            {doctorInfo && (
              <p className="text-sm">
                Menampilkan chat untuk dokter {doctorInfo.specialty}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredSessions.map((session) => (
              <Card
                key={session.consultationId}
                className={`cursor-pointer hover:shadow-md dark:hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                  selectedSessionId === session.consultationId 
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md dark:shadow-blue-500/25' 
                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => onSelectSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      {session.patient?.profilePicture ? (
                        <img 
                          src={session.patient.profilePicture} 
                          alt={session.patient.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {session.patient?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {session.patient?.fullName || 'Unknown Patient'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getUrgencyColor(session.urgency)}>
                            {session.urgency === 'EMERGENCY' ? 'Emergency' :
                             session.urgency === 'URGENT' ? 'Urgent' : 'Normal'}
                          </Badge>
                          {session.responseStatus !== 'normal' && (
                            <Clock className={`w-4 h-4 ${getResponseStatusColor(session.responseStatus)}`} />
                          )}
                        </div>
                      </div>

                      {session.lastMessage && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            <span className="font-medium">
                              {session.lastMessage.sender === 'DOCTOR' ? 'Anda: ' : 'Pasien: '}
                            </span>
                            {session.lastMessage.content}
                          </p>
                        </div>
                      )}

                      <div className="mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Severity: <span className="font-medium text-gray-700 dark:text-gray-300">{session.severity}</span>
                          {session.aiAnalysis?.confidence && (
                            <span className="ml-2">
                              Confidence: {Math.round(session.aiAnalysis.confidence * 100)}%
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>NIK: {session.patient?.nik || 'N/A'}</span>
                        <span className={getResponseStatusColor(session.responseStatus)}>
                          {session.lastMessage ? session.lastMessage.timeAgo : 
                           `Menunggu ${session.timeToRespond} menit`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" 
          onClick={loadSessions}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh ({sessions.length} sesi aktif)
        </Button>
      </div>
    </div>
  );
}