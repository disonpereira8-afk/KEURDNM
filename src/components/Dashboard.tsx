import React from "react";
import { 
  DollarSign, 
  MapPin, 
  Plane, 
  Building, 
  Globe, 
  TrendingUp, 
  Award, 
  Layers, 
  CalendarDays,
  Users
} from "lucide-react";
import { 
  Pegawai, 
  SPPDLuarKota, 
  SPPDDalamKota, 
  SPPDPaketMeeting, 
  KontrakPaketMeeting, 
  SPPDLuarNegeri 
} from "../types";

interface DashboardProps {
  pegawai: Pegawai[];
  sppdLuarKota: SPPDLuarKota[];
  sppdDalamKota: SPPDDalamKota[];
  sppdPaketMeeting: SPPDPaketMeeting[];
  kontrakPaketMeeting: KontrakPaketMeeting[];
  sppdLuarNegeri: SPPDLuarNegeri[];
}

export function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function Dashboard({
  pegawai = [],
  sppdLuarKota = [],
  sppdDalamKota = [],
  sppdPaketMeeting = [],
  kontrakPaketMeeting = [],
  sppdLuarNegeri = []
}: DashboardProps) {
  
  // Set DIPA target
  const targetDipa = 500000000; // Rp 500,000,000

  // Total Realisasi Calculations
  const sumLK = sppdLuarKota.reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);
  const sumDK = sppdDalamKota.reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);
  const sumPM = sppdPaketMeeting.reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);
  const sumKM = kontrakPaketMeeting.reduce((sum, item) => sum + Number(item.grandTotal || 0), 0);
  const sumLN = sppdLuarNegeri.reduce((sum, item) => sum + Number(item.realisasiTotal || 0), 0);

  const totalRealisasi = sumLK + sumDK + sumPM + sumKM + sumLN;
  const sisaPagu = Math.max(0, targetDipa - totalRealisasi);
  const rasioTarget = (totalRealisasi / targetDipa) * 100;

  // Monthly breakdown calculation (using tglMulai)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  
  // Initialize counts
  const monthlyCounts = monthNames.map((m, idx) => ({
    month: m,
    LuarKota: 0,
    DalamKota: 0,
    PaketMeeting: 0,
    KontrakMeeting: 0,
    LuarNegeri: 0,
    total: 0
  }));

  const processMonthly = (list: any[], typeKey: "LuarKota" | "DalamKota" | "PaketMeeting" | "KontrakMeeting" | "LuarNegeri") => {
    list.forEach(item => {
      if (item.tglMulai) {
        const date = new Date(item.tglMulai);
        const mIdx = date.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          monthlyCounts[mIdx][typeKey]++;
          monthlyCounts[mIdx].total++;
        }
      }
    });
  };

  processMonthly(sppdLuarKota, "LuarKota");
  processMonthly(sppdDalamKota, "DalamKota");
  processMonthly(sppdPaketMeeting, "PaketMeeting");
  processMonthly(kontrakPaketMeeting, "KontrakMeeting");
  processMonthly(sppdLuarNegeri, "LuarNegeri");

  const maxMonthTotal = Math.max(...monthlyCounts.map(m => m.total), 4); // fallbacks to 4 for visual height

  // Top 5 Pegawai with most trips
  // Combine all trips to count
  const pegawaiTrips: Record<string, { count: number; totalCost: number; name: string; nip: string }> = {};

  const addTripToPegawai = (pegId: string, cost: number, defaultName: string, defaultNip: string) => {
    if (!pegId) return;
    if (!pegawaiTrips[pegId]) {
      // find from master list first to get correct NIP
      const found = pegawai.find(p => p.id === pegId);
      pegawaiTrips[pegId] = {
        count: 0,
        totalCost: 0,
        name: found ? found.nama : defaultName,
        nip: found ? found.nip : defaultNip
      };
    }
    pegawaiTrips[pegId].count++;
    pegawaiTrips[pegId].totalCost += cost;
  };

  sppdLuarKota.forEach(t => addTripToPegawai(t.pegawaiId, Number(t.grandTotal || 0), t.namaPegawai, t.nip));
  sppdDalamKota.forEach(t => addTripToPegawai(t.pegawaiId, Number(t.grandTotal || 0), t.namaPegawai, t.nip));
  sppdPaketMeeting.forEach(t => addTripToPegawai(t.pegawaiId, Number(t.grandTotal || 0), t.namaPegawai, t.nip));
  sppdLuarNegeri.forEach(t => addTripToPegawai(t.pegawaiId, Number(t.realisasiTotal || 0), t.namaPegawai, t.nip));

  const topPegawai = Object.values(pegawaiTrips)
    .sort((a, b) => b.count - a.count || b.totalCost - a.totalCost)
    .slice(0, 5);

  const totalTripsCount = sppdLuarKota.length + sppdDalamKota.length + sppdPaketMeeting.length + kontrakPaketMeeting.length + sppdLuarNegeri.length;

  return (
    <div className="space-y-6">
      
      {/* 4 Core Stat Cards in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Realisasi */}
        <div id="stat-card-realisasi" className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-accent shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL REALISASI</p>
            <p className="text-xl font-bold font-mono tracking-tight text-navy">{formatIDR(totalRealisasi)}</p>
            <p className="text-xs text-slate-500 mt-1">Semua 5 jenis SPPD & Kontrak</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-accent" />
          </div>
        </div>

        {/* Sisa Pagu */}
        <div id="stat-card-sisa-pagu" className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-teal shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SISA PAGU ALOKASI</p>
            <p className="text-xl font-bold font-mono tracking-tight text-navy">{formatIDR(sisaPagu)}</p>
            <p className="text-xs text-slate-500 mt-1">Sisa DIPA Target (Rp 500M)</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal" />
          </div>
        </div>

        {/* Total Perjalanan */}
        <div id="stat-card-perjalanan" className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-green-custom shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL SERATAN SPPD</p>
            <p className="text-xl font-bold font-mono tracking-tight text-navy">{totalTripsCount} Dokumen</p>
            <p className="text-xs text-slate-500 mt-1">Direkap & disinkronisasi</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-custom/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-green-custom" />
          </div>
        </div>

        {/* Master Pegawai */}
        <div id="stat-card-pegawai" className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-red-custom shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PEGAWAI AKTIF</p>
            <p className="text-xl font-bold font-mono tracking-tight text-navy">{pegawai.length} Personel</p>
            <p className="text-xs text-slate-500 mt-1">Dalam Database Master</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-red-custom/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-red-custom" />
          </div>
        </div>

      </div>

      {/* Target realisasi vs Target DIPA */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Realisasi Anggaran vs Target Alokasi (DIPA)
            </h3>
            <p className="text-xs text-slate-500 font-medium">Batas alokasi makro perjalanan dinas Rudenim Pontianak TA 2026</p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-sm border border-amber-200">
            {rasioTarget.toFixed(1)}% Terpakai
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner flex">
              <div 
                className="bg-accent h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(3, rasioTarget))}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <div className="space-y-0.5">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Terrealisasi</span>
                <span className="font-mono text-slate-800 text-sm">{formatIDR(totalRealisasi)}</span>
              </div>
              <div className="space-y-0.5 text-center px-4 py-1.5 bg-slate-50 rounded border border-slate-150">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">Pagu Target DIPA</span>
                <span className="font-mono text-slate-600 text-xs">{formatIDR(targetDipa)}</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Sisa Pagu Tersedia</span>
                <span className="font-mono text-slate-800 text-sm">{formatIDR(sisaPagu)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 border-l border-slate-100 pl-6 hidden lg:block space-y-3">
            <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Status Anggaran</h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Kondisi Pagu:</span>
                <span className={sisaPagu > 100000000 ? "text-green-600 font-bold" : sisaPagu > 20000000 ? "text-amber-600 font-bold" : "text-red-500 font-bold"}>
                  {sisaPagu > 100000000 ? "Aman & Tersedia" : sisaPagu > 20000000 ? "Mendekati Batas" : "Kritis / Overbudget"}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Efisiensi Alokasi:</span>
                <span className="text-cyan-600 font-bold">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area: Monthly Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Statistik Jumlah Perjalanan Dinas Per Bulan
            </h3>
            <p className="text-xs text-slate-500 font-medium">Kuantitas perjalanan dinas yang direncanakan per bulannya</p>
          </div>
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> LK</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-500 rounded-sm"></span> DK</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span> PM</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></span> KM</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-pink-500 rounded-sm"></span> LN</span>
          </div>
        </div>

        {/* Custom HTML/SVG Bar Chart */}
        <div className="h-64 flex flex-col justify-between">
          <div className="flex-1 flex items-end gap-2 sm:gap-4 md:gap-6 pt-4 border-b border-slate-100">
            {monthlyCounts.map((m) => {
              // calculate percentage heights
              const totalHeight = m.total > 0 ? (m.total / maxMonthTotal) * 100 : 0;
              const hasTrips = m.total > 0;
              
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center h-full group relative cursor-help">
                  {/* The Bar Block */}
                  <div className="w-full flex flex-col justify-end h-full rounded-t-sm overflow-hidden bg-slate-50/50">
                    {hasTrips ? (
                      <div 
                        className="w-full flex flex-col-reverse rounded-t-sm transition-all duration-300 group-hover:scale-y-105 origin-bottom"
                        style={{ height: `${Math.max(8, totalHeight)}%` }}
                      >
                        {/* Segment colors matching each type */}
                        {m.LuarNegeri > 0 && <div className="bg-pink-500 transition-all" style={{ height: `${(m.LuarNegeri/m.total)*100}%` }} />}
                        {m.KontrakMeeting > 0 && <div className="bg-purple-500 transition-all" style={{ height: `${(m.KontrakMeeting/m.total)*100}%` }} />}
                        {m.PaketMeeting > 0 && <div className="bg-indigo-500 transition-all" style={{ height: `${(m.PaketMeeting/m.total)*100}%` }} />}
                        {m.DalamKota > 0 && <div className="bg-teal-500 transition-all" style={{ height: `${(m.DalamKota/m.total)*100}%` }} />}
                        {m.LuarKota > 0 && <div className="bg-blue-500 transition-all" style={{ height: `${(m.LuarKota/m.total)*100}%` }} />}
                      </div>
                    ) : (
                      <div className="w-full h-1 bg-slate-100 rounded-t-xs"></div>
                    )}
                  </div>

                  {/* Month name label */}
                  <span className="text-[10px] font-bold text-slate-500 mt-2">{m.month}</span>

                  {/* Tooltip Overlay */}
                  <div className="absolute bottom-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30 bg-slate-800 text-white p-3 rounded-lg shadow-xl text-[11px] leading-relaxed w-48 font-medium">
                    <p className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">Bulan: {m.month} 2026</p>
                    <div className="space-y-1 text-slate-200 font-medium">
                      <div className="flex justify-between"><span>✈️ Luar Kota:</span> <span className="font-bold">{m.LuarKota}</span></div>
                      <div className="flex justify-between"><span>🏙️ Dalam Kota:</span> <span className="font-bold">{m.DalamKota}</span></div>
                      <div className="flex justify-between"><span>🏢 Paket Rapat:</span> <span className="font-bold">{m.PaketMeeting}</span></div>
                      <div className="flex justify-between"><span>🤝 Kontrak Hotel:</span> <span className="font-bold">{m.KontrakMeeting}</span></div>
                      <div className="flex justify-between"><span>🌍 Luar Negeri:</span> <span className="font-bold">{m.LuarNegeri}</span></div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 mt-1 font-bold text-amber-400">
                        <span>Total SPPD:</span> <span>{m.total}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
            <span>* Sentuh batang diagram untuk detail bulanan</span>
            <span>Kalender Kerja TA 2026</span>
          </div>
        </div>
      </div>

      {/* Grid of Top 5 Pegawai and Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Pegawai with travels */}
        <div id="panel-top-pegawai" className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs lg:col-span-7">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">🏆 Top 5 Pegawai Teraktif (Perjalanan Terbanyak)</h3>
              <p className="text-xs text-slate-500">Daftar operator dinas dengan kuantitas penugasan tertinggi</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {topPegawai.length > 0 ? (
              topPegawai.map((peg, idx) => (
                <div key={peg.nip} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                      idx === 0 ? "bg-amber-100 text-amber-700" :
                      idx === 1 ? "bg-slate-100 text-slate-700" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-50 text-slate-500"
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{peg.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-tight">{peg.nip}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 font-mono">{peg.count} Kegiatan</p>
                    <p className="text-[10px] font-semibold text-slate-400 font-mono">{formatIDR(peg.totalCost)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-1">
                <p className="text-xs font-semibold">Belum ada rekaman perjalanan dinas</p>
                <p className="text-[11px] text-slate-400">Silakan input SPPD baru untuk melihat peringkat pegawai.</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Breakdown by Type */}
        <div id="panel-budget-breakdown" className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs lg:col-span-12 xl:col-span-5 lg:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">💰 Ringkasan Anggaran Per Jenis SPPD</h3>
              <p className="text-xs text-slate-500">Porsi realisasi dana terserap per skema perjalanan</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* SPPD Luar Kota */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Luar Kota
                </span>
                <span className="font-mono text-slate-800">{formatIDR(sumLK)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all" 
                  style={{ width: `${totalRealisasi > 0 ? (sumLK / totalRealisasi) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* SPPD Dalam Kota */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> Dalam Kota
                </span>
                <span className="font-mono text-slate-800">{formatIDR(sumDK)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-500 h-full transition-all" 
                  style={{ width: `${totalRealisasi > 0 ? (sumDK / totalRealisasi) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* SPPD Paket Meeting */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Paket Meeting
                </span>
                <span className="font-mono text-slate-800">{formatIDR(sumPM)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all" 
                  style={{ width: `${totalRealisasi > 0 ? (sumPM / totalRealisasi) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Kontrak Paket Meeting */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Kontrak Paket Meeting
                </span>
                <span className="font-mono text-slate-800">{formatIDR(sumKM)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all" 
                  style={{ width: `${totalRealisasi > 0 ? (sumKM / totalRealisasi) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* SPPD Luar Negeri */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span> Luar Negeri
                </span>
                <span className="font-mono text-slate-800">{formatIDR(sumLN)}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-pink-500 h-full transition-all" 
                  style={{ width: `${totalRealisasi > 0 ? (sumLN / totalRealisasi) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
