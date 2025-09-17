// Base Medication interface from Prisma schema
export interface Medication {
  id: string;
  medicationCode: string;
  genericName: string;
  brandName: string | null;
  category: string;
  dosageForm: string;
  strength: string;
  unit: string;
  manufacturer: string | null;
  description: string | null;
  indications: string | null;
  contraindications: string | null;
  sideEffects: string | null;
  dosageInstructions: string | null;
  pricePerUnit: number; // Decimal converted to number
  stock: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
  requiresPrescription: boolean;
  isControlled: boolean;
  createdAt: string; // DateTime as ISO string
  updatedAt: string; // DateTime as ISO string
  createdBy: string | null;
}

// Extended interface with calculated fields from backend
export interface MedicationWithStatus extends Medication {
  stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
  stockPercentage: number;
  daysLeft?: number; // Only for low stock medications
}

// Create/Update interfaces
export interface CreateMedicationRequest {
  medicationCode: string;
  genericName: string;
  brandName?: string;
  category: string;
  dosageForm: string;
  strength: string;
  unit: string;
  manufacturer?: string;
  description?: string;
  indications?: string;
  contraindications?: string;
  sideEffects?: string;
  dosageInstructions?: string;
  pricePerUnit: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  requiresPrescription?: boolean;
  isControlled?: boolean;
}

export interface UpdateMedicationRequest {
  medicationCode?: string;
  genericName?: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  manufacturer?: string;
  description?: string;
  indications?: string;
  contraindications?: string;
  sideEffects?: string;
  dosageInstructions?: string;
  pricePerUnit?: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  requiresPrescription?: boolean;
  isControlled?: boolean;
  isActive?: boolean;
}

// Stock update interface
export interface UpdateStockRequest {
  stock: number;
  operation?: 'set' | 'add' | 'subtract';
}

export interface UpdateStockResponse {
  id: string;
  genericName: string;
  previousStock: number;
  newStock: number;
  stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
}

// Query parameters for filtering and pagination
export interface MedicationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: string | boolean;
  requiresPrescription?: string | boolean;
  isControlled?: string | boolean;
  sortBy?: 'genericName' | 'brandName' | 'category' | 'pricePerUnit' | 'stock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Category filter interface
export interface CategoryFilter {
  name: string;
  count: number;
}

// Summary statistics interface
export interface MedicationSummary {
  total: number;
  active: number;
  lowStock: number;
  prescriptionOnly: number;
  controlled: number;
}

// Statistics interfaces
export interface MedicationOverview {
  total: number;
  active: number;
  inactive: number;
  prescriptionOnly: number;
  controlled: number;
  lowStock: number;
}

export interface CategoryStats {
  name: string;
  count: number;
  totalStock: number;
}

export interface InventoryStats {
  totalStockUnits: number;
}

export interface MedicationStatistics {
  overview: MedicationOverview;
  categories: CategoryStats[];
  inventory: InventoryStats;
}

// API Response interfaces
export interface MedicationListResponse {
  success: boolean;
  message: string;
  data: {
    medications: MedicationWithStatus[];
    pagination: Pagination;
    filters: {
      categories: CategoryFilter[];
    };
    summary: MedicationSummary;
  };
}

export interface MedicationResponse {
  success: boolean;
  message: string;
  data: MedicationWithStatus;
}

export interface MedicationStatisticsResponse {
  success: boolean;
  message: string;
  data: MedicationStatistics;
}

export interface LowStockResponse {
  success: boolean;
  message: string;
  data: {
    medications: MedicationWithStatus[];
    count: number;
  };
}

export interface UpdateStockResponseData {
  success: boolean;
  message: string;
  data: UpdateStockResponse;
}

// Error interface
export interface MedicationError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Form validation interface
export interface MedicationFormErrors {
  medicationCode?: string;
  genericName?: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  manufacturer?: string;
  description?: string;
  indications?: string;
  contraindications?: string;
  sideEffects?: string;
  dosageInstructions?: string;
  pricePerUnit?: string;
  stock?: string;
  minStock?: string;
  maxStock?: string;
}

// Constants for dropdown options
export const MEDICATION_CATEGORIES = [
  'Antibiotic',
  'Analgesic',
  'Cardiovascular',
  'Gastrointestinal',
  'Respiratory',
  'Antidiabetic',
  'Vitamin',
  'Antacid',
  'Topical',
  'Other'
] as const;

export const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream',
  'Ointment',
  'Inhaler',
  'Drops',
  'Patch'
] as const;

export const UNITS = [
  'mg',
  'mcg',
  'g',
  'ml',
  'IU',
  '%',
  'mcg/puff'
] as const;

export type MedicationCategory = typeof MEDICATION_CATEGORIES[number];
export type DosageForm = typeof DOSAGE_FORMS[number];
export type Unit = typeof UNITS[number];