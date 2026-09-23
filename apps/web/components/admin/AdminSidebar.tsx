"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/settings", label: "Configuración" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/account", label: "Mi cuenta" },
];

// Sidebar persistente en desktop (lg+); en mobile/tablet se oculta y se abre
// como panel suspendido (overlay + backdrop) sobre una barra superior con menú.
export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-4 bg-verde-oscuro px-4 py-3 text-crema lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="text-2xl leading-none"
        >
          ☰
        </button>
        <span className="font-bold">DanMe Admin</span>
      </div>

      {open && (
        <div
          data-testid="sidebar-backdrop"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-verde-oscuro text-crema transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:w-56 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <span className="text-lg font-bold">DanMe Admin</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="text-xl lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded px-3 py-2 text-sm font-medium hover:bg-verde-danme/40 ${
                pathname === item.href ? "bg-verde-danme/60" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-crema/20 px-3 py-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
