import api from '@/types/api';

// Types
export interface LoginCredentials {
  email?: string;
  nik?: string;
  password?: string;
  fingerprintData?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  isOnDuty: boolean;
  userId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    admin?: User;
    doctor?: Doctor;
    loginMethod: 'email' | 'nik' | 'fingerprint';
  };
}

export interface DashboardStats {
  totalUsers?: number;
  totalDoctors?: number;
  todayQueues?: number;
  todayConsultations?: number;
  activeDoctors?: number;
  // Doctor specific stats
  totalToday?: number;
  completedToday?: number;
  waitingToday?: number;
  pendingConsultations?: number;
}

// Auth service class
class AuthService {
  // Admin login
  async loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/web/admin/login', credentials);
    
    if (response.data.success) {
      // Store role in localStorage for role detection
      localStorage.setItem('userRole', 'ADMIN');
      localStorage.setItem('user', JSON.stringify(response.data.data.admin));
    }
    
    return response.data;
  }

  // Doctor login
  async loginDoctor(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/web/doctor/login', credentials);
    
    if (response.data.success) {
      // Store role in localStorage for role detection
      localStorage.setItem('userRole', 'DOCTOR');
      localStorage.setItem('user', JSON.stringify(response.data.data.doctor));
    }
    
    return response.data;
  }

  // Get admin dashboard
  async getAdminDashboard() {
    const response = await api.get('/api/web/admin/dashboard');
    return response.data;
  }

  // Get doctor dashboard
  async getDoctorDashboard() {
    const response = await api.get('/api/web/doctor/dashboard');
    return response.data;
  }

  // Logout (universal)
  async logout() {
    const userRole = this.getUserRole();
    
    if (userRole === 'ADMIN') {
      await api.post('/api/web/admin/logout');
    } else if (userRole === 'DOCTOR') {
      await api.post('/api/web/doctor/logout');
    }
    
    // Clear local storage
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }

  // Get current user role (helper method)
  getUserRole(): 'ADMIN' | 'DOCTOR' | null {
    return localStorage.getItem('userRole') as 'ADMIN' | 'DOCTOR' | null;
  }

  // Get current user data
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getUserRole() && !!this.getCurrentUser();
  }
}

export const authService = new AuthService();
export default authService;