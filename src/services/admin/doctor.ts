import api from '@/types/api';
import type {
  DoctorResponse,
  DoctorDetailResponse,
  DoctorSearchResponse,
  CreateDoctorData,
  UpdateDoctorData,
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
};

export default doctorService;