import api from '@/types/api';
import type {
  DoctorResponse,
  DoctorDetailResponse,
  DoctorSearchResponse,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorAttendanceResponse,
} from '@/types/admin/doctor';

export const doctorService = {
  // Get all doctors with pagination
  getDoctors: async (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<DoctorResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get(`/api/web/admin/doctors?${params}`);
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (id: string): Promise<DoctorDetailResponse> => {
    const response = await api.get(`/api/web/admin/doctors/${id}`);
    return response.data;
  },

  // Search doctors
  searchDoctors: async (query: string): Promise<DoctorSearchResponse> => {
    const response = await api.get(`/api/web/admin/doctors/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Create new doctor
  createDoctor: async (data: CreateDoctorData) => {
    const response = await api.post('/api/web/admin/doctors', data);
    return response.data;
  },

  // Update doctor
  updateDoctor: async (id: string, data: UpdateDoctorData) => {
    const response = await api.put(`/api/web/admin/doctors/${id}`, data);
    return response.data;
  },

  // Delete/deactivate doctor
  deleteDoctor: async (id: string) => {
    const response = await api.delete(`/api/web/admin/doctors/${id}`);
    return response.data;
  },

  // Get doctors attendance (who are on duty/available)
  getDoctorsAttendance: async (
    page: number = 1,
    limit: number = 50,
    search: string = '',
    specialty: string = 'ALL',
    status: 'ALL' | 'ON_DUTY' | 'AVAILABLE' | 'OFFLINE' = 'ALL'
  ): Promise<DoctorAttendanceResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(specialty !== 'ALL' && { specialty }),
      ...(status !== 'ALL' && { status }),
    });

    const response = await api.get(`/api/web/admin/doctors/attendance?${params}`);
    return response.data;
  },

  // Update doctor duty status
  updateDoctorDutyStatus: async (id: string, isOnDuty: boolean) => {
    const response = await api.patch(`/api/web/admin/doctors/${id}/duty-status`, {
      isOnDuty
    });
    return response.data;
  },

  // Update doctor availability
  updateDoctorAvailability: async (id: string, isAvailable: boolean) => {
    const response = await api.patch(`/api/web/admin/doctors/${id}/availability`, {
      isAvailable
    });
    return response.data;
  },
};

export default doctorService;