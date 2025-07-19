"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Truck,
  ClipboardList,
  Calendar,
  Users,
  Route,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import Image from "next/image";

// Move this inside the client component
const SidebarLink = ({
  to,
  icon: Icon,
  label,
  currentPath,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
}) => {
  const active = currentPath === to;

  return (
    <Link
      href={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "text-foreground/70 hover:bg-secondary"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  return (
    <div className="h-screen w-64 border-r flex flex-col">
      <div className="p-4 border-b flex justify-start items-center gap-2">
        {/* <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold">MD</span>
        </div> */}
        <Image
          src="/logo.svg"
          alt="MargaDarshi Logo"
          width={32}
          height={32}
          className="rounded-md"
        />
        <span className="font-semibold text-lg">Margadarshi </span>
      </div>
      <div className="py-4 flex-1 flex flex-col">
        <div className="px-3 mb-4">
          <nav className="space-y-1">
            <SidebarLink
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              currentPath={pathname}
            />
            <SidebarLink
              to="/tracking"
              icon={Map}
              label="Driver Tracking"
              currentPath={pathname}
            />
            <SidebarLink
              to="/assign"
              icon={Calendar}
              label="Assign Deliveries"
              currentPath={pathname}
            />
            <SidebarLink
              to="/customer"
              icon={Users}
              label="Customer Time Slots"
              currentPath={pathname}
            />
            <SidebarLink
              to="/optimize"
              icon={Route}
              label="Routes"
              currentPath={pathname}
            />
            <SidebarLink
              to="/carriers"
              icon={Truck}
              label="Carriers"
              currentPath={pathname}
            />
            <SidebarLink
              to="/orders"
              icon={ClipboardList}
              label="Order History"
              currentPath={pathname}
            />
            {/* <SidebarLink
              to="/settings"
              icon={Settings}
              label="Settings"
              currentPath={pathname}
            /> */}
          </nav>
        </div>
        <div className="mt-auto px-3">
          <Button
            onClick={() => logout()}
            // className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:bg-secondary"
            className="hover:bg-secondary cursor-pointer hover:text-foreground/90"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
