"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { IconSearch } from "./icons";
import Link from "next/link";

export function SubmitButton({
  children,
  pendingLabel = "Menyimpan…",
  className = "btn-primary",
  confirmMessage,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={className}
    >
      {pending ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Cari…",
  basePath,
  name = "q",
}: {
  defaultValue?: string;
  placeholder?: string;
  basePath: string;
  name?: string;
}) {
  return (
    <form method="get" action={basePath} className="relative w-full sm:w-[300px]">
      <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted/70" />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input py-2.5 pr-20 pl-10 text-[13px]"
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
        {defaultValue && (
          <Link
            href={basePath}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted hover:bg-line/60"
          >
            Reset
          </Link>
        )}
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-brand-800"
        >
          Cari
        </button>
      </div>
    </form>
  );
}

export function RangeFilter({
  from,
  to,
  action,
}: {
  from: string;
  to: string;
  action: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className="flex flex-wrap items-end gap-2.5"
    >
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted">Dari tanggal</span>
        <input type="date" name="from" defaultValue={from} className="input py-2 text-[13px]" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted">Sampai tanggal</span>
        <input type="date" name="to" defaultValue={to} className="input py-2 text-[13px]" />
      </label>
      <button type="submit" className="btn-secondary py-2 text-[13px]">
        Terapkan
      </button>
    </form>
  );
}
