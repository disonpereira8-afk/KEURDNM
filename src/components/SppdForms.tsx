import React, { useState, useEffect } from "react";
import { 
  Plane, 
  MapPin, 
  FileCheck, 
  Building, 
  Globe, 
  Save, 
  RotateCcw,
  Calculator,
  UserCheck,
  Plus
} from "lucide-react";
import { 
  Pegawai, 
  SppdType,
  SPPDLuarKota,
  SPPDDalamKota,
  SPPDPaketMeeting,
  KontrakPaketMeeting,
  SPPDLuarNegeri
} from "../types";
import { formatIDR } from "./Dashboard";

interface SppdFormsProps {
  type: SppdType;
  pegawai: Pegawai[];
  onSave: (type: SppdType, payload: any) => Promise<boolean>;
  isLoading: boolean;
  editData?: any; // To support editing
  onCancelEdit?: () => void;
}

export default function SppdForms({ 
  type, 
  pegawai = [], 
  onSave, 
  isLoading, 
  editData,
  onCancelEdit 
}: SppdFormsProps) {
  
  // Flag to know if this is editing
  const isEditing = !!editData;

  // General state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Common metadata fields
  const [noSprint, setNoSprint] = useState("");
  const [noKuitansi, setNoKuitansi] = useState("");
  const [pegawaiId, setPegawaiId] = useState("");
  const [namaPegawai, setNamaPegawai] = useState("");
  const [nip, setNip] = useState("");
  const [golongan, setGolongan] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [jangkaWaktu, setJangkaWaktu] = useState(0);

  // LUAR KOTA fields
  const [maksudPerjalanan, setMaksudPerjalanan] = useState("");
  const [tempatKeberangkatan, setTempatKeberangkatan] = useState("Pontianak");
  const [tempatTujuan, setTempatTujuan] = useState("");
  const [uangHarian, setUangHarian] = useState(0);
  const [uangPenginapan, setUangPenginapan] = useState(0);
  const [uangTransport, setUangTransport] = useState(0);
  const [taksi, setTaksi] = useState(0);
  const [uangRepresentasi, setUangRepresentasi] = useState(0);
  const [maskapaiBerangkat, setMaskapaiBerangkat] = useState("");
  const [noTiketBerangkat, setNoTiketBerangkat] = useState("");
  const [hargaTiketBerangkat, setHargaTiketBerangkat] = useState(0);
  const [maskapaiKembali, setMaskapaiKembali] = useState("");
  const [noTiketKembali, setNoTiketKembali] = useState("");
  const [hargaTiketKembali, setHargaTiketKembali] = useState(0);

  // DALAM KOTA specific
  const [transportLokal, setTransportLokal] = useState(0);

  // PAKET MEETING specific
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [lokasiKegiatan, setLokasiKegiatan] = useState("");
  const [transport, setTransport] = useState(0);
  const [detailPendukung, setDetailPendukung] = useState("");

  // KONTRAK PAKET MEETING specific
  const [noSpm, setNoSpm] = useState("");
  const [namaRekanan, setNamaRekanan] = useState("");
  const [hotel, setHotel] = useState("");
  const [jumlahPeserta, setJumlahPeserta] = useState(0);
  const [jumlahKamar, setJumlahKamar] = useState(0);
  const [hargaPaket, setHargaPaket] = useState(0);
  const [biayaPenginapan, setBiayaPenginapan] = useState(0);
  const [biayaRuangMeeting, setBiayaRuangMeeting] = useState(0);

  // LUAR NEGERI specific
  const [negaraTujuan, setNegaraTujuan] = useState("");
  const [kotaTujuan, setKotaTujuan] = useState("");
  const [nilaiSPM, setNilaiSPM] = useState(0);
  const [asuransi, setAsuransi] = useState(0);
  const [uangHarianPerjalanan, setUangHarianPerjalanan] = useState(0);
  const [uangHarian100, setUangHarian100] = useState(0);
  const [representasi, setRepresentasi] = useState(0);
  const [penginapan, setPenginapan] = useState(0);
  const [visa, setVisa] = useState(0);
  const [biayaLainnya, setBiayaLainnya] = useState(0);

  // Reset fields when form loads or resets
  const handleReset = () => {
    setNoSprint("");
    setNoKuitansi("");
    setPegawaiId("");
    setNamaPegawai("");
    setNip("");
    setGolongan("");
    setJabatan("");
    setTglMulai("");
    setTglSelesai("");
    setJangkaWaktu(0);

    setMaksudPerjalanan("");
    setTempatKeberangkatan("Pontianak");
    setTempatTujuan("");
    setUangHarian(0);
    setUangPenginapan(0);
    setUangTransport(0);
    setTaksi(0);
    setUangRepresentasi(0);
    setMaskapaiBerangkat("");
    setNoTiketBerangkat("");
    setHargaTiketBerangkat(0);
    setMaskapaiKembali("");
    setNoTiketKembali("");
    setHargaTiketKembali(0);

    setTransportLokal(0);

    setNamaKegiatan("");
    setLokasiKegiatan("");
    setTransport(0);
    setDetailPendukung("");

    setNoSpm("");
    setNamaRekanan("");
    setHotel("");
    setJumlahPeserta(0);
    setJumlahKamar(0);
    setHargaPaket(0);
    setBiayaPenginapan(0);
    setBiayaRuangMeeting(0);

    setNegaraTujuan("");
    setKotaTujuan("");
    setNilaiSPM(0);
    setAsuransi(0);
    setUangHarianPerjalanan(0);
    setUangHarian100(0);
    setRepresentasi(0);
    setPenginapan(0);
    setVisa(0);
    setBiayaLainnya(0);

    setSuccessMsg("");
    setErrorMsg("");
  };

  // Populate data when editing
  useEffect(() => {
    if (isEditing && editData) {
      setNoSprint(editData.noSprint || "");
      setNoKuitansi(editData.noKuitansi || "");
      setPegawaiId(editData.pegawaiId || "");
      setNamaPegawai(editData.namaPegawai || "");
      setNip(editData.nip || "");
      setGolongan(editData.golongan || "");
      setJabatan(editData.jabatan || "");
      setTglMulai(editData.tglMulai || "");
      setTglSelesai(editData.tglSelesai || "");
      setJangkaWaktu(editData.jangkaWaktu || 0);

      setMaksudPerjalanan(editData.maksudPerjalanan || "");
      setTempatKeberangkatan(editData.tempatKeberangkatan || "Pontianak");
      setTempatTujuan(editData.tempatTujuan || "");
      setUangHarian(Number(editData.uangHarian || 0));
      setUangPenginapan(Number(editData.uangPenginapan || 0));
      setUangTransport(Number(editData.uangTransport || 0));
      setTaksi(Number(editData.taksi || 0));
      setUangRepresentasi(Number(editData.uangRepresentasi || 0));
      setMaskapaiBerangkat(editData.maskapaiBerangkat || "");
      setNoTiketBerangkat(editData.noTiketBerangkat || "");
      setHargaTiketBerangkat(Number(editData.hargaTiketBerangkat || 0));
      setMaskapaiKembali(editData.maskapaiKembali || "");
      setNoTiketKembali(editData.noTiketKembali || "");
      setHargaTiketKembali(Number(editData.hargaTiketKembali || 0));

      setTransportLokal(Number(editData.transportLokal || 0));

      setNamaKegiatan(editData.namaKegiatan || "");
      setLokasiKegiatan(editData.lokasiKegiatan || "");
      setTransport(Number(editData.transport || 0));
      setDetailPendukung(editData.detailPendukung || "");

      setNoSpm(editData.noSpm || "");
      setNamaRekanan(editData.namaRekanan || "");
      setHotel(editData.hotel || "");
      setJumlahPeserta(Number(editData.jumlahPeserta || 0));
      setJumlahKamar(Number(editData.jumlahKamar || 0));
      setHargaPaket(Number(editData.hargaPaket || 0));
      setBiayaPenginapan(Number(editData.biayaPenginapan || 0));
      setBiayaRuangMeeting(Number(editData.biayaRuangMeeting || 0));

      setNegaraTujuan(editData.negaraTujuan || "");
      setKotaTujuan(editData.kotaTujuan || "");
      setNilaiSPM(Number(editData.nilaiSPM || 0));
      setAsuransi(Number(editData.asuransi || 0));
      setUangHarianPerjalanan(Number(editData.uangHarianPerjalanan || 0));
      setUangHarian100(Number(editData.uangHarian100 || 0));
      setRepresentasi(Number(editData.representasi || 0));
      setPenginapan(Number(editData.penginapan || 0));
      setVisa(Number(editData.visa || 0));
      setBiayaLainnya(Number(editData.biayaLainnya || 0));
    } else {
      handleReset();
    }
  }, [editData, isEditing, type]);

  // Jangka waktu auto calculation: `(tglSelesai - tglMulai) / 86400000 + 1`
  useEffect(() => {
    if (tglMulai && tglSelesai) {
      const dMulai = new Date(tglMulai);
      const dSelesai = new Date(tglSelesai);
      if (!isNaN(dMulai.getTime()) && !isNaN(dSelesai.getTime())) {
        const diffMs = dSelesai.getTime() - dMulai.getTime();
        const days = Math.max(1, Math.round(diffMs / 86400000) + 1);
        setJangkaWaktu(days);
      }
    } else {
      setJangkaWaktu(0);
    }
  }, [tglMulai, tglSelesai]);

  // Pegawai selection triggers auto fill!
  const handlePegawaiSelect = (id: string) => {
    const p = pegawai.find(x => x.id === id);
    if (p) {
      setPegawaiId(p.id);
      setNamaPegawai(p.nama);
      setNip(p.nip);
      setGolongan(p.golongan);
      setJabatan(p.jabatan);
    } else {
      setPegawaiId("");
      setNamaPegawai("");
      setNip("");
      setGolongan("");
      setJabatan("");
    }
  };

  // Grand Total Live Calculations
  const getGrandTotal = () => {
    if (type === "LUAR_KOTA") {
      return Number(uangHarian) + Number(uangPenginapan) + Number(uangTransport) + 
             Number(taksi) + Number(uangRepresentasi) + 
             Number(hargaTiketBerangkat) + Number(hargaTiketKembali);
    }
    if (type === "DALAM_KOTA") {
      return Number(transportLokal) + Number(uangHarian);
    }
    if (type === "PAKET_MEETING") {
      return Number(uangHarian) + Number(transport);
    }
    if (type === "KONTRAK_PAKET_MEETING") {
      return Number(hargaPaket);
    }
    if (type === "LUAR_NEGERI") {
      const jTiket = Number(hargaTiketBerangkat) + Number(hargaTiketKembali);
      // Realisasi = sum of ALL items including taksi, penginapan, visa, etc.
      return jTiket + Number(asuransi) + Number(transportLokal) + 
             Number(uangHarianPerjalanan) + Number(uangHarian100) + Number(representasi) + 
             Number(penginapan) + Number(taksi) + Number(visa) + Number(biayaLainnya);
    }
    return 0;
  };

  // Selisih LN formula: `nilaiSPM - (jumlahTiket + asuransi + transportLokal + uangHarianPerjalanan + uangHarian100 + representasi)`
  const getSelisihLN = () => {
    const jTiket = Number(hargaTiketBerangkat) + Number(hargaTiketKembali);
    return Number(nilaiSPM) - (jTiket + Number(asuransi) + Number(transportLokal) + Number(uangHarianPerjalanan) + Number(uangHarian100) + Number(representasi));
  };

  const currentGrandTotal = getGrandTotal();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Validation
    if (type !== "KONTRAK_PAKET_MEETING" && !pegawaiId) {
      setErrorMsg("Harap pilih Pegawai dari database terlebih dahulu!");
      return;
    }

    let payload: any = {
      noSprint,
      tglMulai,
      tglSelesai
    };

    if (isEditing) {
      payload.id = editData.id;
    }

    // Capture specific fields based on type
    if (type === "LUAR_KOTA") {
      payload = {
        ...payload,
        noKuitansi,
        pegawaiId,
        namaPegawai,
        nip,
        golongan,
        jabatan,
        tempatKeberangkatan,
        tempatTujuan,
        maksudPerjalanan,
        uangHarian,
        uangPenginapan,
        uangTransport,
        taksi,
        uangRepresentasi,
        maskapaiBerangkat,
        noTiketBerangkat,
        hargaTiketBerangkat,
        maskapaiKembali,
        noTiketKembali,
        hargaTiketKembali
      };
    } else if (type === "DALAM_KOTA") {
      payload = {
        ...payload,
        noKuitansi,
        pegawaiId,
        namaPegawai,
        nip,
        golongan,
        jabatan,
        tempatTujuan,
        maksudPerjalanan,
        transportLokal,
        uangHarian
      };
    } else if (type === "PAKET_MEETING") {
      payload = {
        ...payload,
        pegawaiId,
        namaPegawai,
        nip,
        golongan,
        jabatan,
        namaKegiatan,
        lokasiKegiatan,
        uangHarian,
        transport,
        detailPendukung
      };
    } else if (type === "KONTRAK_PAKET_MEETING") {
      payload = {
        ...payload,
        noSpm,
        namaRekanan,
        hotel,
        namaKegiatan,
        jumlahPeserta,
        jumlahKamar,
        hargaPaket,
        biayaPenginapan,
        biayaRuangMeeting
      };
    } else if (type === "LUAR_NEGERI") {
      payload = {
        ...payload,
        pegawaiId,
        namaPegawai,
        nip,
        golongan,
        jabatan,
        maksudPerjalanan,
        negaraTujuan,
        kotaTujuan,
        nilaiSPM,
        maskapaiBerangkat,
        noTiketBerangkat,
        hargaTiketBerangkat,
        maskapaiKembali,
        noTiketKembali,
        hargaTiketKembali,
        asuransi,
        transportLokal,
        uangHarianPerjalanan,
        uangHarian100,
        representasi,
        penginapan,
        taksi,
        visa,
        biayaLainnya
      };
    }

    const success = await onSave(type, payload);
    if (success) {
      setSuccessMsg(isEditing ? "Data SPPD berhasil diupdate!" : "Sukses menyimpan data SPPD ke database terpusat!");
      if (!isEditing) {
        handleReset();
      } else if (onCancelEdit) {
        // give 1.5s delay then close
        setTimeout(() => {
          onCancelEdit();
        }, 1200);
      }
    } else {
      setErrorMsg("Terjadi kesalahan teknis saat menyimpan data.");
    }
  };

  const getFormTitle = () => {
    switch (type) {
      case "LUAR_KOTA": return { label: "SPPD Luar Kota", desc: "Form input Perjalanan Dinas Luar Kota (25 fields)", icon: Plane, bg: "bg-blue-50 border-blue-200 text-blue-700" };
      case "DALAM_KOTA": return { label: "SPPD Dalam Kota", desc: "Form input Perjalanan Dinas Dalam Kota (15 fields)", icon: MapPin, bg: "bg-teal-50 border-teal-200 text-teal-700" };
      case "PAKET_MEETING": return { label: "SPPD Paket Meeting", desc: "Form input Uang Saku & Transport Rapat Umum (15 fields)", icon: FileCheck, bg: "bg-indigo-50 border-indigo-200 text-indigo-700" };
      case "KONTRAK_PAKET_MEETING": return { label: "Kontrak Paket Meeting", desc: "Form pencatatan Rekanan Hotel / EO pelaksana acara (14 fields)", icon: Building, bg: "bg-purple-50 border-purple-200 text-purple-700" };
      case "LUAR_NEGERI": return { label: "SPPD Luar Negeri", desc: "Form Perjalanan Dinas Internasional (31 fields - paling kompleks)", icon: Globe, bg: "bg-pink-50 border-pink-200 text-pink-700" };
    }
  };

  const titleInfo = getFormTitle();
  const IconHeader = titleInfo.icon;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${titleInfo.bg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center">
            <IconHeader className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {isEditing ? `Edit: ${titleInfo.label}` : `Pendaftaran ${titleInfo.label}`}
            </h2>
            <p className="text-xs opacity-90 font-medium">{titleInfo.desc}</p>
          </div>
        </div>

        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer transition-all active:scale-97 shrink-0"
          >
            Batal Ubah
          </button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold shadow-xs">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-bold shadow-xs">
            {errorMsg}
          </div>
        )}

        {/* SECTION 1: PEGAWAI DETAIL */}
        {type !== "KONTRAK_PAKET_MEETING" && (
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-slate-400" />
              1. Identitas Pelaksana Tugas (Auto-Fill)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Pilih Pegawai</label>
                <select
                  required
                  value={pegawaiId}
                  onChange={(e) => handlePegawaiSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold text-slate-700"
                >
                  <option value="">-- Pilih dari Database Pegawai --</option>
                  {pegawai.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.nip.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Nama, NIP, Golongan, Jabatan terisi otomatis setelah dipilih
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">NIP Pegawai</span>
                  <span className="text-xs font-bold text-slate-700 font-mono select-all block py-1">
                    {nip || "Belum dipilih"}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Golongan / Ruang</span>
                  <span className="text-xs font-bold text-slate-700 block py-1">
                    {golongan || "Belum dipilih"}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Jabatan Dinas</span>
                  <span className="text-xs font-bold text-slate-700 block py-1 truncate">
                    {jabatan || "Belum dipilih"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: SURAT PERINTAH / DETAIL PERJALANAN */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
            <Calculator className="w-4 h-4 text-slate-400" />
            2. Detail Agenda Perjalanan Dinas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                {type === "KONTRAK_PAKET_MEETING" ? "Saksi / No. SPM" : "Nomor Surat Perintah Tugas (Sprint)"}
              </label>
              <input
                type="text"
                required
                placeholder={type === "KONTRAK_PAKET_MEETING" ? "Contoh: SPM-0089/RUDNIM/V/2026" : "Contoh: W19.IMI.IMI.3-KP.04.02-1088"}
                value={noSprint}
                onChange={(e) => setNoSprint(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
              />
            </div>

            {(type === "LUAR_KOTA" || type === "DALAM_KOTA") && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Nomor Kuitansi / Kas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: KU-112/RUDNIM/V/2026"
                  value={noKuitansi}
                  onChange={(e) => setNoKuitansi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                />
              </div>
            )}

            {type === "KONTRAK_PAKET_MEETING" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Penyedia Jasa (Rekanan)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT. Borneo Vista Hotelindo"
                  value={namaRekanan}
                  onChange={(e) => setNamaRekanan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={tglMulai}
                onChange={(e) => setTglMulai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Tanggal Selesai</label>
              <input
                type="date"
                required
                value={tglSelesai}
                onChange={(e) => setTglSelesai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Jangka Waktu Dinas</span>
                <span className="text-xs font-bold text-amber-600 block pt-0.5">Auto-Kalkulasi</span>
              </div>
              <span className="text-xl font-bold font-mono text-navy">{jangkaWaktu} Hari</span>
            </div>
            
            {/* SPPD Luar Kota Keberangkatan & Tujuan */}
            {type === "LUAR_KOTA" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Tempat Keberangkatan</label>
                  <input
                    type="text"
                    required
                    value={tempatKeberangkatan}
                    onChange={(e) => setTempatKeberangkatan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Tempat Tujuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta / Singkawang / Entikong"
                    value={tempatTujuan}
                    onChange={(e) => setTempatTujuan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                  />
                </div>
              </>
            )}

            {/* Dalam Kota Tujuan */}
            {type === "DALAM_KOTA" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Tempat / Kanim Tujuan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kanwil Kalbar / Kanim Entikong"
                  value={tempatTujuan}
                  onChange={(e) => setTempatTujuan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                />
              </div>
            )}

            {/* Paket meeting / Rapat */}
            {type === "PAKET_MEETING" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Hotel / Lokasi Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hotel Mercure / Aston Pontianak"
                  value={lokasiKegiatan}
                  onChange={(e) => setLokasiKegiatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                />
              </div>
            )}

            {/* Kontrak meeting hotel */}
            {type === "KONTRAK_PAKET_MEETING" && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Nama Hotel Pelaksana</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Swiss-Belinn Singkawang / Aston"
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                />
              </div>
            )}

            {/* Luar Negeri specific */}
            {type === "LUAR_NEGERI" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Negara Tujuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Malaysia / Singapura / China"
                    value={negaraTujuan}
                    onChange={(e) => setNegaraTujuan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Kota Tujuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kuala Lumpur / Kuching / Beijing"
                    value={kotaTujuan}
                    onChange={(e) => setKotaTujuan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                  />
                </div>
              </>
            )}

          </div>

          {/* Maksud Perjalanan / Nama Kegiatan - Full width text areas */}
          {type !== "KONTRAK_PAKET_MEETING" ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Maksud / Uraian Perjalanan Dinas</label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Pengawalan deportasi deteni Wajib Pajak Asing, serah terima berkas pro-justitia..."
                value={type === "PAKET_MEETING" ? namaKegiatan : maksudPerjalanan}
                onChange={(e) => type === "PAKET_MEETING" ? setNamaKegiatan(e.target.value) : setMaksudPerjalanan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Uraian / Nama Kegiatan Rapat</label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Consolidation Workshop Penyusunan Rencana Kebutuhan Anggaran DIPA TA 2027..."
                value={namaKegiatan}
                onChange={(e) => setNamaKegiatan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold resize-none"
              />
            </div>
          )}
        </div>

        {/* SECTION 3: TIKET DAN TRANSPORTASI DETAIL (LK, LN) */}
        {(type === "LUAR_KOTA" || type === "LUAR_NEGERI") && (
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Plane className="w-4 h-4 text-slate-400" />
              3. Detail Kuitansi Penerbangan (Berangkat & Kembali)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Departure Ticket */}
              <div className="space-y-3 p-3 rounded-lg border border-slate-100 bg-slate-50/20">
                <p className="text-[10px] font-extrabold uppercase text-navy border-b border-slate-100 pb-1 flex items-center gap-1">
                  🛫 Tiket Keberangkatan
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Maskapai</label>
                    <input
                      type="text"
                      placeholder="Lion/Garuda"
                      value={maskapaiBerangkat}
                      onChange={(e) => setMaskapaiBerangkat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">No Penerbangan</label>
                    <input
                      type="text"
                      placeholder="JT-711"
                      value={noTiketBerangkat}
                      onChange={(e) => setNoTiketBerangkat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Tiket</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={hargaTiketBerangkat || ""}
                      onChange={(e) => setHargaTiketBerangkat(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Arrival Ticket */}
              <div className="space-y-3 p-3 rounded-lg border border-slate-100 bg-slate-50/20">
                <p className="text-[10px] font-extrabold uppercase text-navy border-b border-slate-100 pb-1 flex items-center gap-1">
                  🛬 Tiket Kepulangan
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Maskapai</label>
                    <input
                      type="text"
                      placeholder="Citilink/Garuda"
                      value={maskapaiKembali}
                      onChange={(e) => setMaskapaiKembali(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">No Penerbangan</label>
                    <input
                      type="text"
                      placeholder="QG-420"
                      value={noTiketKembali}
                      onChange={(e) => setNoTiketKembali(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Harga Tiket</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={hargaTiketKembali || ""}
                      onChange={(e) => setHargaTiketKembali(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 4: KOMPONEN BIAYA / KEUANGAN DETAILED */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
            <Calculator className="w-4 h-4 text-slate-400" />
            3. Rincian Komponen Anggaran Biaya Realisasi (Rp)
          </h3>

          {/* Form specific fields list */}

          {/* A. LUAR KOTA (Uang Harian, Uang Penginapan, Uang Transport, Taksi, Uang Representasi) + Auto Grand Total */}
          {type === "LUAR_KOTA" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Harian Total</label>
                <input
                  type="number"
                  placeholder="0"
                  value={uangHarian || ""}
                  onChange={(e) => setUangHarian(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Penginapan / Hotel</label>
                <input
                  type="number"
                  placeholder="0"
                  value={uangPenginapan || ""}
                  onChange={(e) => setUangPenginapan(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Transport / BBM</label>
                <input
                  type="number"
                  placeholder="0"
                  value={uangTransport || ""}
                  onChange={(e) => setUangTransport(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Biaya Taksi Bandara</label>
                <input
                  type="number"
                  placeholder="0"
                  value={taksi || ""}
                  onChange={(e) => setTaksi(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Representasi</label>
                <input
                  type="number"
                  placeholder="0"
                  value={uangRepresentasi || ""}
                  onChange={(e) => setUangRepresentasi(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
            </div>
          )}

          {/* B. DALAM KOTA (Transport Lokal & Uang Harian) */}
          {type === "DALAM_KOTA" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Harian Dalam Kota</label>
                <input
                  type="number"
                  placeholder="0"
                  value={uangHarian || ""}
                  onChange={(e) => setUangHarian(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Transport Lokal</label>
                <input
                  type="number"
                  placeholder="0"
                  value={transportLokal || ""}
                  onChange={(e) => setTransportLokal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                />
              </div>
            </div>
          )}

          {/* C. PAKET MEETING (Uang Harian & Transport, Detail Pendukung) */}
          {type === "PAKET_MEETING" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Saku Rapat (Harian)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={uangHarian || ""}
                    onChange={(e) => setUangHarian(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Uang Transportasi Rapat</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={transport || ""}
                    onChange={(e) => setTransport(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Administrasi / Lampiran Dokumen Surat Undang</label>
                <input
                  type="text"
                  placeholder="Contoh: Surat Undangan Nomor W19-UM.01.01-0941"
                  value={detailPendukung}
                  onChange={(e) => setDetailPendukung(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold"
                />
              </div>
            </div>
          )}

          {/* D. KONTRAK PAKET MEETING (jumlahPeserta, jumlahKamar, hargaPaket, biayaPenginapan, biayaRuangMeeting) */}
          {type === "KONTRAK_PAKET_MEETING" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-2 border-b border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={jumlahPeserta || ""}
                    onChange={(e) => setJumlahPeserta(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah Kamar</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={jumlahKamar || ""}
                    onChange={(e) => setJumlahKamar(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Komponen Biaya Kamar</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={biayaPenginapan || ""}
                    onChange={(e) => setBiayaPenginapan(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Komponen Sewa Ruang Rapat</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={biayaRuangMeeting || ""}
                    onChange={(e) => setBiayaRuangMeeting(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nilai Kontrak Total (Harga Paket)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={hargaPaket || ""}
                  onChange={(e) => setHargaPaket(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-accent focus:outline-hidden font-bold font-mono text-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * Untuk Paket Kontrak, Grand Total dihitung dari Nilai Kontrak ini
                </p>
              </div>
            </div>
          )}

          {/* E. LUAR NEGERI (31 fields total setup - paling kompleks) */}
          {type === "LUAR_NEGERI" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-amber-50/10 p-4 rounded-lg border border-amber-500/20">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1 flex items-center gap-1">
                    💰 Pagu Nilai SPM (Uang Muka)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={nilaiSPM || ""}
                    onChange={(e) => setNilaiSPM(Number(e.target.value))}
                    className="w-full bg-white border border-amber-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-bold font-mono text-amber-800"
                  />
                </div>
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Tiket Udara</span>
                    <span className="text-xs font-bold text-slate-700 block font-mono py-1 bg-slate-50 px-2 rounded">
                      {formatIDR(Number(hargaTiketBerangkat) + Number(hargaTiketKembali))}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Selisih Refund SPM</span>
                    <span className={`text-xs font-bold block font-mono py-1 px-2 rounded ${getSelisihLN() >= 0 ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
                      {formatIDR(getSelisihLN())}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Status Keuangan</span>
                    <span className={`text-xs font-bold block py-1 px-2 rounded ${getSelisihLN() >= 0 ? "text-green-700 bg-green-50" : "text-amber-700 bg-amber-50"}`}>
                      {getSelisihLN() >= 0 ? "Sisa Dikembalikan" : "Kekurangan Bayar"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Komponen LN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Asuransi Perjalanan</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={asuransi || ""}
                    onChange={(e) => setAsuransi(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transport Lokal LN</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={transportLokal || ""}
                    onChange={(e) => setTransportLokal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Uang Harian Perjalanan (Hari Jalan)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={uangHarianPerjalanan || ""}
                    onChange={(e) => setUangHarianPerjalanan(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Uang Harian 100% (Hari Dinas)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={uangHarian100 || ""}
                    onChange={(e) => setUangHarian100(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Representasi LN</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={representasi || ""}
                    onChange={(e) => setRepresentasi(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hotel / Penginapan LN</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={penginapan || ""}
                    onChange={(e) => setPenginapan(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Taksi Bandara LN</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={taksi || ""}
                    onChange={(e) => setTaksi(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Visa / Keperluan Internasional</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={visa || ""}
                    onChange={(e) => setVisa(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Biaya Admin Lain-lain</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={biayaLainnya || ""}
                    onChange={(e) => setBiayaLainnya(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-semibold font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TOTAL SUMMARY CALCULATION GAUGE */}
          <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-accent">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {type === "LUAR_NEGERI" ? "REALISASI TOTAL DIKEBALI (AUTO)" : "GRAND TOTAL PENGELUARAN (AUTO)"}
                </h4>
                <p className="text-[10px] text-slate-400">Total terakumulasi otomatis dari input formulir di atas</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold text-accent font-mono tracking-tight block">
                {formatIDR(currentGrandTotal)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">rupiah (idr)</span>
            </div>
          </div>

        </div>

        {/* SUBMIT ACTIONS CONTAINER */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          {!isEditing && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-97"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Formulir</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy hover:bg-navy-mid text-white rounded-lg text-xs font-extrabold cursor-pointer transition-all active:scale-98 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? "Update Data" : "Simpan Data ke Sheet"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
