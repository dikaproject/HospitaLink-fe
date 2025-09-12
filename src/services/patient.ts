import {
    type Patient,
    type PatientFormValues,
    type PatientCreate,
    type PatientUpdate,
    type PatientSearchQuery,
    type PatientFilterOptions,
    type PatientServiceResponse,
    type PatientListResponse,
    type PatientDetailResponse,
    type PatientCreateResponse,
    type PatientUpdateResponse,
    type PatientDeleteResponse,
    type PatientStats,
    type Gender
} from "@/types/patient"

// Constants
const STORAGE_KEY = "hospitalink_patients"

// Helper functions untuk localStorage
const getPatientsFromStorage = (): Patient[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch (error) {
        console.error("Error reading patients from localStorage:", error)
        return []
    }
}

const savePatientsToStorage = (patients: Patient[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
    } catch (error) {
        console.error("Error saving patients to localStorage:", error)
    }
}

// Initialize dengan data dummy jika storage kosong
const initializeWithDummyData = (): Patient[] => {
    const existingData = getPatientsFromStorage()
    if (existingData.length === 0) {
        const dummyData: Patient[] = [
            {
                id: crypto.randomUUID(),
                name: "Budi Santoso",
                nik: "3173xxxxxxxx001",
                birthDate: "1990-05-20",
                gender: "L",
                phone: "081234567890",
                address: "Jl. Merdeka No. 1, Jakarta",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: crypto.randomUUID(),
                name: "Siti Aminah",
                nik: "3173xxxxxxxx002",
                birthDate: "1992-08-11",
                gender: "P",
                phone: "081298765432",
                address: "Jl. Sudirman No. 12, Bandung",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: crypto.randomUUID(),
                name: "Ahmad Rizki",
                nik: "3173xxxxxxxx003",
                birthDate: "1985-12-03",
                gender: "L",
                phone: "081345678901",
                address: "Jl. Gatot Subroto No. 45, Surabaya",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
        savePatientsToStorage(dummyData)
        return dummyData
    }
    return existingData
}

// Utility functions
const createSuccessResponse = <T>(data: T, message?: string): PatientServiceResponse<T> => ({
    success: true,
    data,
    message
})

const createErrorResponse = <T>(error: string): PatientServiceResponse<T> => ({
    success: false,
    error
})

// Core CRUD Operations
export const patientService = {
    // Get all patients
    getAll: (): PatientListResponse => {
        try {
            const patients = getPatientsFromStorage()
            if (patients.length === 0) {
                const dummyPatients = initializeWithDummyData()
                return createSuccessResponse(dummyPatients, "Data dummy berhasil dimuat")
            }
            return createSuccessResponse(patients, "Data pasien berhasil dimuat")
        } catch (error) {
            console.error("Error loading patients:", error)
            return createErrorResponse<Patient[]>("Gagal memuat data pasien")
        }
    },

    // Get patient by ID
    getById: (id: string): PatientDetailResponse => {
        try {
            const patients = getPatientsFromStorage()
            const patient = patients.find(p => p.id === id)

            if (!patient) {
                return createErrorResponse<Patient>("Pasien tidak ditemukan")
            }

            return createSuccessResponse(patient, "Detail pasien berhasil dimuat")
        } catch (error) {
            console.error("Error getting patient by ID:", error)
            return createErrorResponse<Patient>("Gagal memuat detail pasien")
        }
    },

    // Create new patient
    create: (data: PatientCreate): PatientCreateResponse => {
        try {
            const patients = getPatientsFromStorage()
            const newPatient: Patient = {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            const updatedPatients = [newPatient, ...patients]
            savePatientsToStorage(updatedPatients)

            return createSuccessResponse(newPatient, "Pasien berhasil ditambahkan")
        } catch (error) {
            console.error("Error creating patient:", error)
            return createErrorResponse<Patient>("Gagal menambahkan pasien")
        }
    },

    // Update patient
    update: (id: string, data: PatientFormValues): PatientUpdateResponse => {
        try {
            const patients = getPatientsFromStorage()
            const patientIndex = patients.findIndex(p => p.id === id)

            if (patientIndex === -1) {
                return createErrorResponse<Patient>("Pasien tidak ditemukan")
            }

            const updatedPatient: Patient = {
                ...patients[patientIndex],
                ...data,
                id, // Ensure ID doesn't change
                updatedAt: new Date().toISOString(),
            }

            patients[patientIndex] = updatedPatient
            savePatientsToStorage(patients)

            return createSuccessResponse(updatedPatient, "Data pasien berhasil diperbarui")
        } catch (_error) {
            return createErrorResponse<Patient>("Gagal memperbarui data pasien")
        }
    },

    // Delete patient
    delete: (id: string): PatientDeleteResponse => {
        try {
            const patients = getPatientsFromStorage()
            const filteredPatients = patients.filter(p => p.id !== id)

            if (filteredPatients.length === patients.length) {
                return createErrorResponse<boolean>("Pasien tidak ditemukan")
            }

            savePatientsToStorage(filteredPatients)
            return createSuccessResponse(true, "Pasien berhasil dihapus")
        } catch (error) {
            return createErrorResponse<boolean>("Gagal menghapus pasien")
        }
    },

    // Search patients
    search: (query: PatientSearchQuery): PatientListResponse => {
        try {
            const patients = getPatientsFromStorage()
            let filtered = patients

            // Text search
            if (query.query.trim()) {
                const q = query.query.trim().toLowerCase()
                filtered = filtered.filter(patient =>
                    [patient.name, patient.nik, patient.phone, patient.address].some(
                        field => field.toLowerCase().includes(q)
                    )
                )
            }

            // Gender filter
            if (query.gender) {
                filtered = filtered.filter(patient => patient.gender === query.gender)
            }

            // Limit results
            if (query.limit) {
                filtered = filtered.slice(0, query.limit)
            }

            return createSuccessResponse(filtered, "Pencarian berhasil")
        } catch (error) {
            return createErrorResponse<Patient[]>("Gagal melakukan pencarian")
        }
    },

    // Advanced filtering
    filter: (options: PatientFilterOptions): PatientListResponse => {
        try {
            let patients = getPatientsFromStorage()

            // Gender filter
            if (options.gender) {
                patients = patients.filter(p => p.gender === options.gender)
            }

            // Date range filter
            if (options.dateRange) {
                const { start, end } = options.dateRange
                patients = patients.filter(p => {
                    const createdAt = new Date(p.createdAt)
                    return createdAt >= new Date(start) && createdAt <= new Date(end)
                })
            }

            // Sorting
            if (options.sortBy) {
                patients.sort((a, b) => {
                    let aValue: string | Date
                    let bValue: string | Date

                    switch (options.sortBy) {
                        case 'name':
                            aValue = a.name
                            bValue = b.name
                            break
                        case 'createdAt':
                            aValue = new Date(a.createdAt)
                            bValue = new Date(b.createdAt)
                            break
                        case 'updatedAt':
                            aValue = new Date(a.updatedAt)
                            bValue = new Date(b.updatedAt)
                            break
                        default:
                            aValue = a.name
                            bValue = b.name
                    }

                    if (options.sortOrder === 'desc') {
                        return aValue > bValue ? -1 : 1
                    }
                    return aValue < bValue ? -1 : 1
                })
            }

            return createSuccessResponse(patients, "Filter berhasil diterapkan")
        } catch (error) {
            return createErrorResponse<Patient[]>("Gagal menerapkan filter")
        }
    },

    // Get statistics
    getStats: (): PatientServiceResponse<PatientStats> => {
        try {
            const patients = getPatientsFromStorage()
            const male = patients.filter(p => p.gender === 'L').length
            const female = patients.filter(p => p.gender === 'P').length

            // Recent added (last 7 days)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            const recentAdded = patients.filter(p =>
                new Date(p.createdAt) >= sevenDaysAgo
            ).length

            const stats: PatientStats = {
                total: patients.length,
                male,
                female,
                recentAdded
            }

            return createSuccessResponse(stats, "Statistik berhasil dimuat")
        } catch (error) {
            return createErrorResponse<PatientStats>("Gagal memuat statistik")
        }
    },

    // Utility methods
    clearAll: (): PatientServiceResponse<void> => {
        try {
            localStorage.removeItem(STORAGE_KEY)
            return createSuccessResponse(undefined, "Semua data berhasil dihapus")
        } catch (error) {
            return createErrorResponse<void>("Gagal menghapus semua data")
        }
    },

    getCount: (): PatientServiceResponse<number> => {
        try {
            const patients = getPatientsFromStorage()
            return createSuccessResponse(patients.length, "Jumlah pasien berhasil dihitung")
        } catch (error) {
            return createErrorResponse<number>("Gagal menghitung jumlah pasien")
        }
    },

    getByGender: (gender: Gender): PatientListResponse => {
        try {
            const patients = getPatientsFromStorage()
            const filtered = patients.filter(p => p.gender === gender)
            return createSuccessResponse(filtered, `Data pasien ${gender === 'L' ? 'laki-laki' : 'perempuan'} berhasil dimuat`)
        } catch (error) {
            return createErrorResponse<Patient[]>("Gagal memuat data berdasarkan gender")
        }
    },

    getRecent: (limit: number = 10): PatientListResponse => {
        try {
            const patients = getPatientsFromStorage()
            const recent = patients
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit)

            return createSuccessResponse(recent, "Data pasien terbaru berhasil dimuat")
        } catch (error) {
            return createErrorResponse<Patient[]>("Gagal memuat data pasien terbaru")
        }
    }
}

// Export types for convenience
export type {
    Patient,
    PatientFormValues,
    PatientCreate,
    PatientUpdate,
    PatientSearchQuery,
    PatientFilterOptions,
    PatientServiceResponse,
    PatientListResponse,
    PatientDetailResponse,
    PatientCreateResponse,
    PatientUpdateResponse,
    PatientDeleteResponse,
    PatientStats
}
