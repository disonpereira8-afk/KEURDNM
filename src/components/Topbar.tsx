import React, { useState } from "react";
import { RefreshCw, User, Database, Check, Menu, LogOut, LogIn } from "lucide-react";

interface TopbarProps {
  currentTab: string;
  onResetDB: () => void;
  resetLoading: boolean;
  onMenuToggle?: () => void;
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Topbar({ currentTab, onResetDB, resetLoading, onMenuToggle, user, onLogin, onLogout }: TopbarProps) {
  const [showStatusHint, setShowStatusHint] = useState(false);

  const getBreadcrumb = () => {
    switch (currentTab) {
      case "dashboard":
        return { parent: "Dashboard", child: "Ringkasan Eksekutif & Realisasi" };
      case "sppd-luar-kota":
        return { parent: "Form SPPD", child: "Surat Perintah Perjalanan Dinas Luar Kota (25 Kolom)" };
      case "sppd-dalam-kota":
        return { parent: "Form SPPD", child: "Surat Perintah Perjalanan Dinas Dalam Kota (15 Kolom)" };
      case "sppd-paket-meeting":
        return { parent: "Form SPPD", child: "SPPD Paket Rapat / Meeting (15 Kolom)" };
      case "kontrak-paket-meeting":
        return { parent: "Form SPPD", child: "Kontrak Rapat Rekanan Hotel (14 Kolom)" };
      case "sppd-luar-negeri":
        return { parent: "Form SPPD", child: "SPPD Dinas Luar Negeri (31 Kolom)" };
      case "rekap":
        return { parent: "Laporan", child: "Konsolidasi Rekapitulasi & Ekspor CSV" };
      case "pegawai":
        return { parent: "Master Data", child: "Manajemen Pegawai Rudenim" };
      default:
        return { parent: "Sistem SPPD", child: "Manajemen SPPD" };
    }
  };

  const bc = getBreadcrumb();

  return (
    <header className="bg-white h-16 border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs no-print">
      {/* Breadcrumb Info & Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            id="mobile-sidebar-toggle"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 animate-pulse" />
          </button>
        )}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase hidden md:inline shrink-0">{bc.parent}</span>
          <span className="text-slate-300 hidden md:inline shrink-0">/</span>
          <span className="text-xs sm:text-sm font-semibold text-navy truncate">{bc.child}</span>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        {/* Reset Database Button */}
        <button
          id="btn-reset-db"
          onClick={() => {
            if (window.confirm("Apakah Anda yakin ingin memulihkan database ke data awal bawaan Rudenim Pontianak?")) {
              onResetDB();
            }
          }}
          disabled={resetLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
          title="Reset Database ke Sample Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetLoading ? "animate-spin" : ""}`} />
          <span>Reset ke Data Bawaan</span>
        </button>

        {/* Database Status Pill */}
        <div 
          className="relative flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-help"
          onMouseEnter={() => setShowStatusHint(true)}
          onMouseLeave={() => setShowStatusHint(false)}
        >
          <Database className="w-3 h-3 text-green-500" />
          <span>Online DB</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>

          {showStatusHint && (
            <div className="absolute top-8 right-0 w-64 bg-slate-800 text-white p-3 rounded-lg shadow-xl text-xs leading-relaxed z-30 font-medium normal-case pointer-events-none">
              Database berjalan di server Node.js lokal menggunakan database terpusat JSON. Data disimpan secara langsung dan persisten.
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Identity Info */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-[11px] font-bold text-slate-700 max-w-[120px] truncate">{user.displayName || "Pengguna Aplikasi"}</p>
                <p className="text-[9px] text-slate-500 font-semibold">{user.email}</p>
              </div>
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'u'}`} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" />
              <button onClick={onLogout} title="Keluar Akun" className="p-1.5 ml-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer block">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={onLogin} 
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold text-slate-700 transition"
              title="Akses Export Google Sheets"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
