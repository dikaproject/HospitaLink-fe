import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionCode: string;
  onClose: () => void;
}

export const NotFoundDialog: React.FC<NotFoundDialogProps> = ({
  open,
  onOpenChange,
  prescriptionCode,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div className="p-4 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-full border border-red-700/30">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Resep Tidak Ditemukan
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border border-red-800/30">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-300">
                  Resep dengan kode
                </p>
                <div className="bg-gray-800/80 rounded-lg p-3 font-mono text-lg font-semibold text-gray-100 border border-red-700/30">
                  {prescriptionCode}
                </div>
                <p className="text-gray-300">
                  tidak ditemukan dalam sistem.
                </p>
              </div>
              
              <div className="bg-gray-800/40 rounded-lg p-4 space-y-2 border border-gray-700/30">
                <h4 className="font-medium text-gray-200">Kemungkinan penyebab:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Kode resep salah atau tidak lengkap</li>
                  <li>• Resep belum diinput ke sistem</li>
                  <li>• Resep sudah kadaluarsa atau dihapus</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-gray-100"
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};