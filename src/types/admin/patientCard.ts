// Base types matching Prisma User schema
export type Gender = "MALE" | "FEMALE"

export type Role = "USER" | "PATIENT" | "DOCTOR" | "ADMIN" | "FAMILY_MEMBER"

export type FamilyRelation = "SELF" | "SPOUSE" | "CHILD" | "PARENT" | "GRANDPARENT" | "SIBLING" | "OTHER"

export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type QueueStatus = "WAITING" | "CALLED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type PaymentStatus = "PENDING" | "PAID" | "FAILED"

export type PaymentMethod = "CASH" | "BPJS" | "INSURANCE" | "CREDIT_CARD"

export type NotificationType = "QUEUE" | "APPOINTMENT" | "LAB_RESULT" | "PAYMENT" | "SYSTEM" | "CONSULTATION"

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW"

// Patient types based on Prisma User model
export interface Patient {
  id: string
  email: string
  role: Role
  nik?: string | null
  fullName: string
  phone?: string | null
  gender?: Gender | null
  dateOfBirth?: string | null
  qrCode?: string | null
  fingerprintData?: string | null
  profilePicture?: string | null
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string | null
  createdAt: string
  updatedAt: string
  // Address fields
  street?: string | null
  village?: string | null
  district?: string | null
  regency?: string | null
  province?: string | null
}
