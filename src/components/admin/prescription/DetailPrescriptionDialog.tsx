import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    User,
    Calendar,
    Clock,
    CreditCard,
    Package,
    AlertTriangle,
    CheckCircle,
    Stethoscope,
    Phone,
    IdCard,
    Pill,
    DollarSign,
    FileText,
    Activity,
    Shield
} from 'lucide-react';
import { adminPrescriptionService } from '@/services/admin/prescription';
import type { AdminPrescription, UpdatePaymentRequest } from '@/types/admin/prescription';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailPrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prescription: AdminPrescription;
    onClose: () => void;
    onUpdate: (prescription: AdminPrescription) => void;
}

export const DetailPrescriptionDialog: React.FC<DetailPrescriptionDialogProps> = ({
    open,
    onOpenChange,
    prescription,
    onClose,
    onUpdate,
}) => {
    const [loading, setLoading] = useState(false);
    const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);
    const [showDispenseForm, setShowDispenseForm] = useState(false);
    const [paymentData, setPaymentData] = useState<UpdatePaymentRequest>({
        paymentStatus: prescription.paymentStatus,
        paymentMethod: prescription.paymentMethod || 'CASH',
        pharmacyNotes: prescription.pharmacyNotes || '',
    });
    const [dispenseNotes, setDispenseNotes] = useState('');

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(Number(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: {
                color: 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 text-yellow-300 border-yellow-700/50',
                label: 'Menunggu',
                icon: Clock
            },
            PAID: {
                color: 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300 border-green-700/50',
                label: 'Lunas',
                icon: CheckCircle
            },
            FAILED: {
                color: 'bg-gradient-to-r from-red-900/50 to-rose-900/50 text-red-300 border-red-700/50',
                label: 'Gagal',
                icon: AlertTriangle
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
        const IconComponent = config.icon;

        return (
            <Badge className={`${config.color} border px-3 py-1 font-medium`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const handleUpdatePayment = async () => {
        setLoading(true);
        try {
            const updatedPrescription = await adminPrescriptionService.updatePrescriptionPayment(
                prescription.id,
                paymentData
            );
            onUpdate(updatedPrescription);
            setShowPaymentUpdate(false);
            toast.success('Status pembayaran berhasil diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui status pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async () => {
        setLoading(true);
        try {
            const updatedPrescription = await adminPrescriptionService.dispensePrescription(
                prescription.id,
                { pharmacyNotes: dispenseNotes }
            );
            onUpdate(updatedPrescription);
            setShowDispenseForm(false);
            toast.success('Resep berhasil diserahkan');
        } catch (error) {
            toast.error('Gagal menyerahkan resep');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                <DialogHeader className="pb-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg border border-blue-500/30">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Detail Resep
                            </DialogTitle>
                            <p className="text-lg font-mono text-blue-400 mt-1">
                                {prescription.prescriptionCode}
                            </p>
                        </div>
                    </motion.div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="mb-2">{getStatusBadge(prescription.paymentStatus)}</div>
                                        <p className="text-sm text-gray-400">Status Pembayaran</p>
                                    </div>

                                    <div className="text-center">
                                        <Badge className={`mb-2 px-3 py-1 border ${prescription.isDispensed ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300 border-green-700/50' : 'bg-gradient-to-r from-gray-800/50 to-slate-800/50 text-gray-300 border-gray-600/50'}`}>
                                            <Shield className="w-3 h-3 mr-1" />
                                            {prescription.isDispensed ? 'Diserahkan' : 'Belum Diserahkan'}
                                        </Badge>
                                        <p className="text-sm text-gray-400">Status Penyerahan</p>
                                    </div>

                                    <div className="text-center">
                                        <div className="mb-2 text-2xl font-bold text-blue-400">
                                            {formatCurrency(prescription.totalAmount)}
                                        </div>
                                        <p className="text-sm text-gray-400">Total Biaya</p>
                                    </div>

                                    <div className="text-center">
                                        <div className={`mb-2 text-sm font-semibold ${prescription.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                                            {prescription.isExpired ? 'Kadaluarsa' : `${prescription.daysUntilExpiry || 0} hari`}
                                        </div>
                                        <p className="text-sm text-gray-400">Masa Berlaku</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg h-full">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg text-gray-100">
                                        <div className="p-2 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
                                            <User className="h-4 w-4 text-blue-400" />
                                        </div>
                                        Informasi Pasien
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 rounded-lg p-4 border border-blue-800/30">
                                        <h3 className="font-bold text-lg text-gray-100">{prescription.user.fullName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <IdCard className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-400">NIK: {prescription.user.nik}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Jenis Kelamin</p>
                                                <p className="font-medium text-gray-200">
                                                    {prescription.user.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Telepon</p>
                                                <p className="font-medium text-gray-200">{prescription.user.phone}</p>
                                            </div>
                                        </div>

                                        {prescription.user.dateOfBirth && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-400">Tanggal Lahir</p>
                                                    <p className="font-medium text-gray-200">
                                                        {formatDate(prescription.user.dateOfBirth)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Doctor & Timeline Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg h-full">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg text-gray-100">
                                        <div className="p-2 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg border border-green-700/30">
                                            <Stethoscope className="h-4 w-4 text-green-400" />
                                        </div>
                                        Dokter & Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {prescription.doctor && (
                                        <div className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 rounded-lg p-4 border border-green-800/30">
                                            <h3 className="font-bold text-lg text-gray-100">{prescription.doctor.name}</h3>
                                            <p className="text-green-400 font-medium">{prescription.doctor.specialty}</p>
                                            {prescription.doctor.licenseNumber && (
                                                <p className="text-sm text-gray-400 mt-1">
                                                    STR: {prescription.doctor.licenseNumber}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Tanggal Resep</p>
                                                <p className="font-medium text-gray-200">{formatDate(prescription.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Berlaku Hingga</p>
                                                <p className={`font-medium ${prescription.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                                                    {formatDate(prescription.expiresAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {prescription.dispensedAt && (
                                            <div className="flex items-center gap-3 p-3 bg-green-950/30 rounded-lg border border-green-800/30">
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                                <div>
                                                    <p className="text-sm text-green-400">Diserahkan pada</p>
                                                    <p className="font-medium text-green-300">{formatDate(prescription.dispensedAt)}</p>
                                                    {prescription.dispensedBy && (
                                                        <p className="text-sm text-green-400">oleh {prescription.dispensedBy}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {prescription.isExpired && (
                                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-950/50 to-orange-950/50 border border-red-800/30 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                            <span className="text-sm text-red-400 font-medium">Resep sudah kadaluarsa</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Medications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-100">
                                    <div className="p-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700/30">
                                        <Pill className="h-4 w-4 text-purple-400" />
                                    </div>
                                    Obat yang Diresepkan
                                    <Badge variant="secondary" className="ml-2 bg-gray-700/50 text-gray-300 border border-gray-600/30">
                                        {prescription.medications.length} item
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {prescription.medications.map((medication, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30">
                                                            <Pill className="h-4 w-4 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-xl text-gray-100">{medication.name}</h4>
                                                            <p className="text-gray-400">
                                                                {medication.form} • {medication.strength}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
                                                            <p className="text-sm font-medium text-blue-300 mb-1">Aturan Pakai</p>
                                                            <p className="text-sm text-blue-200">{medication.frequency} • {medication.duration}</p>
                                                        </div>

                                                        <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
                                                            <p className="text-sm font-medium text-green-300 mb-1">Petunjuk</p>
                                                            <p className="text-sm text-green-200">{medication.instructions}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right ml-6">
                                                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg p-3 border border-gray-600/30">
                                                        <p className="text-sm text-gray-400">Jumlah</p>
                                                        <p className="font-bold text-lg text-gray-200">{medication.quantity}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-2xl font-bold text-blue-400">{formatCurrency(medication.price)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <Separator className="my-6 bg-gray-600/50" />

                                <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 rounded-xl p-6 border border-blue-800/30">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-6 w-6 text-blue-400" />
                                            <span className="text-xl font-semibold text-gray-100">Total Biaya</span>
                                        </div>
                                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                            {formatCurrency(prescription.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Instructions & Notes */}
                    {(prescription.instructions || prescription.pharmacyNotes) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {prescription.instructions && (
                                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-gray-100">
                                            <div className="p-2 bg-gradient-to-r from-orange-900/50 to-yellow-900/50 rounded-lg border border-orange-700/30">
                                                <FileText className="h-4 w-4 text-orange-400" />
                                            </div>
                                            Instruksi Khusus
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-orange-950/30 to-yellow-950/30 rounded-lg p-4 border border-orange-800/30">
                                            <p className="text-gray-300 leading-relaxed">{prescription.instructions}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {prescription.pharmacyNotes && (
                                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-gray-100">
                                            <div className="p-2 bg-gradient-to-r from-teal-900/50 to-cyan-900/50 rounded-lg border border-teal-700/30">
                                                <Activity className="h-4 w-4 text-teal-400" />
                                            </div>
                                            Catatan Apotek
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-teal-950/30 to-cyan-950/30 rounded-lg p-4 border border-teal-800/30">
                                            <p className="text-gray-300 leading-relaxed">{prescription.pharmacyNotes}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-3 pt-4"
                    >
                        {!prescription.isPaid && !prescription.isExpired && (
                            <Button
                                onClick={() => setShowPaymentUpdate(!showPaymentUpdate)}
                                variant="outline"
                                className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border-blue-700/50 hover:from-blue-900/50 hover:to-indigo-900/50 text-blue-300 font-medium"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Update Pembayaran
                            </Button>
                        )}

                        {prescription.isPaid && !prescription.isDispensed && !prescription.isExpired && (
                            <Button
                                onClick={() => setShowDispenseForm(!showDispenseForm)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Serahkan Obat
                            </Button>
                        )}

                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 text-gray-300 font-medium border border-gray-600/50"
                        >
                            Tutup
                        </Button>
                    </motion.div>

                    {/* Forms */}
                    <AnimatePresence>
                        {showPaymentUpdate && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/50 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                                            <CreditCard className="h-5 w-5 text-blue-400" />
                                            Update Status Pembayaran
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-300 mb-2 block">Status Pembayaran</label>
                                                <Select
                                                    value={paymentData.paymentStatus}
                                                    onValueChange={(value: any) =>
                                                        setPaymentData({ ...paymentData, paymentStatus: value })
                                                    }
                                                >
                                                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-gray-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        <SelectItem value="PENDING" className="text-gray-200 focus:bg-gray-700">Menunggu</SelectItem>
                                                        <SelectItem value="PAID" className="text-gray-200 focus:bg-gray-700">Lunas</SelectItem>
                                                        <SelectItem value="FAILED" className="text-gray-200 focus:bg-gray-700">Gagal</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-300 mb-2 block">Metode Pembayaran</label>
                                                <Select
                                                    value={paymentData.paymentMethod}
                                                    onValueChange={(value: any) =>
                                                        setPaymentData({ ...paymentData, paymentMethod: value })
                                                    }
                                                >
                                                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-gray-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        <SelectItem value="CASH" className="text-gray-200 focus:bg-gray-700">Tunai</SelectItem>
                                                        <SelectItem value="INSURANCE" className="text-gray-200 focus:bg-gray-700">Asuransi</SelectItem>
                                                        <SelectItem value="CREDIT_CARD" className="text-gray-200 focus:bg-gray-700">Kartu Kredit</SelectItem>
                                                        <SelectItem value="BANK_TRANSFER" className="text-gray-200 focus:bg-gray-700">Transfer Bank</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">Catatan</label>
                                            <Textarea
                                                value={paymentData.pharmacyNotes}
                                                onChange={(e) =>
                                                    setPaymentData({ ...paymentData, pharmacyNotes: e.target.value })
                                                }
                                                placeholder="Tambahkan catatan pembayaran..."
                                                rows={3}
                                                className="bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleUpdatePayment}
                                                disabled={loading}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                            >
                                                {loading ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowPaymentUpdate(false)}
                                                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {showDispenseForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 border border-green-800/50 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                            Serahkan Obat
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">Catatan Penyerahan</label>
                                            <Textarea
                                                value={dispenseNotes}
                                                onChange={(e) => setDispenseNotes(e.target.value)}
                                                placeholder="Tambahkan catatan penyerahan obat..."
                                                rows={3}
                                                className="bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleDispense}
                                                disabled={loading}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                            >
                                                {loading ? 'Menyerahkan...' : 'Serahkan Obat'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDispenseForm(false)}
                                                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};