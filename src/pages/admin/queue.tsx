import { useMemo, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Calendar, Clock, User, History, List, CheckCircle } from "lucide-react"
import { queueService } from "@/services/admin/queue"
import type { QueueListItem, QueuePagination, QueueStatistics } from "@/types/admin/queue"
import DetailQueueDialog from "@/components/admin/queue/DetailQueueDialog"

function QueuePage() {
    const [queues, setQueues] = useState<QueueListItem[]>([])
    const [historyQueues, setHistoryQueues] = useState<QueueListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("all") // "all" or "history"

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [historySearchQuery, setHistorySearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"ALL" | "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("ALL")
    const [dateFilter, setDateFilter] = useState("")
    const [historyDateFilter, setHistoryDateFilter] = useState("")

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [historyPageSize, setHistoryPageSize] = useState(10)
    const [pagination, setPagination] = useState<QueuePagination>({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
    })
    const [historyPagination, setHistoryPagination] = useState<QueuePagination>({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
    })

    // Statistics state
    const [statistics, setStatistics] = useState<QueueStatistics>({
        total: 0,
        waiting: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
    })

    // Dialog states
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedQueueId, setSelectedQueueId] = useState<string>('')

    // Load all queues function
    const loadQueues = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await queueService.getQueues(
                currentPage,
                pageSize,
                searchQuery,
                statusFilter,
                undefined, // doctorId
                dateFilter ? new Date(dateFilter).toISOString() : undefined,
                dateFilter ? new Date(new Date(dateFilter).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined
            )

            if (response.success) {
                setQueues(response.data.queues)
                setPagination(response.data.pagination)
                setStatistics(response.data.statistics)
            } else {
                setError(response.message || 'Failed to load queues')
                setQueues([])
                setPagination({
                    currentPage: 1,
                    totalPages: 0,
                    totalCount: 0,
                    hasNext: false,
                    hasPrev: false
                })
                setStatistics({
                    total: 0,
                    waiting: 0,
                    inProgress: 0,
                    completed: 0,
                    cancelled: 0
                })
            }
        } catch (err: any) {
            console.error("Error loading queues:", err)
            setError(err.response?.data?.message || 'An unexpected error occurred while loading queues')
            setQueues([])
            setPagination({
                currentPage: 1,
                totalPages: 0,
                totalCount: 0,
                hasNext: false,
                hasPrev: false
            })
            setStatistics({
                total: 0,
                waiting: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0
            })
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, searchQuery, statusFilter, dateFilter])

    // Load queue history function
    const loadQueueHistory = useCallback(async () => {
        setHistoryLoading(true)
        setError(null)

        try {
            const response = await queueService.getQueueHistory(
                historyCurrentPage,
                historyPageSize,
                historySearchQuery,
                undefined, // doctorId
                historyDateFilter ? new Date(historyDateFilter).toISOString() : undefined,
                historyDateFilter ? new Date(new Date(historyDateFilter).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined
            )

            if (response.success) {
                setHistoryQueues(response.data.queues)
                setHistoryPagination(response.data.pagination)
            } else {
                setError(response.message || 'Failed to load queue history')
                setHistoryQueues([])
                setHistoryPagination({
                    currentPage: 1,
                    totalPages: 0,
                    totalCount: 0,
                    hasNext: false,
                    hasPrev: false
                })
            }
        } catch (err: any) {
            console.error("Error loading queue history:", err)
            setError(err.response?.data?.message || 'An unexpected error occurred while loading queue history')
            setHistoryQueues([])
            setHistoryPagination({
                currentPage: 1,
                totalPages: 0,
                totalCount: 0,
                hasNext: false,
                hasPrev: false
            })
        } finally {
            setHistoryLoading(false)
        }
    }, [historyCurrentPage, historyPageSize, historySearchQuery, historyDateFilter])

    // Load queues when dependencies change
    useEffect(() => {
        if (activeTab === "all") {
            loadQueues()
        }
    }, [loadQueues, activeTab])

    // Load history when tab is active
    useEffect(() => {
        if (activeTab === "history") {
            loadQueueHistory()
        }
    }, [loadQueueHistory, activeTab])

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setHistoryCurrentPage(1)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [historySearchQuery])

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleHistoryPageChange = (page: number) => {
        setHistoryCurrentPage(page)
    }

    // Handle page size change
    const handlePageSizeChange = (size: string) => {
        setPageSize(parseInt(size))
        setCurrentPage(1)
    }

    const handleHistoryPageSizeChange = (size: string) => {
        setHistoryPageSize(parseInt(size))
        setHistoryCurrentPage(1)
    }

    // Handle view queue details
    const handleViewQueue = (queueId: string) => {
        setSelectedQueueId(queueId)
        setDetailDialogOpen(true)
    }

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Format time
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Calculate duration
    const calculateDuration = (startTime: string, endTime: string) => {
        const start = new Date(startTime)
        const end = new Date(endTime)
        const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))

        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit`
        } else {
            const hours = Math.floor(diffInMinutes / 60)
            const minutes = diffInMinutes % 60
            return `${hours}j ${minutes}m`
        }
    }

    // Generate pagination items
    const generatePaginationItems = (paginationData: QueuePagination, currentPageNum: number) => {
        const items = []
        const totalPages = paginationData.totalPages
        const current = currentPageNum

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(i)
            }
        } else {
            if (current <= 4) {
                items.push(1, 2, 3, 4, 5, '...', totalPages)
            } else if (current >= totalPages - 3) {
                items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                items.push(1, '...', current - 1, current, current + 1, '...', totalPages)
            }
        }

        return items
    }

    // Get status color and text
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'WAITING': return '⏳ Menunggu';
            case 'IN_PROGRESS': return '🔄 Sedang Dilayani';
            case 'COMPLETED': return '✅ Selesai';
            case 'CANCELLED': return '❌ Dibatalkan';
            default: return status;
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }

    // Render queue table
    const renderQueueTable = (queueList: QueueListItem[], isHistory: boolean = false) => (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">No. Antrian</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Pasien</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Dokter</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Konsultasi</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Waktu{isHistory ? ' & Durasi' : ''}</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300 w-[100px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {queueList.map((queue) => (
                        <TableRow key={queue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {/* Queue Number Column */}
                            <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                <div className="flex flex-col gap-1">
                                    <div className={`text-xl font-bold ${isHistory ? 'text-green-600' : 'text-blue-600'}`}>
                                        {queue.queueNumber}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs">
                                            Pos: {queue.position}
                                        </Badge>
                                        {queue.isPriority && (
                                            <Badge variant="destructive" className="text-xs">
                                                🚨 Prioritas
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </TableCell>

                            {/* Patient Column */}
                            <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${isHistory ? 'from-green-500 to-teal-600' : 'from-blue-500 to-indigo-600'} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                                        {queue.user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">{queue.user.fullName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {queue.user.nik && `NIK: ${queue.user.nik}`}
                                            {queue.user.phone && ` • ${queue.user.phone}`}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Doctor Column */}
                            <TableCell className="text-gray-700 dark:text-gray-300">
                                {queue.doctor ? (
                                    <div>
                                        <div className="text-sm font-medium">{queue.doctor.name}</div>
                                        <div className="text-xs text-gray-500">{queue.doctor.specialty}</div>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">{isHistory ? 'Dokter Umum' : 'Belum ditentukan'}</span>
                                )}
                            </TableCell>

                            {/* Consultation Column */}
                            <TableCell className="text-gray-700 dark:text-gray-300">
                                {queue.consultation ? (
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="text-xs">
                                            {queue.consultation.type}
                                        </Badge>
                                        <Badge className={`text-xs ${getSeverityColor(queue.consultation.severity)}`}>
                                            {queue.consultation.severity}
                                        </Badge>
                                        {queue.consultation.symptoms.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {queue.consultation.symptoms.slice(0, 2).join(', ')}
                                                {queue.consultation.symptoms.length > 2 && '...'}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                )}
                            </TableCell>

                            {/* Time Column */}
                            <TableCell className="text-gray-700 dark:text-gray-300">
                                <div className="text-sm space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-xs">{formatDate(queue.queueDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs">{formatTime(queue.checkInTime)}</span>
                                    </div>
                                    {queue.completedTime && (
                                        <>
                                            <div className="text-xs text-green-600">
                                                Selesai: {formatTime(queue.completedTime)}
                                            </div>
                                            {isHistory && queue.calledTime && (
                                                <div className="text-xs text-blue-600 font-medium">
                                                    Durasi: {calculateDuration(queue.calledTime, queue.completedTime)}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </TableCell>

                            {/* Status Column */}
                            <TableCell>
                                <Badge className={getStatusColor(queue.status)}>
                                    {getStatusText(queue.status)}
                                </Badge>
                            </TableCell>

                            {/* Action Column */}
                            <TableCell>
                                <div className="flex gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewQueue(queue.id)}
                                                    className={`h-8 w-8 p-0 ${isHistory ? 'hover:bg-green-50 dark:hover:bg-green-900/20' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                                >
                                                    <Eye className={`h-4 w-4 ${isHistory ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Lihat detail</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {queueList.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-12">
                                <div className="text-gray-500 dark:text-gray-400">
                                    <div className="text-4xl mb-2">{isHistory ? '📋' : '📋'}</div>
                                    <p className="font-medium">
                                        {isHistory ?
                                            (historySearchQuery || historyDateFilter ? "Tidak ada riwayat antrian ditemukan" : "Belum ada riwayat antrian") :
                                            (searchQuery || statusFilter !== "ALL" || dateFilter ? "Tidak ada antrian ditemukan" : "Belum ada data antrian")
                                        }
                                    </p>
                                    <p className="text-sm mt-1">
                                        {isHistory ?
                                            (historySearchQuery || historyDateFilter ? "Coba ubah kriteria pencarian" : "Riwayat akan muncul setelah ada antrian yang selesai") :
                                            (searchQuery || statusFilter !== "ALL" || dateFilter ? "Coba ubah kriteria pencarian" : "Antrian akan muncul ketika ada pasien yang mendaftar")
                                        }
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
            {/* Error Message */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950">
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
                                onClick={activeTab === "all" ? loadQueues : loadQueueHistory}
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards - Only show on "all" tab */}
            {activeTab === "all" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Antrian</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {statistics.total.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Semua antrian</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">📋</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Menunggu</p>
                                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                                        {statistics.waiting.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Sedang menunggu</p>
                                </div>
                                <div className="h-12 w-12 bg-yellow-500 dark:bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">⏳</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Sedang Dilayani</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                        {statistics.inProgress.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Dalam proses</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">🔄</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Selesai</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                                        {statistics.completed.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Telah selesai</p>
                                </div>
                                <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">✅</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Dibatalkan</p>
                                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                                        {statistics.cancelled.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Telah dibatalkan</p>
                                </div>
                                <div className="h-12 w-12 bg-red-500 dark:bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">❌</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* History Stats Card - Only show on "history" tab */}
            {activeTab === "history" && (
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Antrian Selesai</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                                    {historyPagination.totalCount.toLocaleString()}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Antrian yang telah diselesaikan</p>
                            </div>
                            <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Table with Tabs */}
            <Card className="shadow-lg border-0 dark:border-gray-800">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {activeTab === "all" ? "Data Antrian" : "Riwayat Antrian"}
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                {activeTab === "all" ?
                                    `Kelola dan lihat informasi antrian pasien. Total: ${pagination.totalCount.toLocaleString()} antrian` :
                                    `Riwayat antrian yang telah selesai. Total: ${historyPagination.totalCount.toLocaleString()} riwayat`
                                }
                            </CardDescription>
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="all" className="flex items-center gap-2">
                                    <List className="h-4 w-4" />
                                    Semua Antrian
                                </TabsTrigger>
                                <TabsTrigger value="history" className="flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    Riwayat Selesai
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-4">
                                {/* All Queues Filters */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Input
                                            placeholder="Cari nomor antrian atau nama pasien..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-10 pl-9"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            🔍
                                        </div>
                                    </div>

                                    <Select value={statusFilter} onValueChange={(value: "ALL" | "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => {
                                        setStatusFilter(value)
                                    }}>
                                        <SelectTrigger className="w-full sm:w-[180px] h-10">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Semua Status</SelectItem>
                                            <SelectItem value="WAITING">Menunggu</SelectItem>
                                            <SelectItem value="IN_PROGRESS">Sedang Dilayani</SelectItem>
                                            <SelectItem value="COMPLETED">Selesai</SelectItem>
                                            <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-full sm:w-[160px] h-10"
                                    />

                                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                        <SelectTrigger className="w-full sm:w-[100px] h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10 / hal</SelectItem>
                                            <SelectItem value="25">25 / hal</SelectItem>
                                            <SelectItem value="50">50 / hal</SelectItem>
                                            <SelectItem value="100">100 / hal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="history" className="mt-4">
                                {/* History Filters */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Input
                                            placeholder="Cari nomor antrian atau nama pasien..."
                                            value={historySearchQuery}
                                            onChange={(e) => setHistorySearchQuery(e.target.value)}
                                            className="h-10 pl-9"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            🔍
                                        </div>
                                    </div>

                                    <Input
                                        type="date"
                                        value={historyDateFilter}
                                        onChange={(e) => setHistoryDateFilter(e.target.value)}
                                        className="w-full sm:w-[160px] h-10"
                                    />

                                    <Select value={historyPageSize.toString()} onValueChange={handleHistoryPageSizeChange}>
                                        <SelectTrigger className="w-full sm:w-[100px] h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10 / hal</SelectItem>
                                            <SelectItem value="25">25 / hal</SelectItem>
                                            <SelectItem value="50">50 / hal</SelectItem>
                                            <SelectItem value="100">100 / hal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {(loading && activeTab === "all") || (historyLoading && activeTab === "history") ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                                {activeTab === "all" ? "Memuat data antrian..." : "Memuat riwayat antrian..."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "all" && renderQueueTable(queues, false)}
                            {activeTab === "history" && renderQueueTable(historyQueues, true)}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {((activeTab === "all" && pagination.totalPages > 1) || (activeTab === "history" && historyPagination.totalPages > 1)) && (
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {activeTab === "all" ?
                                    ((currentPage - 1) * pageSize) + 1 :
                                    ((historyCurrentPage - 1) * historyPageSize) + 1
                                }
                            </span>{' '}
                            sampai{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {activeTab === "all" ?
                                    Math.min(currentPage * pageSize, pagination.totalCount) :
                                    Math.min(historyCurrentPage * historyPageSize, historyPagination.totalCount)
                                }
                            </span>{' '}
                            dari{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {activeTab === "all" ?
                                    pagination.totalCount.toLocaleString() :
                                    historyPagination.totalCount.toLocaleString()
                                }
                            </span>{' '}
                            {activeTab === "all" ? "antrian" : "riwayat"}
                        </div>

                        <Pagination className="justify-center sm:justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (activeTab === "all" && pagination.hasPrev) {
                                                handlePageChange(currentPage - 1)
                                            } else if (activeTab === "history" && historyPagination.hasPrev) {
                                                handleHistoryPageChange(historyCurrentPage - 1)
                                            }
                                        }}
                                        className={
                                            (activeTab === "all" && !pagination.hasPrev) ||
                                                (activeTab === "history" && !historyPagination.hasPrev) ?
                                                "pointer-events-none opacity-50" : ""
                                        }
                                    />
                                </PaginationItem>

                                {generatePaginationItems(
                                    activeTab === "all" ? pagination : historyPagination,
                                    activeTab === "all" ? currentPage : historyCurrentPage
                                ).map((item, index) => (
                                    <PaginationItem key={index}>
                                        {item === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (activeTab === "all") {
                                                        handlePageChange(item as number)
                                                    } else {
                                                        handleHistoryPageChange(item as number)
                                                    }
                                                }}
                                                isActive={
                                                    (activeTab === "all" && currentPage === item) ||
                                                    (activeTab === "history" && historyCurrentPage === item)
                                                }
                                            >
                                                {item}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (activeTab === "all" && pagination.hasNext) {
                                                handlePageChange(currentPage + 1)
                                            } else if (activeTab === "history" && historyPagination.hasNext) {
                                                handleHistoryPageChange(historyCurrentPage + 1)
                                            }
                                        }}
                                        className={
                                            (activeTab === "all" && !pagination.hasNext) ||
                                                (activeTab === "history" && !historyPagination.hasNext) ?
                                                "pointer-events-none opacity-50" : ""
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </Card>
            )}

            {/* Dialogs */}
            <DetailQueueDialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                queueId={selectedQueueId}
            />
        </div>
    )
}

export default QueuePage