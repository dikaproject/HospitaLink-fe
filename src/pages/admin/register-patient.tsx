import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Loader2,
    Upload,
    User,
    Mail,
    Calendar,
    MapPin,
    Camera,
    QrCode,
    Phone,
    CreditCard,
    UserPlus,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react'
import { toast } from 'sonner'
import { patientService } from '@/services/admin/patient'
import type { PatientCreate, Gender } from '@/types/admin/patient'

interface PatientRegisterForm {
    nik: string
    fullName: string
    gender?: Gender
    dateOfBirth: string
    phone?: string
    qrCode?: string
    profilePicture?: File | null
    street?: string
    village?: string
    district?: string
    regency?: string
    province?: string
    email?: string
    password?: string
    useCustomEmail: boolean
}

const RegisterPatient = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [profilePreview, setProfilePreview] = useState<string>('')
    const [showPassword, setShowPassword] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    const [formData, setFormData] = useState<PatientRegisterForm>({
        nik: '',
        fullName: '',
        gender: undefined,
        dateOfBirth: '',
        phone: '',
        qrCode: '',
        profilePicture: null,
        street: '',
        village: '',
        district: '',
        regency: '',
        province: '',
        email: '',
        password: '',
        useCustomEmail: false
    })

    // Generate auto email and password - FIXED
    const generateCredentials = (fullName: string, nik: string) => {
        const cleanName = fullName.toLowerCase().replace(/\s+/g, "")
        const nikSuffix = nik.slice(-4)
        const email = `${cleanName}${nikSuffix}@hospitalink.com`
        const password = `${cleanName.charAt(0).toUpperCase()}${cleanName.slice(1)}${nikSuffix}!`
        return { email, password }
    }

    // Handle input changes
    const handleInputChange = (field: keyof PatientRegisterForm, value: string | boolean | File | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Auto generate credentials when name or NIK changes (if not using custom email)
        if ((field === 'fullName' || field === 'nik') && !formData.useCustomEmail) {
            const name = field === 'fullName' ? value as string : formData.fullName
            const nik = field === 'nik' ? value as string : formData.nik

            if (name && nik && nik.length >= 4) {
                const credentials = generateCredentials(name, nik)
                setFormData(prev => ({
                    ...prev,
                    email: credentials.email,
                    password: credentials.password
                }))
            }
        }
    }

    // Handle profile picture upload
    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('File harus berupa gambar')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB')
                return
            }

            setFormData(prev => ({ ...prev, profilePicture: file }))

            const reader = new FileReader()
            reader.onload = (e) => {
                setProfilePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Generate QR Code
    const generateQRCode = () => {
        const qrData = `PATIENT_${formData.nik}_${Date.now()}`
        setFormData(prev => ({ ...prev, qrCode: qrData }))
        toast.success('QR Code berhasil di-generate')
    }

    // Validate form
    const validateForm = (): string[] => {
        const errors: string[] = []

        if (!formData.nik || formData.nik.length !== 16) {
            errors.push('NIK harus 16 digit')
        }

        if (!formData.fullName || formData.fullName.length < 2) {
            errors.push('Nama lengkap minimal 2 karakter')
        }

        if (formData.fullName && !/^[a-zA-Z\s.-]+$/.test(formData.fullName)) {
            errors.push("Nama hanya boleh mengandung huruf, spasi, titik, dan tanda hubung")
        }

        if (!formData.dateOfBirth) {
            errors.push('Tanggal lahir harus diisi')
        } else {
            const birthDate = new Date(formData.dateOfBirth)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            if (age > 150 || birthDate > today) {
                errors.push('Tanggal lahir tidak valid')
            }
        }

        if (formData.useCustomEmail) {
            if (!formData.email) {
                errors.push('Email harus diisi')
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                errors.push('Format email tidak valid')
            }

            if (!formData.password || formData.password.length < 6) {
                errors.push('Password minimal 6 karakter')
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                errors.push("Password harus mengandung huruf kecil, huruf besar, dan angka")
            }
        } else {
            if (!formData.email || !formData.password) {
                errors.push('Kredensial auto-generate gagal, periksa nama dan NIK')
            }
            if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                errors.push("Password yang di-generate tidak memenuhi kriteria keamanan")
            }
        }

        if (formData.phone && !/^(08|8)[0-9]{8,11}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            errors.push("Format nomor telepon tidak valid (contoh: 08123456789)")
        }

        return errors
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const validationErrors = validateForm()
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '))
            return
        }

        setIsLoading(true)

        try {
            const patientData: PatientCreate = {
                email: formData.email!,
                password: formData.password!,
                fullName: formData.fullName.trim(),
                nik: formData.nik?.trim() || null,
                phone: formData.phone?.trim().replace(/[\s-]/g, '') || null,
                gender: formData.gender || null,
                dateOfBirth: formData.dateOfBirth || null,
                street: formData.street?.trim() || null,
                village: formData.village?.trim() || null,
                district: formData.district?.trim() || null,
                regency: formData.regency?.trim() || null,
                province: formData.province?.trim() || null,
            }

            const response = await patientService.create(patientData)

            if (response.success) {
                toast.success('🎉 Berhasil menambahkan pasien baru!', {
                    description: `Pasien ${formData.fullName} telah terdaftar dengan email: ${formData.email}`,
                    duration: 3000
                })

                setFormData({
                    nik: '',
                    fullName: '',
                    gender: undefined,
                    dateOfBirth: '',
                    phone: '',
                    qrCode: '',
                    profilePicture: null,
                    street: '',
                    village: '',
                    district: '',
                    regency: '',
                    province: '',
                    email: '',
                    password: '',
                    useCustomEmail: false
                })
                setProfilePreview('')

                setTimeout(() => {
                    navigate('/patients')
                }, 2000)

            } else {
                let errorMessage = response.error || 'Gagal mendaftarkan pasien'

                if (response.error && response.error.includes('validation')) {
                    errorMessage = 'Data yang dimasukkan tidak valid. Periksa kembali form.'
                } else if (response.error && response.error.includes('email')) {
                    errorMessage = 'Email sudah digunakan. Gunakan email lain.'
                } else if (response.error && response.error.includes('NIK')) {
                    errorMessage = 'NIK sudah terdaftar. Periksa kembali NIK.'
                }

                setError(errorMessage)
                toast.error('❌ Gagal mendaftarkan pasien', {
                    description: response.message || errorMessage
                })
            }
        } catch (error) {
            console.error('❌ Registration error:', error)
            setError('Terjadi kesalahan sistem')
            toast.error('❌ Terjadi kesalahan sistem')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Registrasi Pasien Baru
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Lengkapi informasi di bawah ini untuk mendaftarkan pasien baru ke sistem HospitaLink
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                            <User className="h-5 w-5" />
                        </div>
                        <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                            <Mail className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="animate-in slide-in-from-top-2 bg-red-900/50 border-red-800 text-red-100">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Personal Information Card */}
                    <Card className="shadow-lg border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-5 w-5" />
                                </div>
                                Data Diri Pasien
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                Informasi identitas dan personal pasien
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6 bg-gray-800/50">
                            {/* Profile Picture Section */}
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        {profilePreview ? (
                                            <img
                                                src={profilePreview}
                                                alt="Preview"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-4 border-gray-600 flex items-center justify-center shadow-lg">
                                                <Camera className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                            className="hidden"
                                            id="profilePicture"
                                        />
                                        <Label
                                            htmlFor="profilePicture"
                                            className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-colors"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <Label className="text-sm font-medium text-gray-200">Foto Profil</Label>
                                    <p className="text-sm text-gray-400">
                                        Upload foto profil pasien (opsional)
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Format: JPG, PNG • Max: 5MB
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-gray-700" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* NIK */}
                                <div className="space-y-2">
                                    <Label htmlFor="nik" className="flex items-center gap-2 text-gray-200">
                                        <CreditCard className="h-4 w-4 text-blue-400" />
                                        NIK <Badge variant="destructive" className="text-xs bg-red-900 text-red-100">Wajib</Badge>
                                    </Label>
                                    <Input
                                        id="nik"
                                        type="text"
                                        placeholder="1234567890123456"
                                        value={formData.nik}
                                        onChange={(e) => handleInputChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        maxLength={16}
                                        className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">16 digit nomor identitas</p>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-200">
                                        <User className="h-4 w-4 text-blue-400" />
                                        Nama Lengkap <Badge variant="destructive" className="text-xs bg-red-900 text-red-100">Wajib</Badge>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        required
                                    />
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-gray-200">
                                        <User className="h-4 w-4 text-blue-400" />
                                        Jenis Kelamin
                                    </Label>
                                    <Select
                                        value={formData.gender || ''}
                                        onValueChange={(value: Gender) => handleInputChange('gender', value)}
                                    >
                                        <SelectTrigger className="h-11 bg-gray-700 border-gray-600 text-white">
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-700 border-gray-600">
                                            <SelectItem value="MALE" className="text-white hover:bg-gray-600">👨 Laki-laki</SelectItem>
                                            <SelectItem value="FEMALE" className="text-white hover:bg-gray-600">👩 Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-gray-200">
                                        <Calendar className="h-4 w-4 text-blue-400" />
                                        Tanggal Lahir <Badge variant="destructive" className="text-xs bg-red-900 text-red-100">Wajib</Badge>
                                    </Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className="h-11 bg-gray-700 border-gray-600 text-white"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2 text-gray-200">
                                        <Phone className="h-4 w-4 text-blue-400" />
                                        Nomor Telepon
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="08123456789"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Format: 08xxxxxxxxx
                                    </p>
                                </div>

                                {/* QR Code */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-gray-200">
                                        <QrCode className="h-4 w-4 text-blue-400" />
                                        QR Code Pasien
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Klik tombol untuk generate"
                                            value={formData.qrCode}
                                            readOnly
                                            className="h-11 bg-gray-600 border-gray-600 text-white placeholder-gray-400"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={generateQRCode}
                                            disabled={!formData.nik || !formData.fullName}
                                            className="h-11 px-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                                        >
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Card */}
                    <Card className="shadow-lg border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                Informasi Alamat
                            </CardTitle>
                            <CardDescription className="text-green-100">
                                Alamat tempat tinggal pasien (opsional)
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6 bg-gray-800/50">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street" className="text-gray-200">Alamat Lengkap</Label>
                                    <Textarea
                                        id="street"
                                        placeholder="Jl. Contoh No. 123, RT 001 RW 002"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        rows={3}
                                        className="resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="village" className="text-gray-200">Desa/Kelurahan</Label>
                                        <Input
                                            id="village"
                                            type="text"
                                            placeholder="Kelurahan ABC"
                                            value={formData.village}
                                            onChange={(e) => handleInputChange('village', e.target.value)}
                                            className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district" className="text-gray-200">Kecamatan</Label>
                                        <Input
                                            id="district"
                                            type="text"
                                            placeholder="Kecamatan XYZ"
                                            value={formData.district}
                                            onChange={(e) => handleInputChange('district', e.target.value)}
                                            className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="regency" className="text-gray-200">Kabupaten/Kota</Label>
                                        <Input
                                            id="regency"
                                            type="text"
                                            placeholder="Kota/Kabupaten"
                                            value={formData.regency}
                                            onChange={(e) => handleInputChange('regency', e.target.value)}
                                            className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="province" className="text-gray-200">Provinsi</Label>
                                        <Input
                                            id="province"
                                            type="text"
                                            placeholder="Provinsi"
                                            value={formData.province}
                                            onChange={(e) => handleInputChange('province', e.target.value)}
                                            className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Credentials Card */}
                    <Card className="shadow-lg border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Mail className="h-5 w-5" />
                                </div>
                                Akun Login
                            </CardTitle>
                            <CardDescription className="text-purple-100">
                                Kredensial untuk akses sistem pasien
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6 bg-gray-800/50">
                            {/* Use Custom Email Checkbox */}
                            <div className="flex items-center space-x-3 p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                                <Checkbox
                                    id="useCustomEmail"
                                    checked={formData.useCustomEmail}
                                    onCheckedChange={(checked) => handleInputChange('useCustomEmail', checked as boolean)}
                                    className="border-blue-400"
                                />
                                <Label htmlFor="useCustomEmail" className="flex items-center gap-2 font-medium text-gray-200">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                    Gunakan email dan password khusus
                                </Label>
                            </div>

                            {formData.useCustomEmail ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-200">
                                            <Mail className="h-4 w-4 text-purple-400" />
                                            Email <Badge variant="destructive" className="text-xs bg-red-900 text-red-100">Wajib</Badge>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contoh@email.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="h-11 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="flex items-center gap-2 text-gray-200">
                                            <Mail className="h-4 w-4 text-purple-400" />
                                            Password <Badge variant="destructive" className="text-xs bg-red-900 text-red-100">Wajib</Badge>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Minimal 6 karakter"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                className="h-11 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Harus mengandung huruf besar, kecil, dan angka
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-6 rounded-lg border border-blue-800">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-200 mb-1">Auto-Generate Kredensial</h4>
                                            <p className="text-sm text-blue-300">
                                                Email dan password akan dibuat otomatis berdasarkan nama dan NIK
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                                            <Label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</Label>
                                            <p className="font-mono text-sm mt-1 text-blue-300">
                                                {formData.email || 'Akan dibuat setelah nama & NIK diisi'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                                            <Label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</Label>
                                            <p className="font-mono text-sm mt-1 text-blue-300">
                                                {formData.password || 'Akan dibuat setelah nama & NIK diisi'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <Card className="shadow-lg border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                        <CardContent className="p-6 bg-gray-800/50">
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/patients')}
                                    disabled={isLoading}
                                    className="flex-1 h-12 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                                >
                                    Batal
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Mendaftarkan Pasien...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Daftarkan Pasien
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}

export default RegisterPatient
