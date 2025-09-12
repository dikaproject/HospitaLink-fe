import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-2">
          <SidebarTrigger />
        </div>
        {children}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}