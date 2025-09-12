import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Sparkles, Mail, Lock, CreditCard, Fingerprint, UserCheck, Stethoscope, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { authService } from "@/services/auth"
import { toast } from "sonner"

type LoginFormValues = {
    email: string
    nik: string
    password: string
    rememberMe: boolean
    userType: 'admin' | 'doctor'
}

type RegisterFormValues = {
    email: string
    password: string
    confirmPassword: string
    fullName: string
    rememberMe: boolean
}

export default function AuthPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fingerprintLoading, setFingerprintLoading] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const navigate = useNavigate()

    const loginForm = useForm<LoginFormValues>({
        defaultValues: {
            email: "",
            nik: "",
            password: "",
            rememberMe: false,
            userType: 'admin'
        },
    })

    const registerForm = useForm<RegisterFormValues>({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            rememberMe: false,
        },
    })

    // Login handlers
    const handleEmailLogin = async (values: LoginFormValues) => {
        if (!values.email || !values.password) {
            toast.error("Email dan password wajib diisi")
            return
        }

        setIsLoading(true)
        try {
            let response
            if (values.userType === 'admin') {
                response = await authService.loginAdmin({
                    email: values.email,
                    password: values.password,
                })
            } else {
                response = await authService.loginDoctor({
                    email: values.email,
                    password: values.password,
                })
            }

            toast.success("Login berhasil!")
            navigate("/dashboard") // Single dashboard for all roles
        } catch (error: any) {
            toast.error(error.message || "Login gagal")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNikLogin = async (values: LoginFormValues) => {
        if (!values.nik || !values.password) {
            toast.error("NIK dan password wajib diisi")
            return
        }

        if (values.userType === 'admin') {
            toast.error("Admin tidak bisa login dengan NIK, gunakan email")
            return
        }

        setIsLoading(true)
        try {
            const response = await authService.loginDoctor({
                nik: values.nik,
                password: values.password,
            })

            toast.success("Login berhasil!")
            navigate("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Login gagal")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFingerprintLogin = async (userType: 'admin' | 'doctor') => {
        setFingerprintLoading(true)
        try {
            // Simulate fingerprint scan
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Mock fingerprint data - replace with actual fingerprint SDK
            const mockFingerprintData = `${userType.toUpperCase()}_FINGERPRINT_` + Date.now()
            
            let response
            if (userType === 'admin') {
                response = await authService.loginAdmin({
                    fingerprintData: mockFingerprintData,
                })
            } else {
                response = await authService.loginDoctor({
                    fingerprintData: mockFingerprintData,
                })
            }

            toast.success("Login fingerprint berhasil!")
            navigate("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Fingerprint tidak dikenali")
        } finally {
            setFingerprintLoading(false)
        }
    }

    // Register handler
    const handleRegister = async (values: RegisterFormValues) => {
        if (values.password !== values.confirmPassword) {
            toast.error("Password tidak sama")
            return
        }

        setIsLoading(true)
        try {
            // Mock register - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success("Registrasi berhasil!")
            setAuthMode('login')
        } catch (error: any) {
            toast.error(error.message || "Registrasi gagal")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Sparkles className="text-white text-xl" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            {authMode === 'login' ? 'Login HospitaLink' : 'Daftar Akun'}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                            {authMode === 'login' ? 'Masuk ke sistem HospitaLink' : 'Buat akun baru'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {authMode === 'login' ? (
                            <Tabs defaultValue="email" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </TabsTrigger>
                                    <TabsTrigger value="nik" className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        NIK
                                    </TabsTrigger>
                                    <TabsTrigger value="fingerprint" className="flex items-center gap-2">
                                        <Fingerprint className="w-4 h-4" />
                                        Sidik Jari
                                    </TabsTrigger>
                                </TabsList>

                                {/* Email Login */}
                                <TabsContent value="email">
                                    <Form {...loginForm}>
                                        <div className="space-y-4">
                                            {/* User Type Selection */}
                                            <FormField
                                                control={loginForm.control}
                                                name="userType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold">Login Sebagai</FormLabel>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button
                                                                type="button"
                                                                variant={field.value === 'admin' ? 'default' : 'outline'}
                                                                className="justify-start"
                                                                onClick={() => field.onChange('admin')}
                                                            >
                                                                <Shield className="w-4 h-4 mr-2" />
                                                                Admin
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant={field.value === 'doctor' ? 'default' : 'outline'}
                                                                className="justify-start"
                                                                onClick={() => field.onChange('doctor')}
                                                            >
                                                                <Stethoscope className="w-4 h-4 mr-2" />
                                                                Dokter
                                                            </Button>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                rules={{
                                                    required: "Email wajib diisi",
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: "Email tidak valid",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4" />
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="Masukkan email"
                                                                className="h-12"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                rules={{
                                                    required: "Password wajib diisi",
                                                    minLength: {
                                                        value: 6,
                                                        message: "Password minimal 6 karakter",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Lock className="w-4 h-4" />
                                                            Password
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Masukkan password"
                                                                    className="h-12 pr-12"
                                                                    {...field}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                onClick={loginForm.handleSubmit(handleEmailLogin)}
                                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Memproses..." : "Login dengan Email"}
                                            </Button>
                                        </div>
                                    </Form>
                                </TabsContent>

                                {/* NIK Login (Doctor Only) */}
                                <TabsContent value="nik">
                                    <Form {...loginForm}>
                                        <div className="space-y-4">
                                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="text-sm text-blue-700 dark:text-blue-300">NIK login khusus untuk Dokter</p>
                                            </div>

                                            <FormField
                                                control={loginForm.control}
                                                name="nik"
                                                rules={{
                                                    required: "NIK wajib diisi",
                                                    pattern: {
                                                        value: /^\d{16}$/,
                                                        message: "NIK harus 16 digit angka",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4" />
                                                            NIK
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                placeholder="Masukkan 16 digit NIK"
                                                                className="h-12"
                                                                maxLength={16}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                rules={{
                                                    required: "Password wajib diisi",
                                                }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Lock className="w-4 h-4" />
                                                            Password
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Masukkan password"
                                                                    className="h-12 pr-12"
                                                                    {...field}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                onClick={loginForm.handleSubmit(handleNikLogin)}
                                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Memproses..." : "Login dengan NIK"}
                                            </Button>
                                        </div>
                                    </Form>
                                </TabsContent>

                                {/* Fingerprint Login */}
                                <TabsContent value="fingerprint">
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full flex items-center justify-center mb-4">
                                                <Fingerprint className={`w-12 h-12 text-blue-600 ${fingerprintLoading ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <h3 className="text-lg font-semibold">Scan Sidik Jari</h3>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Pilih role dan scan sidik jari untuk login
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => handleFingerprintLogin('admin')}
                                                variant="outline"
                                                className="h-16 flex-col"
                                                disabled={fingerprintLoading}
                                            >
                                                <Shield className="w-5 h-5 mb-1" />
                                                Admin
                                            </Button>
                                            <Button
                                                onClick={() => handleFingerprintLogin('doctor')}
                                                variant="outline"
                                                className="h-16 flex-col"
                                                disabled={fingerprintLoading}
                                            >
                                                <Stethoscope className="w-5 h-5 mb-1" />
                                                Dokter
                                            </Button>
                                        </div>

                                        {fingerprintLoading && (
                                            <div className="text-center">
                                                <div className="inline-flex items-center gap-2 text-blue-600">
                                                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                                                    Scanning...
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            // Register Form
                            <Form {...registerForm}>
                                <div className="space-y-4">
                                    <FormField
                                        control={registerForm.control}
                                        name="fullName"
                                        rules={{ required: "Nama lengkap wajib diisi" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <UserCheck className="w-4 h-4" />
                                                    Nama Lengkap
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Masukkan nama lengkap"
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        rules={{
                                            required: "Email wajib diisi",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Email tidak valid",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Masukkan email"
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        rules={{
                                            required: "Password wajib diisi",
                                            minLength: {
                                                value: 6,
                                                message: "Password minimal 6 karakter",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Lock className="w-4 h-4" />
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Masukkan password"
                                                            className="h-12 pr-12"
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={registerForm.control}
                                        name="confirmPassword"
                                        rules={{
                                            required: "Konfirmasi password wajib diisi",
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Lock className="w-4 h-4" />
                                                    Konfirmasi Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Ulangi password"
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        onClick={registerForm.handleSubmit(handleRegister)}
                                        className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Memproses..." : "Daftar Akun"}
                                    </Button>
                                </div>
                            </Form>
                        )}

                        {/* Toggle Auth Mode */}
                        <div className="mt-6 text-center">
                            <span className="text-sm text-muted-foreground">
                                {authMode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                            </span>
                            <Button
                                variant="link"
                                className="p-0 h-auto ml-1 font-semibold"
                                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                            >
                                {authMode === 'login' ? 'Daftar di sini' : 'Login di sini'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}