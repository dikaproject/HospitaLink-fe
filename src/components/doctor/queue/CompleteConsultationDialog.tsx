import { useState } from 'react';
import { Check, FileText, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Queue } from '@/types/doctor/queue';

interface CompleteConsultationDialogProps {
  queue: Queue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    queueId: string;
    notes?: string;
    diagnosis?: string;
    treatment?: string;
    prescriptions?: any[];
  }) => void;
}

export function CompleteConsultationDialog({
  queue,
  open,
  onOpenChange,
  onComplete
}: CompleteConsultationDialogProps) {
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [createPrescription, setCreatePrescription] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  if (!queue) return null;

  const handleSubmit = () => {
    const data = {
      queueId: queue.id,
      notes: notes || undefined,
      diagnosis: diagnosis || undefined,
      treatment: treatment || undefined,
      prescriptions: createPrescription ? [{ notes: prescriptionNotes }] : undefined,
    };

    onComplete(data);
    
    // Reset form
    setNotes('');
    setDiagnosis('');
    setTreatment('');
    setCreatePrescription(false);
    setPrescriptionNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Selesaikan Konsultasi
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Lengkapi konsultasi untuk pasien <strong>{queue?.user.fullName}</strong> 
            <span className="ml-2 text-blue-600 dark:text-blue-400">({queue?.queueNumber})</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Patient Info Summary */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {queue?.user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{queue?.user.fullName}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {queue?.user.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {queue?.user.phone}
                </p>
                {queue?.consultation?.symptoms && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <strong>Gejala:</strong> {queue.consultation.symptoms.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Diagnosis
              </Label>
              <Input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Masukkan diagnosis..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="treatment" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tindakan/Treatment
              </Label>
              <Input
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Masukkan tindakan yang diberikan..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Catatan Konsultasi
              </Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                className="mt-1 w-full min-h-[80px] p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Prescription Option */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="createPrescription"
                  checked={createPrescription}
                  onChange={(e) => setCreatePrescription(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="createPrescription" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Pill className="w-4 h-4" />
                  Buat Resep Digital
                </Label>
              </div>

              {createPrescription && (
                <div>
                  <Label htmlFor="prescriptionNotes" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Catatan Resep
                  </Label>
                  <textarea
                    id="prescriptionNotes"
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="Catatan untuk resep digital..."
                    className="mt-1 w-full min-h-[60px] p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Resep detail akan dibuat di halaman Resep Digital
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Selesaikan Konsultasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}