import axios from 'axios'
import {
    type Patient,
    type PatientSearchQuery,
    type PatientListResponse,
    type PatientDetailResponse,
    type PatientStats,
    type PatientServiceResponse
} from "@/types/admin/patient"

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_PREFIX = '/api/web/admin/patients'

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Request interceptor for authentication
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullURL: `${config.baseURL}${config.url}`,
            hasToken: !!token
        })
        
        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response Success:', {
            status: response.status,
            url: response.config.url,
            totalRecords: response.data?.data?.pagination?.totalRecords || 0
        })
        return response
    },
    (error) => {
        console.error('❌ API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
        })

        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken')
            sessionStorage.removeItem('adminToken')
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login'
            }
        }
        return Promise.reject(error)
    }
)

// Helper functions
const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.response?.data?.error || error.message || 'Network error'
    }
    return error instanceof Error ? error.message : 'Unknown error'
}

// Build query string helper
const buildQueryString = (params: PatientSearchQuery): string => {
    const queryParams = new URLSearchParams()
    
    if (params.page && params.page > 0) {
        queryParams.append('page', params.page.toString())
    }
    if (params.limit && params.limit > 0) {
        queryParams.append('limit', params.limit.toString())
    }
    if (params.search?.trim()) {
        queryParams.append('search', params.search.trim())
    }
    if (params.gender) {
        queryParams.append('gender', params.gender)
    }
    if (typeof params.isActive === 'boolean') {
        queryParams.append('isActive', params.isActive.toString())
    }
    if (params.sortBy?.trim()) {
        queryParams.append('sortBy', params.sortBy)
    }
    if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder.toLowerCase())) {
        queryParams.append('sortOrder', params.sortOrder)
    }

    return queryParams.toString()
}

// Patient Service - Fixed response handling
export const patientService = {
    // Get all patients with pagination and filtering
    getAll: async (params: PatientSearchQuery = {}): Promise<PatientListResponse> => {
        try {
            console.log('🔍 Fetching patients with params:', params)
            
            const queryString = buildQueryString(params)
            const url = queryString ? `${API_PREFIX}?${queryString}` : API_PREFIX

            const response = await apiClient.get(url)

            if (!response.data) {
                throw new Error('Invalid response from server')
            }

            if (response.data.success) {
                // Fixed: Properly handle the response structure
                const result: PatientListResponse = {
                    success: true,
                    data: {
                        patients: response.data.data?.patients || [],
                        pagination: response.data.data?.pagination || {
                            currentPage: params.page || 1,
                            totalPages: 0,
                            totalRecords: 0,
                            hasNextPage: false,
                            hasPrevPage: false,
                            limit: params.limit || 10
                        }
                    },
                    message: response.data.message || 'Patients retrieved successfully'
                }
                
                return result
            } else {
                // Fixed: Error response handling
                return {
                    success: false,
                    error: response.data.error || response.data.message || 'Failed to fetch patients',
                    message: response.data.message || 'Failed to fetch patients',
                    data: {
                        patients: [],
                        pagination: {
                            currentPage: params.page || 1,
                            totalPages: 0,
                            totalRecords: 0,
                            hasNextPage: false,
                            hasPrevPage: false,
                            limit: params.limit || 10
                        }
                    }
                }
            }
        } catch (error: unknown) {
            console.error('❌ Error fetching patients:', error)
            
            return {
                success: false,
                error: handleApiError(error),
                message: 'Failed to fetch patients',
                data: {
                    patients: [],
                    pagination: {
                        currentPage: params.page || 1,
                        totalPages: 0,
                        totalRecords: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                        limit: params.limit || 10
                    }
                }
            }
        }
    },

    // Get patient by ID - Fixed response handling
    getById: async (id: string): Promise<PatientDetailResponse> => {
        try {
            if (!id?.trim()) {
                return {
                    success: false,
                    error: 'Invalid patient ID',
                    message: 'Patient ID is required'
                }
            }

            console.log('🔍 Fetching patient by ID:', id)

            const response = await apiClient.get(`${API_PREFIX}/${id.trim()}`)

            if (!response.data) {
                throw new Error('Invalid response from server')
            }

            if (response.data.success) {
                return {
                    success: true,
                    data: {
                        patient: response.data.data?.patient,
                        summary: response.data.data?.summary || {
                            totalAppointments: 0,
                            completedAppointments: 0,
                            totalConsultations: 0,
                            totalMedicalRecords: 0,
                            totalLabResults: 0,
                            totalPrescriptions: 0,
                            unreadNotifications: 0,
                            lastVisit: null,
                            lastAppointment: null
                        }
                    },
                    message: response.data.message || 'Patient details retrieved successfully'
                }
            } else {
                return {
                    success: false,
                    error: response.data.error || response.data.message || 'Patient not found',
                    message: response.data.message || 'Patient not found'
                }
            }
        } catch (error: unknown) {
            console.error('❌ Error fetching patient by ID:', error)
            
            return {
                success: false,
                error: handleApiError(error),
                message: 'Failed to fetch patient details'
            }
        }
    },

    // Get patient statistics - Fixed response handling
    getStats: async (): Promise<PatientServiceResponse<PatientStats>> => {
        try {
            console.log('📊 Fetching patient statistics from:', `${API_PREFIX}/stats`)

            const response = await apiClient.get(`${API_PREFIX}/stats`)

            console.log('📊 Raw stats response:', response.data)

            if (response.data?.success) {
                console.log('✅ Stats retrieved successfully:', response.data.data)
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Statistics retrieved successfully'
                }
            } else {
                console.error('❌ Stats request failed:', response.data)
                return {
                    success: false,
                    error: response.data?.error || response.data?.message || 'Failed to fetch statistics',
                    message: response.data?.message || 'Failed to fetch statistics'
                }
            }
        } catch (error: unknown) {
            console.error('❌ Error fetching stats:', error)
            
            return {
                success: false,
                error: handleApiError(error),
                message: 'Failed to fetch statistics'
            }
        }
    }
}

export type {
    Patient,
    PatientSearchQuery,
    PatientListResponse,
    PatientDetailResponse,
    PatientStats
}