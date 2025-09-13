// Update: hospitalink-fe/src/components/nav-main.tsx - Enhanced styling
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation()

  const isUrlMatch = (itemUrl: string) => {
    const [itemPath, itemQueryString] = itemUrl.split('?')
    
    if (itemPath !== location.pathname) return false
    
    if (!itemQueryString) return true
    
    const currentParams = new URLSearchParams(location.search)
    const itemParams = new URLSearchParams(itemQueryString)
    
    for (const [key, value] of itemParams) {
      if (currentParams.get(key) !== value) {
        return false
      }
    }
    
    return true
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
        Menu Utama
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const hasSubItems = item.items && item.items.length > 0
          const isMainActive = isUrlMatch(item.url)
          const isSubActive = hasSubItems && item.items?.some(subItem => isUrlMatch(subItem.url))
          const isActive = isMainActive || isSubActive
          
          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      isActive={isActive}
                      className={`
                        group relative overflow-hidden rounded-lg transition-all duration-200 ease-in-out
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50' 
                          : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                      `}
                    >
                      {Icon && <Icon className={`transition-all duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />}
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight className={`
                        ml-auto transition-all duration-200 ease-in-out
                        ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}
                        group-data-[state=open]/collapsible:rotate-90
                      `} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarMenuSub className="ml-4 space-y-1 border-l border-gray-200/60 dark:border-gray-700/60 pl-4 mt-2">
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isUrlMatch(subItem.url)}
                            className={`
                              group relative overflow-hidden rounded-md transition-all duration-200 ease-in-out
                              ${isUrlMatch(subItem.url) 
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-l-2 hover:border-gray-300 dark:hover:border-gray-600'
                              }
                              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500
                            `}
                          >
                            <Link to={subItem.url} className="w-full">
                              <span className="text-sm font-medium">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                isActive={isMainActive}
                className={`
                  group relative overflow-hidden rounded-lg transition-all duration-200 ease-in-out
                  ${isMainActive 
                    ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50' 
                    : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                `}
              >
                <Link to={item.url} className="w-full flex items-center gap-3">
                  {Icon && <Icon className={`transition-all duration-200 ${isMainActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />}
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}