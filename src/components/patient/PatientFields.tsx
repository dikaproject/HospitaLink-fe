import { useForm } from "react-hook-form"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export type PatientFormValues = {
  id?: string
  name: string
  nik: string
  birthDate: string
  gender: "L" | "P"
  phone: string
  address: string
}

export function FieldText({
  name,
  label,
  form,
  required,
}: {
  name: keyof PatientFormValues
  label: string
  form: ReturnType<typeof useForm<PatientFormValues>>
  required?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      rules={{ required: required ? "Wajib diisi" : false }}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input 
              {...field} 
              className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function FieldDate({
  name,
  label,
  form,
  required,
}: {
  name: keyof PatientFormValues
  label: string
  form: ReturnType<typeof useForm<PatientFormValues>>
  required?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      rules={{ required: required ? "Wajib diisi" : false }}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input 
              type="date" 
              {...field} 
              className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function FieldSelectGender({
  name,
  label,
  form,
}: {
  name: keyof PatientFormValues
  label: string
  form: ReturnType<typeof useForm<PatientFormValues>>
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
            {label}
          </FormLabel>
          <FormControl>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    className="sr-only"
                    value="L"
                    checked={field.value === "L"}
                    onChange={() => field.onChange("L")}
                  />
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                    field.value === "L" 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500"
                  }`}>
                    {field.value === "L" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Laki-laki
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    className="sr-only"
                    value="P"
                    checked={field.value === "P"}
                    onChange={() => field.onChange("P")}
                  />
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                    field.value === "P" 
                      ? "border-pink-500 bg-pink-500" 
                      : "border-gray-300 dark:border-gray-600 group-hover:border-pink-400 dark:group-hover:border-pink-500"
                  }`}>
                    {field.value === "P" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Perempuan
                </span>
              </label>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  )
}


