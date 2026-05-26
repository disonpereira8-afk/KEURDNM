import React from "react";
import { 
  LayoutDashboard, 
  Plane, 
  MapPin, 
  Users, 
  FileText, 
  Building, 
  Globe, 
  FileCheck,
  FolderOpen,
  X
} from "lucide-react";
import { SppdType } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setSppdFormType?: (type: SppdType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, setSppdFormType, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-amber-500" },
    { id: "sppd-luar-kota", label: "SPPD Luar Kota", icon: Plane, type: "LUAR_KOTA" as SppdType, color: "text-blue-500" },
    { id: "sppd-dalam-kota", label: "SPPD Dalam Kota", icon: MapPin, type: "DALAM_KOTA" as SppdType, color: "text-teal-500" },
    { id: "sppd-paket-meeting", label: "SPPD Paket Meeting", icon: FileCheck, type: "PAKET_MEETING" as SppdType, color: "text-indigo-500" },
    { id: "kontrak-paket-meeting", label: "Kontrak Paket Meeting", icon: Building, type: "KONTRAK_PAKET_MEETING" as SppdType, color: "text-purple-500" },
    { id: "sppd-luar-negeri", label: "SPPD Luar Negeri", icon: Globe, type: "LUAR_NEGERI" as SppdType, color: "text-pink-500" },
    { id: "rekap", label: "Rekap & Ekspor", icon: FolderOpen, color: "text-emerald-500" },
    { id: "pegawai", label: "Master Pegawai", icon: Users, color: "text-slate-400" },
  ];

  const handleNav = (item: typeof menuItems[0]) => {
    setCurrentTab(item.id);
    if (item.type && setSppdFormType) {
      setSppdFormType(item.type);
    }
    if (onClose) {
      onClose(); // Auto-close on mobile when link is clicked
    }
  };

  return (
    <aside className={`w-[260px] bg-navy text-white min-h-screen flex flex-col shadow-xl z-40 shrink-0 no-print transition-transform duration-300 fixed md:static inset-y-0 left-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    }`}>
      {/* Brand Logo & Close trigger */}
      <div className="p-6 border-b border-navy-mid flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-navy text-lg shadow-md font-bold">
            <span>🏛️</span>
          </div>
          <div>
            <h1 className="text-sm font-black leading-none tracking-tight text-white uppercase">SPPD SYSTEM</h1>
            <p className="text-[10px] text-accent mt-1 uppercase font-bold tracking-widest">Rudenim Pontianak</p>
          </div>
        </div>
        
        {/* Close Button on Mobile viewports */}
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-mid transition-all duration-200 cursor-pointer"
            id="sidebar-mobile-close-btn"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        
        {/* Main Section */}
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 px-2">Main Menu</div>
        <div className="space-y-1">
          {menuItems.slice(0, 6).map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`nav-btn-${item.id}`}
                key={item.id}
                onClick={() => handleNav(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-accent text-navy shadow-md font-bold" 
                    : "text-slate-300 hover:bg-navy-mid hover:text-white"
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-navy" : item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Reporting Section */}
        <div className="pt-6">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 px-2">Reporting & Master</div>
          <div className="space-y-1">
            {menuItems.slice(6).map((item) => {
              const IconComponent = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  id={`nav-btn-${item.id}`}
                  key={item.id}
                  onClick={() => handleNav(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-accent text-navy shadow-md font-bold" 
                      : "text-slate-300 hover:bg-navy-mid hover:text-white"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-navy" : item.color}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </nav>

      {/* Modern User Panel at bottom */}
      <div className="p-4 border-t border-navy-mid flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center font-bold text-xs text-white uppercase font-sans">
          SK
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold truncate text-slate-200">Subbag Keuangan</p>
          <p className="text-[10px] text-slate-400">Administrator</p>
        </div>
      </div>
    </aside>
  );
}
