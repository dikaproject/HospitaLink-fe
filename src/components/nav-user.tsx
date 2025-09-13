// Update: hospitalink-fe/src/components/nav-user.tsx - Enhanced styling
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  onLogout: () => void
}

export function NavUser({ user, onLogout }: NavUserProps) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-white dark:ring-gray-800 shadow-md transition-all duration-200 group-hover:ring-blue-200 dark:group-hover:ring-blue-800">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </span>
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 transition-transform duration-200 group-hover:scale-110 text-gray-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg ring-2 ring-blue-100 dark:ring-blue-900">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-200 group">
                <Sparkles className="mr-3 h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <span className="font-medium">Profil Saya</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/50 dark:hover:to-emerald-950/50 transition-all duration-200 group">
                <BadgeCheck className="mr-3 h-4 w-4 text-green-500 group-hover:text-green-600 transition-colors" />
                <span className="font-medium">Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-950/50 dark:hover:to-orange-950/50 transition-all duration-200 group">
                <Bell className="mr-3 h-4 w-4 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
                <span className="font-medium">Notifikasi</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            <DropdownMenuItem 
              className="cursor-pointer rounded-lg text-red-600 focus:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 transition-all duration-200 group m-1"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}