import React, { useState } from "react";
import * as XLSX from "xlsx";
import { 
  Search, 
  Download, 
  Calendar, 
  FileText, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  CornerDownRight,
  Layers,
  Cloud
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

import { getAccessToken } from "../auth";

interface SppdRecapProps {
  pegawai: Pegawai[];
  sppdLuarKota: SPPDLuarKota[];
  sppdDalamKota: SPPDDalamKota[];
  sppdPaketMeeting: SPPDPaketMeeting[];
  kontrakPaketMeeting: KontrakPaketMeeting[];
  sppdLuarNegeri: SPPDLuarNegeri[];
  onEdit: (type: SppdType, record: any) => void;
  onDelete: (type: SppdType, id: string) => Promise<boolean>;
  onRefresh: () => void;
  isLoading: boolean;
  user?: any;
  onRequireLogin?: () => void;
}

type FilterType = "SEMUA" | SppdType;

export default function SppdRecap({
  pegawai = [],
  sppdLuarKota = [],
  sppdDalamKota = [],
  sppdPaketMeeting = [],
  kontrakPaketMeeting = [],
  sppdLuarNegeri = [],
  onEdit,
  onDelete,
  onRefresh,
  isLoading,
  user,
  onRequireLogin
}: SppdRecapProps) {
  
  // Filter states
  const [filterType, setFilterType] = useState<FilterType>("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSpm, setSearchSpm] = useState("");
  const [selectedPegawaiId, setSelectedPegawaiId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sorting states
  const [sortField, setSortField] = useState<string>("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  const [isExportingGS, setIsExportingGS] = useState<boolean>(false);

  // Compile active unified lists based on filterType
  const getUnifiedList = () => {
    const list: any[] = [];

    if (filterType === "SEMUA" || filterType === "LUAR_KOTA") {
      sppdLuarKota.forEach(x => {
        list.push({
          ...x,
          sourceType: "LUAR_KOTA" as SppdType,
          typeLabel: "Luar Kota",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
          cost: x.grandTotal,
          docNo: x.noSprint,
          penerima: x.namaPegawai,
          kegiatan: x.maksudPerjalanan,
          destination: x.tempatTujuan || "Luar Kota",
          date: x.tglMulai
        });
      });
    }

    if (filterType === "SEMUA" || filterType === "DALAM_KOTA") {
      sppdDalamKota.forEach(x => {
        list.push({
          ...x,
          sourceType: "DALAM_KOTA" as SppdType,
          typeLabel: "Dalam Kota",
          badgeColor: "bg-teal-50 text-teal-700 border-teal-100",
          cost: x.grandTotal,
          docNo: x.noSprint,
          penerima: x.namaPegawai,
          kegiatan: x.maksudPerjalanan,
          destination: x.tempatTujuan || "Dalam Kota",
          date: x.tglMulai
        });
      });
    }

    if (filterType === "SEMUA" || filterType === "PAKET_MEETING") {
      sppdPaketMeeting.forEach(x => {
        list.push({
          ...x,
          sourceType: "PAKET_MEETING" as SppdType,
          typeLabel: "Paket Meeting",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
          cost: x.grandTotal,
          docNo: x.noSprint,
          penerima: x.namaPegawai,
          kegiatan: x.namaKegiatan,
          destination: x.lokasiKegiatan || "Hotel",
          date: x.tglMulai
        });
      });
    }

    if (filterType === "SEMUA" || filterType === "KONTRAK_PAKET_MEETING") {
      kontrakPaketMeeting.forEach(x => {
        list.push({
          ...x,
          sourceType: "KONTRAK_PAKET_MEETING" as SppdType,
          typeLabel: "Kontrak Hotel",
          badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
          cost: x.grandTotal,
          docNo: x.noSpm,
          penerima: x.namaRekanan,
          kegiatan: x.namaKegiatan,
          destination: x.hotel || "Lokasi Acara",
          date: x.tglMulai
        });
      });
    }

    if (filterType === "SEMUA" || filterType === "LUAR_NEGERI") {
      sppdLuarNegeri.forEach(x => {
        list.push({
          ...x,
          sourceType: "LUAR_NEGERI" as SppdType,
          typeLabel: "Luar Negeri",
          badgeColor: "bg-pink-50 text-pink-700 border-pink-100",
          cost: x.realisasiTotal,
          docNo: x.noSprint,
          penerima: x.namaPegawai,
          kegiatan: x.maksudPerjalanan,
          destination: `${x.kotaTujuan}, ${x.negaraTujuan}`,
          date: x.tglMulai
        });
      });
    }

    return list;
  };

  const masterList = getUnifiedList();

  // Apply filters in client side
  const filteredList = masterList.filter(item => {
    // search query (pegawai name or rekanan, activities, destinantion)
    const matchQuery = 
      item.penerima?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kegiatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination?.toLowerCase().includes(searchQuery.toLowerCase());

    // SPM or Sprint filter
    const matchSpm = searchSpm 
      ? item.docNo?.toLowerCase().includes(searchSpm.toLowerCase())
      : true;

    // Pegawai Select filter
    const matchPegawai = selectedPegawaiId
      ? item.pegawaiId === selectedPegawaiId
      : true;

    // Date range filter
    let matchDates = true;
    if (startDate) {
      matchDates = matchDates && (new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
      matchDates = matchDates && (new Date(item.date) <= new Date(endDate));
    }

    return matchQuery && matchSpm && matchPegawai && matchDates;
  });

  // Apply sorting
  const sortedList = [...filteredList].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "cost") {
      valA = a.cost;
      valB = b.cost;
    }
    if (sortField === "date") {
      valA = new Date(a.date).getTime();
      valB = new Date(b.date).getTime();
    }

    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

    if (typeof valA === "string") {
      return sortAsc 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortAsc 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    }
  });

  // Calculate totals per current selection
  const totalCostFiltered = filteredList.reduce((sum, item) => sum + Number(item.cost || 0), 0);

  // Pagination bounds
  const totalItems = sortedList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  const handleDeleteItem = async (type: SppdType, id: string, docNo: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus arsip SPPD Nomor: \n"${docNo}" secara permanen?`)) {
      const ok = await onDelete(type, id);
      if (ok) {
        // reset pagination if item is removed
        if (paginatedList.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchSpm("");
    setSelectedPegawaiId("");
    setStartDate("");
    setEndDate("");
    setFilterType("SEMUA");
    setCurrentPage(1);
  };

  // Excel Generator logic using SheetJS (xlsx)
  const handleExportExcel = () => {
    if (filteredList.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    // Prepare workbook
    const wb = XLSX.utils.book_new();
    
    // Set up title & metadata rows
    const titleRows = [
      ["REKAPITULASI REALISASI BIAYA SPPD - RUDENIM PONTIANAK"],
      [`Skema Laporan: ${filterType === "SEMUA" ? "KONSOLIDASI SEMUA DOKUMEN" : "SPPD " + filterType.replace(/_/g, " ")}`],
      [`Periode Pencarian: ${startDate || "Semenjak Awal"} s/d ${endDate || "Sekarang"}`],
      [`Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`],
      [] // Separator empty row
    ];

    let headers: string[] = [];
    let dataRows: any[][] = [];

    const fC = (val: any) => ({ v: Number(val || 0), t: "n", z: '"Rp"#,##0' }); // Formatted Currency cell
    const fN = (val: any) => ({ v: Number(val || 0), t: "n", z: '#,##0' }); // Formatted Number cell
    const fS = (val: any) => ({ v: val === undefined || val === null ? "" : String(val), t: "s" }); // String cell

    if (filterType === "SEMUA") {
      headers = ["No", "Jenis SPPD", "Tanggal", "No Sprint / SPM", "Pegawai / Rekanan", "Keperluan Serta Lokasi", "Jangka Waktu (Hari)", "Total Realisasi Biaya"];
      dataRows = filteredList.map((item, idx) => [
        fN(idx + 1),
        fS(item.typeLabel),
        fS(item.date),
        fS(item.docNo),
        fS(item.penerima),
        fS(`${item.kegiatan} (${item.destination})`),
        fN(item.jangkaWaktu),
        fC(item.cost)
      ]);
    } else if (filterType === "LUAR_KOTA") {
      headers = [
        "No", "No Sprint", "No Kuitansi", "Nama Pegawai", "NIP", "Golongan", "Jabatan", 
        "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Tujuan", "Uang Harian", "Uang Penginapan", 
        "Transport", "Taksi/Lokal", "Representasi", "Tiket Berangkat", "Tiket Kembali", "Grand Total"
      ];
      dataRows = filteredList.map((item, idx) => [
        fN(idx + 1), fS(item.noSprint), fS(item.noKuitansi), fS(item.penerima), fS(item.nip), fS(item.golongan), fS(item.jabatan),
        fS(item.tglMulai), fS(item.tglSelesai), fN(item.jangkaWaktu), fS(item.destination),
        fC(item.uangHarian), fC(item.uangPenginapan), fC(item.uangTransport), fC(item.taksi), fC(item.uangRepresentasi), 
        fC(item.hargaTiketBerangkat), fC(item.hargaTiketKembali), fC(item.grandTotal)
      ]);
    } else if (filterType === "DALAM_KOTA") {
      headers = [
        "No", "No Sprint", "No Kuitansi", "Nama Pegawai", "NIP", "Golongan", "Jabatan", 
        "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Tujuan", "Transport Lokal", "Uang Harian", "Grand Total"
      ];
      dataRows = filteredList.map((item, idx) => [
        fN(idx + 1), fS(item.noSprint), fS(item.noKuitansi), fS(item.penerima), fS(item.nip), fS(item.golongan), fS(item.jabatan),
        fS(item.tglMulai), fS(item.tglSelesai), fN(item.jangkaWaktu), fS(item.destination),
        fC(item.transportLokal), fC(item.uangHarian), fC(item.grandTotal)
      ]);
    } else if (filterType === "PAKET_MEETING") {
      headers = [
        "No", "No Sprint", "Nama Pegawai", "NIP", "Golongan", "Jabatan", "Nama Kegiatan", 
        "Hotel/Lokasi", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Uang Harian Rapat", 
        "Transport Rapat", "Undangan Dinas", "Grand Total"
      ];
      dataRows = filteredList.map((item, idx) => [
        fN(idx + 1), fS(item.noSprint), fS(item.penerima), fS(item.nip), fS(item.golongan), fS(item.jabatan), fS(item.kegiatan),
        fS(item.destination), fS(item.tglMulai), fS(item.tglSelesai), fN(item.jangkaWaktu),
        fC(item.uangHarian), fC(item.transport), fS(item.detailPendukung), fC(item.grandTotal)
      ]);
    } else if (filterType === "KONTRAK_PAKET_MEETING") {
      headers = [
        "No", "No SPM", "Nama Rekanan", "Hotel", "Nama Kegiatan", "Tgl Mulai", "Tgl Selesai", 
        "Jangka (Hari)", "Jumlah Peserta", "Jumlah Kamar", "Harga Kontrak", "Biaya Hotel Bed", 
        "Biaya Aula", "Grand Total"
      ];
      dataRows = filteredList.map((item, idx) => [
        fN(idx + 1), fS(item.docNo), fS(item.penerima), fS(item.destination), fS(item.kegiatan), fS(item.tglMulai), fS(item.tglSelesai), fN(item.jangkaWaktu),
        fN(item.jumlahPeserta), fN(item.jumlahKamar), fC(item.hargaPaket), fC(item.biayaPenginapan), fC(item.biayaRuangMeeting), fC(item.grandTotal)
      ]);
    } else if (filterType === "LUAR_NEGERI") {
      headers = [
        "No", "No Sprint", "Nama Pegawai", "NIP", "Golongan", "Jabatan", "Maksud Perjalanan", 
        "Negara", "Kota", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "SPM Alokasi", 
        "Harga Tiket Udara", "Asuransi", "Transport Lokal", "Harian Perjalanan", "Harian Rapat 100", 
        "Representasi", "Hotel Penginapan", "Realisasi Total", "Selisih Refund"
      ];
      dataRows = filteredList.map((item, idx) => [
        fN(idx + 1), fS(item.noSprint), fS(item.penerima), fS(item.nip), fS(item.golongan), fS(item.jabatan), fS(item.kegiatan), fS(item.negaraTujuan), fS(item.kotaTujuan), fS(item.tglMulai), fS(item.tglSelesai), fN(item.jangkaWaktu),
        fC(item.nilaiSPM), fC(item.jumlahTiket), fC(item.asuransi), fC(item.transportLokal), fC(item.uangHarianPerjalanan), fC(item.uangHarian100), fC(item.representasi), fC(item.penginapan), fC(item.realisasiTotal), fC(item.selisih)
      ]);
    }

    // Format headers to be cell objects
    const formattedHeaders = headers.map(h => fS(h));

    // Compile entire sheet matrix
    const aoa = [
      ...titleRows,
      formattedHeaders,
      ...dataRows
    ];

    // Total summary bar at down-bottom
    const totalRow = Array(headers.length).fill(fS(""));
    totalRow[0] = fS("JUMLAH TOTAL REKAPITULASI");
    totalRow[headers.length - 1] = fC(totalCostFiltered);
    aoa.push([]); // Empty spacing
    aoa.push(totalRow);

    // Convert build array toSheet
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Auto-measure maximum column width
    const colWidths = headers.map((_, colIdx) => {
      let maxLen = headers[colIdx].length;
      dataRows.forEach(row => {
        const cell = row[colIdx];
        const cellVal = cell && cell.v !== undefined ? String(cell.v) : "";
        let valLen = cellVal.length;
        if (cell && cell.z && cell.z.includes("Rp")) {
          valLen += 8; // Offset for formatting characters like Currency spaces
        }
        if (valLen > maxLen) {
          maxLen = valLen;
        }
      });
      return { wch: Math.max(maxLen + 4, 11) };
    });

    // Merge title spans nicely
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }
    ];

    ws['!cols'] = colWidths;

    // Output book
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Realisasi SPPD");
    const safeTypeName = filterType.replace(/_/g, "-");
    XLSX.writeFile(wb, `REKAP_SPPD_RUDNIM_PONTIANAK_${safeTypeName}_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const handleExportGoogleSheets = async () => {
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    
    if (filteredList.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    try {
      setIsExportingGS(true);
      const accessToken = await getAccessToken();
      if (!accessToken) {
        if (onRequireLogin) onRequireLogin();
        return;
      }

      // We re-build the grid without SheetJS formats, just primitive values for Google Sheets API.
      const titleRows = [
        ["REKAPITULASI REALISASI BIAYA SPPD - RUDENIM PONTIANAK"],
        [`Skema Laporan: ${filterType === "SEMUA" ? "KONSOLIDASI SEMUA DOKUMEN" : "SPPD " + filterType.replace(/_/g, " ")}`],
        [`Periode Pencarian: ${startDate || "Semenjak Awal"} s/d ${endDate || "Sekarang"}`],
        [`Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`],
        []
      ];

      let headers: string[] = [];
      let dataRows: any[][] = [];

      if (filterType === "SEMUA") {
        headers = ["No", "Jenis SPPD", "Tanggal", "No Sprint / SPM", "Pegawai / Rekanan", "Keperluan Serta Lokasi", "Jangka Waktu (Hari)", "Total Realisasi Biaya"];
        dataRows = filteredList.map((item, idx) => [
          idx + 1, item.typeLabel, item.date, item.docNo, item.penerima, `${item.kegiatan} (${item.destination})`, Number(item.jangkaWaktu), Number(item.cost || 0)
        ]);
      } else if (filterType === "LUAR_KOTA") {
        headers = ["No", "No Sprint", "No Kuitansi", "Nama Pegawai", "NIP", "Golongan", "Jabatan", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Tujuan", "Uang Harian", "Uang Penginapan", "Transport", "Taksi/Lokal", "Representasi", "Tiket Berangkat", "Tiket Kembali", "Grand Total"];
        dataRows = filteredList.map((item, idx) => [
          idx + 1, item.noSprint, item.noKuitansi, item.penerima, item.nip, item.golongan, item.jabatan, item.tglMulai, item.tglSelesai, Number(item.jangkaWaktu), item.destination, Number(item.uangHarian || 0), Number(item.uangPenginapan || 0), Number(item.uangTransport || 0), Number(item.taksi || 0), Number(item.uangRepresentasi || 0), Number(item.hargaTiketBerangkat || 0), Number(item.hargaTiketKembali || 0), Number(item.grandTotal || 0)
        ]);
      } else if (filterType === "DALAM_KOTA") {
        headers = ["No", "No Sprint", "No Kuitansi", "Nama Pegawai", "NIP", "Golongan", "Jabatan", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Tujuan", "Transport Lokal", "Uang Harian", "Grand Total"];
        dataRows = filteredList.map((item, idx) => [
          idx + 1, item.noSprint, item.noKuitansi, item.penerima, item.nip, item.golongan, item.jabatan, item.tglMulai, item.tglSelesai, Number(item.jangkaWaktu), item.destination, Number(item.transportLokal || 0), Number(item.uangHarian || 0), Number(item.grandTotal || 0)
        ]);
      } else if (filterType === "PAKET_MEETING") {
        headers = ["No", "No Sprint", "Nama Pegawai", "NIP", "Golongan", "Jabatan", "Nama Kegiatan", "Hotel/Lokasi", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Uang Harian Rapat", "Transport Rapat", "Undangan Dinas", "Grand Total"];
        dataRows = filteredList.map((item, idx) => [
          idx + 1, item.noSprint, item.penerima, item.nip, item.golongan, item.jabatan, item.kegiatan, item.destination, item.tglMulai, item.tglSelesai, Number(item.jangkaWaktu), Number(item.uangHarian || 0), Number(item.transport || 0), item.detailPendukung, Number(item.grandTotal || 0)
        ]);
      } else if (filterType === "KONTRAK_PAKET_MEETING") {
        headers = ["No", "No SPM", "Nama Rekanan", "Hotel", "Nama Kegiatan", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "Jumlah Peserta", "Jumlah Kamar", "Harga Kontrak", "Biaya Hotel Bed", "Biaya Aula", "Grand Total"];
        dataRows = filteredList.map((item, idx) => [
          idx + 1, item.docNo, item.penerima, item.destination, item.kegiatan, item.tglMulai, item.tglSelesai, Number(item.jangkaWaktu), Number(item.jumlahPeserta), Number(item.jumlahKamar), Number(item.hargaPaket || 0), Number(item.biayaPenginapan || 0), Number(item.biayaRuangMeeting || 0), Number(item.grandTotal || 0)
        ]);
      } else if (filterType === "LUAR_NEGERI") {
        headers = ["No", "No Sprint", "Nama Pegawai", "NIP", "Golongan", "Jabatan", "Maksud Perjalanan", "Negara", "Kota", "Tgl Mulai", "Tgl Selesai", "Jangka (Hari)", "SPM Alokasi", "Harga Tiket Udara", "Asuransi", "Transport Lokal", "Harian Perjalanan", "Harian Rapat 100", "Representasi", "Hotel Penginapan", "Realisasi Total", "Selisih Refund"];
        dataRows = filteredList.map((item, idx) => [
          idx + 1, item.noSprint, item.penerima, item.nip, item.golongan, item.jabatan, item.kegiatan, item.negaraTujuan, item.kotaTujuan, item.tglMulai, item.tglSelesai, Number(item.jangkaWaktu), Number(item.nilaiSPM || 0), Number(item.jumlahTiket || 0), Number(item.asuransi || 0), Number(item.transportLokal || 0), Number(item.uangHarianPerjalanan || 0), Number(item.uangHarian100 || 0), Number(item.representasi || 0), Number(item.penginapan || 0), Number(item.realisasiTotal || 0), Number(item.selisih || 0)
        ]);
      }

      const gridData = [
        ...titleRows,
        headers,
        ...dataRows,
        [],
        ["JUMLAH TOTAL REKAPITULASI", ...Array(headers.length - 2).fill(""), Number(totalCostFiltered || 0)]
      ];

      // 1. Create a new Spreadsheet
      const safeTypeName = filterType.replace(/_/g, " ");
      const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: `REKAP SPPD RUDENIM PONTIANAK - ${safeTypeName} (${new Date().toLocaleDateString('id-ID')})`
          }
        })
      });
      
      if (!createResponse.ok) {
        const errText = await createResponse.text();
        console.error("Sheets Create Error:", errText);
        throw new Error("Gagal membuat Google Sheets: " + errText);
      }
      const createData = await createResponse.json();
      const spreadsheetId = createData.spreadsheetId;

      // 2. Put the array into the sheets view.
      const updateResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          range: "A1",
          majorDimension: "ROWS",
          values: gridData
        })
      });

      if (!updateResponse.ok) {
        const errText = await updateResponse.text();
        console.error("Sheets Update Error:", errText);
        throw new Error("Gagal menulis data ke Google Sheets: " + errText);
      }

      // Success
      alert(`Berhasil mengekspor ke Google Sheets!\n\nSpreadsheet berjudul "${createData.properties.title}" telah disimpan di Google Drive Anda.`);
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, "_blank");
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menghubungi Google Sheets API.");
    } finally {
      setIsExportingGS(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-500" />
            Sistem Penyaringan & Seleksi Data SPPD
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sinkron</span>
            </button>

            <button
              onClick={handleClearFilters}
              className="p-1 px-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold rounded cursor-pointer transition-all"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Filter Selection Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Skema / Kategori SPPD</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as FilterType);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-hidden focus:border-navy"
            >
              <option value="SEMUA">🌐 Semua Jenis SPPD</option>
              <option value="LUAR_KOTA">✈️ SPPD Luar Kota</option>
              <option value="DALAM_KOTA">🏙️ SPPD Dalam Kota</option>
              <option value="PAKET_MEETING">🏢 SPPD Paket Meeting</option>
              <option value="KONTRAK_PAKET_MEETING">🤝 Kontrak Rapat Hotel</option>
              <option value="LUAR_NEGERI">🌍 SPPD Luar Negeri</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Penerima Tugas / Pegawai</label>
            <select
              value={selectedPegawaiId}
              onChange={(e) => {
                setSelectedPegawaiId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:bg-white focus:outline-hidden focus:border-navy"
            >
              <option value="">-- Semua Pegawai --</option>
              {pegawai.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nomor Sprint / SPM</label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: W19-KP..."
                value={searchSpm}
                onChange={(e) => {
                  setSearchSpm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2.5 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:border-navy font-semibold text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kata Kunci (Kegiatan/Tujuan)</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari kegiatan, kota..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 pl-8 pr-2.5 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:border-navy font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Filter Selection Row 2 (Dates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Tanggal Mulai (Dari)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 font-semibold focus:bg-white focus:outline-hidden focus:border-navy"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Tanggal Mulai (Selesai)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 font-semibold focus:bg-white focus:outline-hidden focus:border-navy"
            />
          </div>

          <div className="md:col-span-2 flex items-end justify-end gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleExportGoogleSheets}
              disabled={isExportingGS}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-500 hover:bg-green-600 focus:ring focus:ring-green-300 disabled:opacity-60 active:scale-97 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md select-none"
              title="Ekspor pencarian ke Google Sheets"
            >
              {isExportingGS ? <RefreshCw className="w-4 h-4 text-white animate-spin" /> : <Cloud className="w-4 h-4 text-white" />}
              <span>{user ? "Ekspor Sheets" : "Login ke Sheets"}</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 active:scale-97 text-navy text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md select-none"
              title="Ekspor pencarian ke file Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-navy" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recap Statistics Header Card */}
      <div className="bg-navy text-white rounded-xl p-5 shadow-xs border border-navy-mid flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            {filterType === "SEMUA" ? "Ringkasan Konsolidasi Seleksi" : `Ringkasan Realisasi Spontan - ${filterType.replace(/_/g, " ")}`}
          </h4>
          <p className="text-sm font-bold text-slate-100 mt-1">
            Menampilkan {filteredList.length} dari total {masterList.length} berkas yang tersaring dinamis
          </p>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-widest">Total Realisasi Terserap</p>
          <span className="text-xl font-bold font-mono tracking-tight text-white block">
            {formatIDR(totalCostFiltered)}
          </span>
        </div>
      </div>

      {/* RECAP TABLE VIEW CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 cursor-pointer select-none hover:text-navy hover:bg-slate-100/50" onClick={() => toggleSort("typeLabel")}>
                  <div className="flex items-center gap-1">
                    <span>Jenis SPPD</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer select-none hover:text-navy hover:bg-slate-100/50 hover:bg-zinc-100" onClick={() => toggleSort("date")}>
                  <div className="flex items-center gap-1">
                    <span>Tanggal</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Sprint / SPM No</th>
                <th className="py-3 px-4 cursor-pointer select-none hover:text-navy hover:bg-slate-100/50" onClick={() => toggleSort("penerima")}>
                  <div className="flex items-center gap-1">
                    <span>Pegawai / Pelaksana</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Agenda Tugas & Tujuan</th>
                <th className="py-3 px-4 text-center">Durasi</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-navy hover:bg-slate-100/50" onClick={() => toggleSort("cost")}>
                  <div className="flex items-center gap-1 justify-end">
                    <span>Biaya Realisasi</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedList.length > 0 ? (
                paginatedList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all font-medium">
                    {/* No */}
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Badge Jenis */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider block text-center w-fit ${item.badgeColor}`}>
                        {item.typeLabel}
                      </span>
                    </td>

                    {/* Tanggal */}
                    <td className="py-4 px-4 font-semibold text-slate-500 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Sprint / SPM No */}
                    <td className="py-4 px-4 text-slate-700 font-mono tracking-tight text-[11px] select-all">
                      {item.docNo}
                    </td>

                    {/* Pegawai Name / NIP / Rekanan */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{item.penerima}</p>
                      {item.nip && (
                        <p className="text-[9px] text-slate-400 font-mono tracking-tight leading-none mt-0.5">
                          NIP. {item.nip}
                        </p>
                      )}
                    </td>

                    {/* Agenda & Tujuan */}
                    <td className="py-4 px-4 max-w-sm">
                      <p className="text-slate-600 line-clamp-1" title={item.kegiatan}>{item.kegiatan}</p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                        <CornerDownRight className="w-2.5 h-2.5 shrink-0" />
                        <span>Ke: {item.destination}</span>
                      </p>
                    </td>

                    {/* Durasi */}
                    <td className="py-4 px-4 text-center font-bold text-slate-600 font-mono">
                      {item.jangkaWaktu} Hari
                    </td>

                    {/* Real Biaya */}
                    <td className="py-4 px-4 text-right font-bold text-slate-800 font-mono text-[13px] whitespace-nowrap">
                      {formatIDR(item.cost)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1.5 no-print">
                        <button
                          onClick={() => onEdit(item.sourceType, item)}
                          className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 cursor-pointer transition-all active:scale-95"
                          title="Ubah rincian SPPD"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.sourceType, item.id, item.docNo)}
                          className="p-1 px-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-600 cursor-pointer transition-all active:scale-95"
                          title="Hapus permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400 space-y-2">
                    <p className="font-bold">Arsip laporan tidak ditemukan</p>
                    <p className="text-[11px] text-slate-400">Silakan sesuaikan filter pencarian atau input data baru.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Menampilkan <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-bold">{totalItems}</span> dokumen
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-500 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 flex items-center justify-center text-xs rounded font-bold cursor-pointer transition-all ${
                    currentPage === idx + 1 
                      ? "bg-navy text-white shadow-xs" 
                      : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded text-slate-500 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
