"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/isAdminCheck";

import { SearchInput } from "./search-input";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export const NavbarRoutes = () => {
  const { role } = useAuth();

  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith("/admin");
  const isCoursePage = pathname?.includes("/courses");
  const isSearchPage = pathname === "/search";

  const handleLogOut = async () => {
    await signOut();
  };

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}

      <div className="flex gap-x-2 ml-auto">
        {isAdminPage || isCoursePage ? (
          <Link href="/dashboard">
            <Button size="sm">Dashboard</Button>
          </Link>
        ) : isAdmin(role) ? (
          <Link href="/admin/courses">
            <Button size="sm">Configuración</Button>
          </Link>
        ) : null}
      </div>
      {/* button de logout */}
      <div className="ml-5">
        <Link href="/login">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </Link>
      </div>
    </>
  );
};
