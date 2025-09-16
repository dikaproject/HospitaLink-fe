import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Phone, Volume2, Play, CheckCircle2, XCircle, Users, Timer, ArrowRight, Bell, Calendar, RefreshCw, Square } from 'lucide-react';
import { queueService } from '@/services/admin/queue';
import { QueueListItem, QueueStatistics } from '@/types/admin/queue';
import { toast } from 'sonner';

function QueueCallPage() {
    const [queues, setQueues] = useState<QueueListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statistics, setStatistics] = useState<QueueStatistics>({
        total: 0,
        waiting: 0,
        called: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
    })

    // Action loading state
    const [actionLoading, setActionLoading] = useState<string>('')

    // Auto refresh interval
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

    // Load all active queues (WAITING, CALLED, IN_PROGRESS)
    const loadActiveQueues = useCallback(async () => {
        if (!autoRefresh && !loading) return; // Don't load if auto-refresh is off and not initial load
        
        setError(null)
        if (loading) setLoading(true)

        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await queueService.getQueues(
                1,
                50, // Get more items for overview
                '',
                'ALL', // Get all statuses, we'll filter on frontend
                undefined,
                today,
                today
            )

            if (response.success) {
                // Filter only active queues (not completed or cancelled)
                const activeQueues = response.data.queues.filter(q => 
                    ['WAITING', 'CALLED', 'IN_PROGRESS'].includes(q.status)
                )
                setQueues(activeQueues)
                setStatistics(response.data.statistics)
            } else {
                setError(response.message || 'Failed to load queues')
                setQueues([])
                setStatistics({
                    total: 0,
                    waiting: 0,
                    called: 0,
                    inProgress: 0,
                    completed: 0,
                    cancelled: 0
                })
            }
        } catch (err: any) {
            console.error("Error loading queues:", err)
            setError(err.response?.data?.message || 'An unexpected error occurred while loading queues')
            setQueues([])
            setStatistics({
                total: 0,
                waiting: 0,
                called: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0
            })
        } finally {
            setLoading(false)
        }
    }, [autoRefresh, loading])

    // Handle call patient
    const handleCallPatient = async (queueId: string, patientName: string, queueNumber: string) => {
        setActionLoading(queueId)
        try {
            const response = await queueService.callPatient(queueId)
            if (response.success) {
                toast.success(`Pasien ${patientName} (${queueNumber}) telah dipanggil`)
                await loadActiveQueues() // Refresh data
            } else {
                toast.error(response.message || 'Gagal memanggil pasien')
            }
        } catch (err: any) {
            console.error("Error calling patient:", err)
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat memanggil pasien')
        } finally {
            setActionLoading('')
        }
    }

    // Handle start consultation
    const handleStartConsultation = async (queueId: string, patientName: string, queueNumber: string) => {
        setActionLoading(queueId)
        try {
            const response = await queueService.startConsultation(queueId)
            if (response.success) {
                toast.success(`Konsultasi dimulai untuk ${patientName} (${queueNumber})`)
                await loadActiveQueues() // Refresh data
            } else {
                toast.error(response.message || 'Gagal memulai konsultasi')
            }
        } catch (err: any) {
            console.error("Error starting consultation:", err)
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat memulai konsultasi')
        } finally {
            setActionLoading('')
        }
    }

    // Handle complete consultation
    const handleCompleteConsultation = async (queueId: string, patientName: string, queueNumber: string) => {
        setActionLoading(queueId)
        try {
            const response = await queueService.completeConsultation(queueId)
            if (response.success) {
                toast.success(`Konsultasi selesai untuk ${patientName} (${queueNumber})`)
                await loadActiveQueues() // Refresh data
            } else {
                toast.error(response.message || 'Gagal menyelesaikan konsultasi')
            }
        } catch (err: any) {
            console.error("Error completing consultation:", err)
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyelesaikan konsultasi')
        } finally {
            setActionLoading('')
        }
    }

    // Handle cancel queue
    const handleCancelQueue = async (queueId: string, patientName: string, queueNumber: string) => {
        setActionLoading(queueId)
        try {
            const response = await queueService.cancelQueue(queueId, 'Dibatalkan oleh admin')
            if (response.success) {
                toast.success(`Antrian dibatalkan untuk ${patientName} (${queueNumber})`)
                await loadActiveQueues() // Refresh data
            } else {
                toast.error(response.message || 'Gagal membatalkan antrian')
            }
        } catch (err: any) {
            console.error("Error cancelling queue:", err)
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat membatalkan antrian')
        } finally {
            setActionLoading('')
        }
    }

    // Auto refresh setup
    useEffect(() => {
        loadActiveQueues() // Initial load

        if (autoRefresh) {
            const interval = setInterval(() => {
                loadActiveQueues()
            }, 15000) // Refresh every 15 seconds
            setRefreshInterval(interval)

            return () => {
                if (interval) clearInterval(interval)
            }
        }

        return () => {
            if (refreshInterval) clearInterval(refreshInterval)
        }
    }, [autoRefresh]) // eslint-disable-line react-hooks/exhaustive-deps

    // Manual refresh
    const handleManualRefresh = () => {
        setLoading(true)
        loadActiveQueues()
    }

    // Toggle auto refresh
    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh)
        if (refreshInterval) {
            clearInterval(refreshInterval)
            setRefreshInterval(null)
        }
    }

    // Get current queue (first waiting or called queue)
    const currentQueue = useMemo(() => {
        return queues.find(q => q.status === 'WAITING' || q.status === 'CALLED') || null
    }, [queues])

    // Get in progress queue
    const inProgressQueue = useMemo(() => {
        return queues.find(q => q.status === 'IN_PROGRESS') || null
    }, [queues])

    // Get next queues (up to 5 waiting queues)
    const nextQueues = useMemo(() => {
        return queues
            .filter(q => q.status === 'WAITING' && q.id !== currentQueue?.id)
            .sort((a, b) => a.position - b.position)
            .slice(0, 5)
    }, [queues, currentQueue])

    // Format time
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Get status color and text
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'CALLED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'WAITING': return '⏳ Menunggu';
            case 'CALLED': return '📢 Dipanggil';
            case 'IN_PROGRESS': return '🔄 Sedang Dilayani';
            case 'COMPLETED': return '✅ Selesai';
            case 'CANCELLED': return '❌ Dibatalkan';
            default: return status;
        }
    }

    if (loading && queues.length === 0) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Panggil Pasien
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Kelola panggilan pasien untuk konsultasi
                        </p>
                    </div>
                </div>

                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                            Memuat data antrian...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Panggil Pasien
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Kelola panggilan pasien untuk konsultasi hari ini
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAutoRefresh}
                            className={autoRefresh ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20' : ''}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                    <CardContent className="p-4">
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setError(null)}
                            >
                                Dismiss
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleManualRefresh}
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Patient Call Cards */}
            {!currentQueue && !inProgressQueue ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 h-full">
                            <CardContent className="p-12 text-center flex flex-col justify-center h-full">
                                <div className="text-8xl mb-6">📋</div>
                                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Tidak Ada Antrian Aktif
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Saat ini tidak ada pasien yang menunggu atau sedang dalam konsultasi
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Queue Summary Card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                <Users className="h-6 w-6" />
                                Ringkasan Hari Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {statistics.waiting}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Menunggu</div>
                                </div>
                                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {statistics.completed}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Selesai</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Patient Call Cards */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Current/Next Patient Card */}
                            {currentQueue && (
                                <Card className={`${
                                    currentQueue.status === 'WAITING' 
                                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-2 border-blue-200 dark:border-blue-800' 
                                        : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200 dark:border-orange-800'
                                } shadow-xl`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className={`text-xl flex items-center gap-2 ${
                                                currentQueue.status === 'WAITING' 
                                                    ? 'text-blue-900 dark:text-blue-100' 
                                                    : 'text-orange-900 dark:text-orange-100'
                                            }`}>
                                                {currentQueue.status === 'WAITING' ? (
                                                    <>
                                                        <Bell className="h-6 w-6" />
                                                        Panggil Pasien
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="h-6 w-6" />
                                                        Pasien Dipanggil
                                                    </>
                                                )}
                                            </CardTitle>
                                            <Badge className={getStatusColor(currentQueue.status)}>
                                                {getStatusText(currentQueue.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Large Queue Number Display */}
                                        <div className="text-center py-8 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-inner">
                                            <div className={`text-6xl font-bold mb-3 ${
                                                currentQueue.status === 'WAITING' 
                                                    ? 'text-blue-600 dark:text-blue-400' 
                                                    : 'text-orange-600 dark:text-orange-400'
                                            }`}>
                                                {currentQueue.queueNumber}
                                            </div>
                                            <div className="flex items-center justify-center gap-4 text-base text-gray-600 dark:text-gray-400">
                                                <span>Posisi: #{currentQueue.position}</span>
                                                {currentQueue.isPriority && (
                                                    <Badge variant="destructive" className="text-sm animate-pulse">
                                                        🚨 PRIORITAS
                                                    </Badge>
                                                )}
                                            </div>
                                            {currentQueue.estimatedWaitTime && (
                                                <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Timer className="h-4 w-4" />
                                                    <span>Estimasi: {currentQueue.estimatedWaitTime} menit</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Patient Information */}
                                        <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                                                currentQueue.status === 'WAITING' 
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                            }`}>
                                                {currentQueue.user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                                                    {currentQueue.user.fullName}
                                                </h4>
                                                <div className="space-y-1 mt-2">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        📞 {currentQueue.user.phone}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        🆔 {currentQueue.user.nik}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        👤 {currentQueue.user.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Doctor Information */}
                                        {currentQueue.doctor && (
                                            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">👨‍⚕️ Dokter: </span>
                                                    <span className="text-gray-900 dark:text-gray-100">{currentQueue.doctor.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">{currentQueue.doctor.specialty}</div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {currentQueue.notes && (
                                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <div className="text-sm">
                                                    <span className="font-medium text-yellow-800 dark:text-yellow-200">📝 Catatan: </span>
                                                    <span className="text-yellow-700 dark:text-yellow-300">{currentQueue.notes}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            {currentQueue.status === 'WAITING' && (
                                                <Button
                                                    onClick={() => handleCallPatient(currentQueue.id, currentQueue.user.fullName, currentQueue.queueNumber)}
                                                    disabled={actionLoading === currentQueue.id}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                                    size="lg"
                                                >
                                                    {actionLoading === currentQueue.id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    ) : (
                                                        <Phone className="h-5 w-5 mr-2" />
                                                    )}
                                                    Panggil Pasien
                                                </Button>
                                            )}
                                            
                                            {currentQueue.status === 'CALLED' && (
                                                <Button
                                                    onClick={() => handleStartConsultation(currentQueue.id, currentQueue.user.fullName, currentQueue.queueNumber)}
                                                    disabled={actionLoading === currentQueue.id}
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                                    size="lg"
                                                >
                                                    {actionLoading === currentQueue.id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    ) : (
                                                        <Play className="h-5 w-5 mr-2" />
                                                    )}
                                                    Mulai Konsultasi
                                                </Button>
                                            )}

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="lg"
                                                        className="shadow-lg"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Batalkan Antrian</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apakah Anda yakin ingin membatalkan antrian {currentQueue.queueNumber} untuk {currentQueue.user.fullName}?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelQueue(currentQueue.id, currentQueue.user.fullName, currentQueue.queueNumber)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Ya, Batalkan
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* In Progress Patient Card */}
                            {inProgressQueue && (
                                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-2 border-green-200 dark:border-green-800 shadow-xl">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl text-green-900 dark:text-green-100 flex items-center gap-2">
                                                <Square className="h-6 w-6" />
                                                Sedang Konsultasi
                                            </CardTitle>
                                            <Badge className={getStatusColor(inProgressQueue.status)}>
                                                {getStatusText(inProgressQueue.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Queue Number */}
                                        <div className="text-center py-8 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-inner">
                                            <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-3">
                                                {inProgressQueue.queueNumber}
                                            </div>
                                            <div className="text-base text-gray-600 dark:text-gray-400">
                                                Dimulai: {formatTime(inProgressQueue.calledTime || inProgressQueue.checkInTime)}
                                            </div>
                                        </div>

                                        {/* Patient Info */}
                                        <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl">
                                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {inProgressQueue.user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                    {inProgressQueue.user.fullName}
                                                </h4>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    📞 {inProgressQueue.user.phone}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Doctor Info */}
                                        {inProgressQueue.doctor && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                👨‍⚕️ {inProgressQueue.doctor.name} ({inProgressQueue.doctor.specialty})
                                            </div>
                                        )}

                                        {/* Complete Button */}
                                        <Button
                                            onClick={() => handleCompleteConsultation(inProgressQueue.id, inProgressQueue.user.fullName, inProgressQueue.queueNumber)}
                                            disabled={actionLoading === inProgressQueue.id}
                                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                            size="lg"
                                        >
                                            {actionLoading === inProgressQueue.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                            )}
                                            Selesai Konsultasi
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Side Panel - Queue Overview & Next Patients */}
                    <div className="space-y-6">
                        {/* Current Queue Stats */}
                        <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950 dark:to-purple-900 border-indigo-200 dark:border-indigo-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    Status Antrian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {statistics.waiting}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Menunggu</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {statistics.inProgress}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Dilayani</div>
                                    </div>
                                </div>
                                
                                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                                        {statistics.completed}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Selesai Hari Ini</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next in Queue */}
                        {nextQueues.length > 0 && (
                            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <ArrowRight className="h-6 w-6" />
                                        Antrian Selanjutnya
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {nextQueues.map((queue, index) => (
                                        <div key={queue.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {queue.queueNumber}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {queue.user.fullName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {queue.user.phone}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                #{queue.position}
                                            </div>
                                            {queue.isPriority && (
                                                <Badge variant="destructive" className="text-xs">
                                                    🚨
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default QueueCallPage;