export const sensorNIK = (nik: string | null | undefined): string => {
  if (!nik) return '-'
  
  // Format: 3201****789001 (sensor 4 digit di tengah)
  if (nik.length >= 8) {
    const start = nik.substring(0, 4)
    const end = nik.substring(nik.length - 4)
    return `${start}****${end}`
  }
  
  return nik
}

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}