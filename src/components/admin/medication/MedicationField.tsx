import { ReactNode } from 'react'
import { Label } from "@/components/ui/label"

interface MedicationFieldProps {
  label: string
  required?: boolean
  error?: string
  description?: string
  children: ReactNode
}

export function MedicationField({ 
  label, 
  required = false, 
  error, 
  description, 
  children 
}: MedicationFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {children}
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}