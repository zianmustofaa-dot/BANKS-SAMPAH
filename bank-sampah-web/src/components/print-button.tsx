"use client";

import { IconDownload } from "@/components/icons";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary">
      <IconDownload className="size-4" />
      Cetak bukti
    </button>
  );
}
