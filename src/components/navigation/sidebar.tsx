"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  KanbanSquare,
  Users,
  Calendar,
  Settings,
  LogOut,
  Activity,
  DollarSign,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationPopover } from "@/components/navigation/notification-popover";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notebooks", label: "Notebooks", icon: BookOpen },
  { href: "/knowledge", label: "Base de Conhecimento", icon: Database },
  { href: "/projects", label: "Projetos", icon: KanbanSquare },
  { href: "/team", label: "Equipe", icon: Users },
  { href: "/financial", label: "Financeiro", icon: DollarSign },
  { href: "/calendar", label: "Agenda", icon: Calendar },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card/50 backdrop-blur-xl transition-transform print:hidden">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center justify-between pl-2.5 pr-2">
          <div className="flex items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <span className="ml-3 self-center whitespace-nowrap text-xl font-semibold tracking-tight">
              Manus Fisio
            </span>
          </div>
          <NotificationPopover />
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t pt-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3 backdrop-blur-sm">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">Dr. Rafael</span>
              <span className="truncate text-xs text-muted-foreground">
                Fisioterapeuta
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
