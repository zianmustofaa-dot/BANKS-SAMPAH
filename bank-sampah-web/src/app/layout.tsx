import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Bank Sampah Digital",
    template: "%s · Bank Sampah Digital",
  },
  description:
    "Sistem informasi pengelolaan bank sampah: nasabah, harga sampah, setoran, penarikan saldo, dan laporan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 lg:pl-[264px]">
            <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-9">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
