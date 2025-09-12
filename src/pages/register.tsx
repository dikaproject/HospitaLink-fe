import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Sparkles, Mail, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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

type RegisterFormValues = {
    email: string
    password: string
    confirmPassword: string
    rememberMe: boolean
}

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<RegisterFormValues>({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            rememberMe: false,
        },
    })

    const handleSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true)
        // Simulasi register
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("Register values:", values)
        setIsLoading(false)
        alert("Register berhasil!")
        // nanti ganti dengan router.push("/dashboard") setelah integrasi
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Modern gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                    <CardHeader className="space-y-1 text-center pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:rotate-6 group">
                            <Sparkles className="text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Daftar Akun
                        </CardTitle>
                        <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                            Buat akun baru untuk melanjutkan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <div className="space-y-6">
                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{
                                        required: "Email wajib diisi",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
                                            message: "Email tidak valid",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        type="email"
                                                        placeholder="Masukkan email Anda"
                                                        className="h-12 px-4 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-slate-800"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{
                                        required: "Password wajib diisi",
                                        minLength: {
                                            value: 6,
                                            message: "Password minimal 6 karakter",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Masukkan password Anda"
                                                        className="h-12 px-4 pr-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-slate-800"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* Confirm Password */}
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    rules={{
                                        required: "Konfirmasi password wajib diisi",
                                        validate: (value) =>
                                            value === form.getValues("password") || "Password tidak sama",
                                    }}
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Konfirmasi Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Masukkan ulang password Anda"
                                                        className="h-12 px-4 pr-12 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-slate-800"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* Remember Me */}
                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm text-slate-600 dark:text-slate-400">
                                                Ingat saya
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <Button
                                    onClick={form.handleSubmit(handleSubmit)}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Memproses...
                                        </div>
                                    ) : (
                                        "Daftar"
                                    )}
                                </Button>
                            </div>
                        </Form>

                        <div className="mt-8 text-center">
                            <span className="text-slate-600 dark:text-slate-400 text-sm">
                                Sudah punya akun?{" "}
                            </span>
                            <Button
                                variant="link"
                                className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                            >
                                Masuk di sini
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
