"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconChart,
  IconClose,
  IconDashboard,
  IconLeaf,
  IconMenu,
  IconRecycle,
  IconScale,
  IconUsers,
  IconWallet,
} from "./icons";

const NAV = [
  {
    href: "/",
    label: "Dashboard",
    hint: "Ringkasan operasional",
    icon: IconDashboard,
  },
  {
    href: "/nasabah",
    label: "Nasabah",
    hint: "Data anggota",
    icon: IconUsers,
  },
  {
    href: "/sampah",
    label: "Jenis Sampah",
    hint: "Master & harga",
    icon: IconRecycle,
  },
  {
    href: "/setoran",
    label: "Setoran",
    hint: "Transaksi masuk",
    icon: IconScale,
  },
  {
    href: "/penarikan",
    label: "Penarikan",
    hint: "Saldo keluar",
    icon: IconWallet,
  },
  {
    href: "/laporan",
    label: "Laporan",
    hint: "Rekap & analisis",
    icon: IconChart,
  },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-2xl bg-lime-soft text-brand-950 shadow-[0_8px_24px_-12px_rgba(200,236,122,0.9)]">
        <IconLeaf className="size-6" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight text-white">
          Bank Sampah
        </span>
        <span className="block text-[11px] font-semibold tracking-[0.22em] text-lime-soft uppercase">
          Digital
        </span>
      </span>
    </Link>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, hint, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              active
                ? "bg-lime-soft text-brand-950 shadow-[0_10px_24px_-16px_rgba(200,236,122,0.9)]"
                : "text-white/65 hover:bg-white/8 hover:text-white"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-lg transition ${
                active
                  ? "bg-brand-950/10 text-brand-950"
                  : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
              }`}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold">{label}</span>
              <span
                className={`block text-[11px] ${active ? "text-brand-950/60" : "text-white/40"}`}
              >
                {hint}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[linear-gradient(175deg,#0b4634_0%,#073326_55%,#04271d_100%)] px-4 pb-5 pt-6">
      <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-lime-soft/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-24 -left-16 size-48 rounded-full bg-brand-400/10 blur-2xl" />

      <div className="relative px-2">
        <Brand />
      </div>

      <div className="relative mt-8 px-2">
        <p className="text-[10px] font-bold tracking-[0.2em] text-white/35 uppercase">
          Menu utama
        </p>
      </div>
      <div className="relative mt-2">
        <NavItems onNavigate={onNavigate} />
      </div>

      <div className="relative mt-auto pt-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime-soft text-[12px] font-extrabold text-brand-950">
              ZM
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-white">
                Zian Mustofa
              </p>
              <p className="text-[10.5px] text-white/45">Administrator</p>
            </div>
            <span className="ml-auto size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.18)]" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] text-white/35">
            <span>Bank Sampah Digital</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top bar mobile */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white/85 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-800 text-lime-soft">
            <IconLeaf className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-extrabold text-ink">Bank Sampah</p>
            <p className="text-[9.5px] font-bold tracking-[0.18em] text-brand-700 uppercase">
              Digital
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-xl border border-line text-ink"
          aria-label="Buka menu"
        >
          <IconMenu className="size-5" />
        </button>
      </header>

      <div className="h-16 lg:hidden" />

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">
        <SidebarBody />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
            <SidebarBody onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-5 right-3 grid size-9 place-items-center rounded-lg bg-white/10 text-white/80"
              aria-label="Tutup menu"
            >
              <IconClose className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
