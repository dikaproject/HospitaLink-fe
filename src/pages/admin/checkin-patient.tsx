import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, Clock, User, Stethoscope, Calendar, ArrowRight, Scan, Zap } from 'lucide-react';

interface QueueData {
  id: string;
  queueNumber: string;
  queueType: string;
  position: number;
  estimatedWaitTime: number;
  user: {
    fullName: string;
    phone: string;
    nik: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
}

interface CheckinResult {
  success: boolean;
  message: string;
  data?: {
    queue: QueueData;
    estimatedTime: string;
    queueType?: string;
  };
}

const CheckinPatient: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<CheckinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Simulate QR code detection
  const detectQRCode = (canvas: HTMLCanvasElement): string | null => {
    // This is a simplified simulation - in real app you'd use a QR detection library
    const patterns = [
      'USER123456789',
      'PATIENT_QR_ABC123',
      'CHECKIN_XYZ789',
    ];
    
    // Simulate random QR detection after a few seconds of scanning
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    return Math.random() > 0.7 ? randomPattern : null;
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start QR detection simulation
        const interval = setInterval(() => {
          if (canvasRef.current && videoRef.current && !loading) {
            const qrCode = detectQRCode(canvasRef.current);
            if (qrCode) {
              clearInterval(interval);
              onScanSuccess(qrCode);
            }
          }
        }, 2000);

        // Cleanup interval when component unmounts
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error('Error starting scanner:', error);
      setCameraPermission('denied');
      setIsScanning(false);
      
      // Show toast-like notification
      const notification = document.createElement('div');
      notification.textContent = 'Gagal memulai scanner. Periksa izin kamera.';
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
  };

  const stopScanning = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log('QR Code detected:', decodedText);
    await stopScanning();
    await processQRCode(decodedText);
  };

  const processQRCode = async (qrCode: string) => {
    setLoading(true);
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: CheckinResult = {
        success: true,
        message: 'Check-in berhasil! Tipe antrian telah diubah menjadi APPOINTMENT',
        data: {
          queue: {
            id: 'queue-123',
            queueNumber: 'A-042',
            queueType: 'APPOINTMENT',
            position: 3,
            estimatedWaitTime: 60,
            user: {
              fullName: 'Dr. Ahmad Pratama',
              phone: '+62 812-3456-7890',
              nik: '3201234567890123'
            },
            doctor: {
              name: 'Dr. Sarah Wijaya, Sp.PD',
              specialty: 'Penyakit Dalam'
            }
          },
          estimatedTime: '1 jam 20 menit',
          queueType: 'APPOINTMENT'
        }
      };

      setScanResult(mockResult);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.textContent = `✅ Check-in berhasil! Tipe: ${mockResult.data?.queueType || 'APPOINTMENT'}`;
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Checkin error:', error);
      const errorResult: CheckinResult = {
        success: false,
        message: 'Terjadi kesalahan saat check-in. Silakan coba lagi.'
      };
      
      setScanResult(errorResult);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.textContent = errorResult.message;
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Scan className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            QR Check-in Scanner
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="text-gray-600 text-lg mb-4">
              Scan QR code pasien untuk mengubah otomatis tipe antrian
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge variant="outline" className="px-3 py-1 bg-white/70 backdrop-blur-sm">
                WALK_IN
              </Badge>
              <ArrowRight className="h-4 w-4 text-orange-500" />
              <Badge className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                APPOINTMENT
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced QR Scanner Section */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-blue-100/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                QR Code Scanner
                {isScanning && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Live</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!isScanning && !scanResult && (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Camera className="h-12 w-12 text-blue-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Zap className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Siap untuk Scan
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Otomatis check-in dengan tipe APPOINTMENT
                    </p>
                    <Button 
                      onClick={startScanning} 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Camera className="h-5 w-5 mr-3" />
                      Mulai Scan QR Code
                    </Button>
                  </div>
                )}

                {isScanning && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-2xl overflow-hidden aspect-square shadow-2xl">
                      <video 
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Scanner overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
                            {/* Corner indicators */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                            
                            {/* Scanning line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={stopScanning} 
                      variant="destructive" 
                      size="lg"
                      className="w-full rounded-xl"
                    >
                      <CameraOff className="h-5 w-5 mr-2" />
                      Berhenti Scan
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Processing Check-in
                    </h3>
                    <p className="text-gray-600">
                      Memproses dan mengubah tipe antrian...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Result Section */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-green-100/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                Hasil Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!scanResult && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Menunggu Scan
                  </h3>
                  <p className="text-gray-500">
                    Hasil check-in akan muncul di sini
                  </p>
                </div>
              )}

              {scanResult && (
                <div className="space-y-6">
                  <Alert className={`border-0 ${scanResult.success ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-pink-50'} rounded-xl`}>
                    <AlertDescription className={`${scanResult.success ? 'text-green-800' : 'text-red-800'} font-medium`}>
                      {scanResult.message}
                    </AlertDescription>
                  </Alert>

                  {scanResult.success && scanResult.data && (
                    <div className="space-y-6">
                      {/* Queue Type Change Indicator */}
                      <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 border border-orange-200 rounded-xl p-6">
                        <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-3">
                          <div className="p-1 bg-orange-500 rounded-lg">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          Perubahan Tipe Antrian
                        </h3>
                        <div className="flex items-center justify-center space-x-4">
                          <Badge variant="outline" className="px-4 py-2 bg-white/70 text-gray-700">
                            WALK_IN
                          </Badge>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-5 w-5 text-orange-600" />
                            <div className="w-8 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                          </div>
                          <Badge className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            {scanResult.data.queue.queueType || 'APPOINTMENT'}
                          </Badge>
                        </div>
                      </div>

                      {/* Queue Information */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-3">
                          <div className="p-1 bg-blue-500 rounded-lg">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          Informasi Antrian
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/70 rounded-lg p-3">
                            <div className="text-sm text-blue-700 mb-1">Nomor Antrian</div>
                            <div className="font-bold text-xl text-blue-900">
                              {scanResult.data.queue.queueNumber}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <div className="text-sm text-blue-700 mb-1">Posisi</div>
                            <div className="font-bold text-xl text-blue-900">
                              #{scanResult.data.queue.position}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 col-span-2">
                            <div className="text-sm text-blue-700 mb-1">Estimasi Tunggu</div>
                            <div className="font-bold text-lg text-blue-900 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {scanResult.data.estimatedTime}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient Information */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <div className="p-1 bg-gray-600 rounded-lg">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          Informasi Pasien
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Nama</span>
                            <span className="font-semibold text-gray-900">{scanResult.data.queue.user.fullName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">NIK</span>
                            <span className="font-semibold text-gray-900">{scanResult.data.queue.user.nik}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Telepon</span>
                            <span className="font-semibold text-gray-900">{scanResult.data.queue.user.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Information */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-3">
                          <div className="p-1 bg-green-500 rounded-lg">
                            <Stethoscope className="h-4 w-4 text-white" />
                          </div>
                          Dokter yang Bertugas
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Nama Dokter</span>
                            <span className="font-semibold text-green-900">{scanResult.data.queue.doctor.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Spesialis</span>
                            <span className="font-semibold text-green-900">{scanResult.data.queue.doctor.specialty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={resetScanner} 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Scan QR Code Lain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Alert className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <Calendar className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800 ml-2">
              <strong className="block mb-1">📱 Fitur QR Check-in</strong>
              Semua scan QR otomatis mengubah tipe antrian menjadi "APPOINTMENT" 
              dengan estimasi +20 menit per posisi sebelumnya.
            </AlertDescription>
          </Alert>

          <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 ml-2">
              <strong className="block mb-1">✅ Proses Otomatis</strong>
              User ID → Pilih dokter → Generate nomor antrian → Set posisi → Hitung estimasi waktu
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default CheckinPatient;