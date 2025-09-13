// Update: hospitalink-fe/src/components/nav-projects.tsx - Enhanced styling
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavProjectsProps {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}

export function NavProjects({ projects }: NavProjectsProps) {
  const { isMobile } = useSidebar()
  const location = useLocation()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
        Aksi Cepat
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.url
          
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
                className={`
                  group relative overflow-hidden rounded-lg transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-green-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50' 
                    : 'hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50 dark:hover:from-gray-800/80 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                `}
              >
                <Link to={item.url} className="w-full flex items-center gap-3">
                  <Icon className={`transition-all duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction 
                    showOnHover
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <MoreHorizontal className="transition-transform duration-200 hover:scale-110" />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200 cursor-pointer group">
                    <Folder className="text-blue-500 group-hover:text-blue-600 transition-colors" />
                    <span className="font-medium">View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:bg-green-50 dark:hover:bg-green-950/50 transition-all duration-200 cursor-pointer group">
                    <Forward className="text-green-500 group-hover:text-green-600 transition-colors" />
                    <span className="font-medium">Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                  <DropdownMenuItem className="rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 cursor-pointer group">
                    <Trash2 className="text-red-500 group-hover:text-red-600 transition-colors" />
                    <span className="font-medium">Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}