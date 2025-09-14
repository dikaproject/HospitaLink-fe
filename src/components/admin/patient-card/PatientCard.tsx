import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCodeDisplay from "./QRCodeDisplay";
import type { Patient } from "@/types/admin/patientCard";

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  // Format NIK dengan sensor
  const formatNIK = (nik?: string | null) => {
    if (!nik) return 'NIK belum tersedia';
    
    // Show first 4 and last 4 digits, sensor the middle
    if (nik.length >= 8) {
      const first4 = nik.slice(0, 4);
      const last4 = nik.slice(-4);
      const middle = '*'.repeat(nik.length - 8);
      return `${first4}${middle}${last4}`;
    }
    
    return nik;
  };

  // Generate QR data
  const generateQRData = () => {
    return JSON.stringify({
      id: patient.id,
      name: patient.fullName,
      nik: patient.nik,
      type: 'patient_card'
    });
  };

  // Format name for display
  const formatName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 20) + '...';
    }
    return name;
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/50 border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hospital Logo/Icon */}
      <div className="absolute top-3 left-3 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-sm font-bold">H</span>
      </div>

      {/* Active Status Badge */}
      <div className="absolute top-3 right-3">
        <Badge 
          variant={patient.isActive ? "default" : "secondary"}
          className={`text-xs shadow-lg ${
            patient.isActive 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "bg-gray-400 hover:bg-gray-500 text-white"
          }`}
        >
          {patient.isActive ? "AKTIF" : "NONAKTIF"}
        </Badge>
      </div>

      <CardContent className="p-6 pt-16 relative">
        {/* Patient Name */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
            {formatName(patient.fullName)}
          </h3>
          
          {/* Full name tooltip if truncated */}
          {patient.fullName.length > 20 && (
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {patient.fullName}
            </div>
          )}
          
          {/* Gender Badge */}
          {patient.gender && (
            <Badge 
              variant="outline" 
              className={`text-xs mt-2 ${
                patient.gender === "MALE" 
                  ? "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/50" 
                  : "border-pink-300 text-pink-700 bg-pink-50 dark:border-pink-700 dark:text-pink-300 dark:bg-pink-950/50"
              }`}
            >
              {patient.gender === "MALE" ? "👨 Laki-laki" : "👩 Perempuan"}
            </Badge>
          )}
        </div>

        {/* Bottom Section: NIK and QR Code */}
        <div className="flex items-end justify-between mt-8">
          {/* NIK Section */}
          <div className="flex-1 mr-4">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              NIK
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200 tracking-wider">
                {formatNIK(patient.nik)}
              </code>
            </div>
            
            {/* Phone if available */}
            {patient.phone && (
              <div className="mt-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Telepon
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {patient.phone}
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="flex-shrink-0">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">
              QR Code
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <QRCodeDisplay 
                value={generateQRData()}
                size={80}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </CardContent>
    </Card>
  );
};

export default PatientCard;