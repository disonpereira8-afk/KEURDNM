import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import SppdForms from "./components/SppdForms";
import SppdRecap from "./components/SppdRecap";
import PegawaiMaster from "./components/PegawaiMaster";
import { initAuth, googleSignIn, logout, getAccessToken } from "./auth";
import type { User } from "firebase/auth";
import { 
  Pegawai, 
  SPPDLuarKota, 
  SPPDDalamKota, 
  SPPDPaketMeeting, 
  KontrakPaketMeeting, 
  SPPDLuarNegeri, 
  SppdType 
} from "./types";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Calendar,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function App() {
  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [sppdFormType, setSppdFormType] = useState<SppdType>("LUAR_KOTA");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [globalLoading, setGlobalLoading] = useState<boolean>(true);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authNeeded, setAuthNeeded] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Database states
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [sppdLuarKota, setSppdLuarKota] = useState<SPPDLuarKota[]>([]);
  const [sppdDalamKota, setSppdDalamKota] = useState<SPPDDalamKota[]>([]);
  const [sppdPaketMeeting, setSppdPaketMeeting] = useState<SPPDPaketMeeting[]>([]);
  const [kontrakPaketMeeting, setKontrakPaketMeeting] = useState<KontrakPaketMeeting[]>([]);
  const [sppdLuarNegeri, setSppdLuarNegeri] = useState<SPPDLuarNegeri[]>([]);

  // Edit states
  const [editRecord, setEditRecord] = useState<any | null>(null);

  // Notification sound/toast helper
  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto remove in 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Entire DB
  const fetchDatabase = async (silent = false) => {
    if (!silent) setGlobalLoading(true);
    try {
      const response = await fetch("/api/db");
      if (!response.ok) throw new Error("Gagal mengambil data dari DB");
      
      const data = await response.json();
      setPegawai(data.pegawai || []);
      setSppdLuarKota(data.sppd_luar_kota || []);
      setSppdDalamKota(data.sppd_dalam_kota || []);
      setSppdPaketMeeting(data.sppd_paket_meeting || []);
      setKontrakPaketMeeting(data.kontrak_paket_meeting || []);
      setSppdLuarNegeri(data.sppd_luar_negeri || []);
    } catch (error: any) {
      addToast(error.message || "Gagal menghubungi server database", "error");
    } finally {
      if (!silent) setGlobalLoading(false);
    }
  };

  // Initialize DB on mount and init Auth
  useEffect(() => {
    fetchDatabase();
    
    const unsub = initAuth(
      (u) => {
        setUser(u);
        setAuthNeeded(false);
      },
      () => {
        setUser(null);
        setAuthNeeded(true);
      }
    );
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAuthNeeded(false);
        addToast("Berhasil login dengan akun Google Workspace", "success");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAuthNeeded(true);
    addToast("Anda telah keluar akun", "info");
  };

  // Database Reset handler
  const handleResetDB = async () => {
    setResetLoading(true);
    try {
      const response = await fetch("/api/db/reset", { method: "POST" });
      if (!response.ok) throw new Error("Gagal mereset database");
      
      const data = await response.json();
      setPegawai(data.db.pegawai || []);
      setSppdLuarKota(data.db.sppd_luar_kota || []);
      setSppdDalamKota(data.db.sppd_dalam_kota || []);
      setSppdPaketMeeting(data.db.sppd_paket_meeting || []);
      setKontrakPaketMeeting(data.db.kontrak_paket_meeting || []);
      setSppdLuarNegeri(data.db.sppd_luar_negeri || []);
      
      addToast("Database berhasil di-restore ke data default Rudenim Pontianak!", "success");
      setCurrentTab("dashboard");
    } catch (error: any) {
      addToast(error.message, "error");
    } finally {
      setResetLoading(false);
    }
  };

  // Save Pegawai Master Handler
  const handleSavePegawai = async (payload: Partial<Pegawai>): Promise<boolean> => {
    try {
      const response = await fetch("/api/pegawai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Gagal memproses data pegawai");
      
      const res = await response.json();
      setPegawai(res.db.pegawai || []);
      addToast(`Pegawai "${payload.nama}" berhasil disimpan!`, "success");
      return true;
    } catch (error: any) {
      addToast(error.message, "error");
      return false;
    }
  };

  // Delete Pegawai Master Handler
  const handleDeletePegawai = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pegawai/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus data pegawai");
      
      const res = await response.json();
      setPegawai(res.db.pegawai || []);
      addToast("Pegawai berhasil dihapus dari database master.", "success");
      return true;
    } catch (error: any) {
      addToast(error.message, "error");
      return false;
    }
  };

  // Save SPPD Handler (Add or Update)
  const handleSaveSppd = async (type: SppdType, payload: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sppd/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Gagal memproses data SPPD");
      
      const res = await response.json();
      // Update local states
      setSppdLuarKota(res.db.sppd_luar_kota || []);
      setSppdDalamKota(res.db.sppd_dalam_kota || []);
      setSppdPaketMeeting(res.db.sppd_paket_meeting || []);
      setKontrakPaketMeeting(res.db.kontrak_paket_meeting || []);
      setSppdLuarNegeri(res.db.sppd_luar_negeri || []);

      const actionText = payload.id ? "diperbarui" : "disimpan";
      addToast(`Dokumen SPPD ${type.replace(/_/g, " ")} berhasil ${actionText}!`, "success");
      return true;
    } catch (error: any) {
      addToast(error.message, "error");
      return false;
    }
  };

  // Delete SPPD Handler
  const handleDeleteSppd = async (type: SppdType, id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sppd/${type}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus kuitansi SPPD");
      
      const res = await response.json();
      setSppdLuarKota(res.db.sppd_luar_kota || []);
      setSppdDalamKota(res.db.sppd_dalam_kota || []);
      setSppdPaketMeeting(res.db.sppd_paket_meeting || []);
      setKontrakPaketMeeting(res.db.kontrak_paket_meeting || []);
      setSppdLuarNegeri(res.db.sppd_luar_negeri || []);
      
      addToast("File arsip SPPD dihapus secara sukses.", "success");
      return true;
    } catch (error: any) {
      addToast(error.message, "error");
      return false;
    }
  };

  const handleEditRedirect = (type: SppdType, record: any) => {
    setEditRecord(record);
    setSppdFormType(type);
    
    // Redirect to respective form tabs based on SppdType
    switch (type) {
      case "LUAR_KOTA": setCurrentTab("sppd-luar-kota"); break;
      case "DALAM_KOTA": setCurrentTab("sppd-dalam-kota"); break;
      case "PAKET_MEETING": setCurrentTab("sppd-paket-meeting"); break;
      case "KONTRAK_PAKET_MEETING": setCurrentTab("kontrak-paket-meeting"); break;
      case "LUAR_NEGERI": setCurrentTab("sppd-luar-negeri"); break;
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex bg-bg-page min-h-screen text-navy antialiased font-sans flex-row relative selection:bg-accent/30 overflow-x-hidden">
      
      {/* Sidebar Backdrop Overlay on Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-navy/60 backdrop-blur-xs z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 260px Side Navigation Bar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          // if switching away from form tabs, clear edit state
          if (!tab.startsWith("sppd") && tab !== "kontrak-paket-meeting") {
            setEditRecord(null);
          }
        }} 
        setSppdFormType={setSppdFormType}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Body Content Frame */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        
        {/* Sticky Header Topbar */}
        <Topbar 
          currentTab={currentTab} 
          onResetDB={handleResetDB}
          resetLoading={resetLoading}
          onMenuToggle={() => setMobileMenuOpen(prev => !prev)}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* Dynamic Route/Switch Panel Content with Loading States */}
        <main className="flex-1 p-6 z-0 max-w-7xl w-full mx-auto pb-16">
          {globalLoading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center animate-pulse border border-slate-200">
                <Loader2 className="w-6 h-6 text-navy animate-spin" />
              </div>
              <p className="text-xs font-bold text-navy uppercase tracking-widest animate-pulse">Menghubungkan Database...</p>
            </div>
          ) : (
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {currentTab === "dashboard" && (
                <Dashboard 
                  pegawai={pegawai}
                  sppdLuarKota={sppdLuarKota}
                  sppdDalamKota={sppdDalamKota}
                  sppdPaketMeeting={sppdPaketMeeting}
                  kontrakPaketMeeting={kontrakPaketMeeting}
                  sppdLuarNegeri={sppdLuarNegeri}
                />
              )}

              {currentTab === "sppd-luar-kota" && (
                <SppdForms 
                  type="LUAR_KOTA"
                  pegawai={pegawai}
                  onSave={handleSaveSppd}
                  isLoading={false}
                  editData={editRecord}
                  onCancelEdit={() => {
                    setEditRecord(null);
                    setCurrentTab("rekap");
                  }}
                />
              )}

              {currentTab === "sppd-dalam-kota" && (
                <SppdForms 
                  type="DALAM_KOTA"
                  pegawai={pegawai}
                  onSave={handleSaveSppd}
                  isLoading={false}
                  editData={editRecord}
                  onCancelEdit={() => {
                    setEditRecord(null);
                    setCurrentTab("rekap");
                  }}
                />
              )}

              {currentTab === "sppd-paket-meeting" && (
                <SppdForms 
                  type="PAKET_MEETING"
                  pegawai={pegawai}
                  onSave={handleSaveSppd}
                  isLoading={false}
                  editData={editRecord}
                  onCancelEdit={() => {
                    setEditRecord(null);
                    setCurrentTab("rekap");
                  }}
                />
              )}

              {currentTab === "kontrak-paket-meeting" && (
                <SppdForms 
                  type="KONTRAK_PAKET_MEETING"
                  pegawai={pegawai}
                  onSave={handleSaveSppd}
                  isLoading={false}
                  editData={editRecord}
                  onCancelEdit={() => {
                    setEditRecord(null);
                    setCurrentTab("rekap");
                  }}
                />
              )}

              {currentTab === "sppd-luar-negeri" && (
                <SppdForms 
                  type="LUAR_NEGERI"
                  pegawai={pegawai}
                  onSave={handleSaveSppd}
                  isLoading={false}
                  editData={editRecord}
                  onCancelEdit={() => {
                    setEditRecord(null);
                    setCurrentTab("rekap");
                  }}
                />
              )}

              {currentTab === "rekap" && (
                <SppdRecap 
                  pegawai={pegawai}
                  sppdLuarKota={sppdLuarKota}
                  sppdDalamKota={sppdDalamKota}
                  sppdPaketMeeting={sppdPaketMeeting}
                  kontrakPaketMeeting={kontrakPaketMeeting}
                  sppdLuarNegeri={sppdLuarNegeri}
                  onEdit={handleEditRedirect}
                  onDelete={handleDeleteSppd}
                  onRefresh={fetchDatabase}
                  isLoading={false}
                  user={user}
                  onRequireLogin={handleLogin}
                />
              )}

              {currentTab === "pegawai" && (
                <PegawaiMaster 
                  pegawai={pegawai}
                  onSave={handleSavePegawai}
                  onDelete={handleDeletePegawai}
                  isLoading={false}
                />
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Slide-in Float Toast Notification Panel */}
      <div id="toast-panel" className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 no-print max-w-md">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, y: 0, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`p-4 rounded-xl shadow-xl flex items-start gap-3 border text-xs font-semibold ${
                toast.type === "success" 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : toast.type === "error" 
                    ? "bg-red-50 text-red-800 border-red-200" 
                    : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {toast.type === "info" && <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
              
              <div className="flex-1 min-w-0 pr-2">
                <p className="leading-relaxed font-semibold">{toast.message}</p>
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
