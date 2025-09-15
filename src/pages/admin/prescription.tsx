import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Pill, 
  Sparkles, 
  QrCode, 
  ArrowRight,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { adminPrescriptionService } from '@/services/admin/prescription';
import type { AdminPrescription } from '@/types/admin/prescription';
import { DetailPrescriptionDialog } from '@/components/admin/prescription/DetailPrescriptionDialog';
import { NotFoundDialog } from '@/components/admin/prescription/NotFoundDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AdminPrescriptionPage = () => {
  const [prescriptionCode, setPrescriptionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState<AdminPrescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notFoundOpen, setNotFoundOpen] = useState(false);

  const handleSearch = async () => {
    if (!prescriptionCode.trim()) {
      toast.error('Masukkan kode resep');
      return;
    }

    setLoading(true);
    try {
      const data = await adminPrescriptionService.getPrescriptionByCode(prescriptionCode.trim());
      setPrescription(data);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Search error:', error);
      setNotFoundOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPrescription(null);
    setPrescriptionCode('');
  };

  const handleNotFoundClose = () => {
    setNotFoundOpen(false);
    setPrescriptionCode('');
  };

  const handlePrescriptionUpdate = (updatedPrescription: AdminPrescription) => {
    setPrescription(updatedPrescription);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900">
      {/* Dark Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-slate-800/5 to-gray-800/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto p-6 space-y-8 relative">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg opacity-40" />
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full border border-blue-500/20">
                <Pill className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-2">
              Manajemen Resep Digital
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Kelola resep pasien dengan sistem yang modern dan terintegrasi
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex justify-center gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-w-[120px]"
            >
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">QR Scanning</p>
                  <p className="font-semibold text-gray-100">Active</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-w-[120px]"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Security</p>
                  <p className="font-semibold text-gray-100">Verified</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-w-[120px]"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Processing</p>
                  <p className="font-semibold text-gray-100">Real-time</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Section */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl shadow-black/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
                    <Search className="h-5 w-5 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Pencarian Resep
                  </CardTitle>
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Masukkan kode resep untuk melihat detail lengkap
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="prescriptionCode" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Kode Resep
                  </label>
                  <div className="relative">
                    <Input
                      id="prescriptionCode"
                      type="text"
                      placeholder="RX20250915013"
                      value={prescriptionCode}
                      onChange={(e) => setPrescriptionCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      className="text-center font-mono text-lg h-12 bg-gray-900/50 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    {prescriptionCode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border border-blue-700/30">
                          {prescriptionCode.length} chars
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleSearch}
                  disabled={loading || !prescriptionCode.trim()}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl group disabled:opacity-50"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Mencari...
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Cari Resep
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center"
        >
          <Card className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span>Tips: Gunakan scanner QR untuk input yang lebih cepat</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs */}
        {prescription && (
          <DetailPrescriptionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            prescription={prescription}
            onClose={handleDialogClose}
            onUpdate={handlePrescriptionUpdate}
          />
        )}

        <NotFoundDialog
          open={notFoundOpen}
          onOpenChange={setNotFoundOpen}
          prescriptionCode={prescriptionCode}
          onClose={handleNotFoundClose}
        />
      </div>
    </div>
  );
};

export default AdminPrescriptionPage;