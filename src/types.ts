export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  golongan: string;
  jabatan: string;
}

export interface SPPDLuarKota {
  id: string;
  noSprint: string;
  noKuitansi: string;
  pegawaiId: string;
  namaPegawai: string;
  nip: string;
  golongan: string;
  jabatan: string;
  tglMulai: string;
  tglSelesai: string;
  jangkaWaktu: number; // auto
  maksudPerjalanan: string;
  tempatKeberangkatan: string;
  tempatTujuan: string;
  uangHarian: number;
  uangPenginapan: number;
  uangTransport: number;
  taksi: number;
  uangRepresentasi: number;
  maskapaiBerangkat: string;
  noTiketBerangkat: string;
  hargaTiketBerangkat: number;
  maskapaiKembali: string;
  noTiketKembali: string;
  hargaTiketKembali: number;
  grandTotal: number; // auto
}

export interface SPPDDalamKota {
  id: string;
  noSprint: string;
  noKuitansi: string;
  pegawaiId: string;
  namaPegawai: string;
  nip: string;
  golongan: string;
  jabatan: string;
  tglMulai: string;
  tglSelesai: string;
  jangkaWaktu: number; // auto
  maksudPerjalanan: string;
  tempatTujuan: string;
  transportLokal: number;
  uangHarian: number;
  grandTotal: number; // auto
}

export interface SPPDPaketMeeting {
  id: string;
  noSprint: string;
  pegawaiId: string;
  namaPegawai: string;
  nip: string;
  golongan: string;
  jabatan: string;
  namaKegiatan: string;
  lokasiKegiatan: string;
  tglMulai: string;
  tglSelesai: string;
  jangkaWaktu: number; // auto
  uangHarian: number;
  transport: number;
  detailPendukung: string;
  grandTotal: number; // auto
}

export interface KontrakPaketMeeting {
  id: string;
  noSpm: string;
  namaRekanan: string;
  hotel: string;
  namaKegiatan: string;
  tglMulai: string;
  tglSelesai: string;
  jangkaWaktu: number; // auto
  jumlahPeserta: number;
  jumlahKamar: number;
  hargaPaket: number;
  biayaPenginapan: number;
  biayaRuangMeeting: number;
  grandTotal: number; // auto
}

export interface SPPDLuarNegeri {
  id: string;
  noSprint: string;
  pegawaiId: string;
  namaPegawai: string;
  nip: string;
  golongan: 'A' | 'B' | 'C' | 'D';
  jabatan: string;
  maksudPerjalanan: string;
  negaraTujuan: string;
  kotaTujuan: string;
  tglMulai: string;
  tglSelesai: string;
  jangkaWaktu: number; // auto
  nilaiSPM: number;
  maskapaiBerangkat: string;
  noTiketBerangkat: string;
  hargaTiketBerangkat: number;
  maskapaiKembali: string;
  noTiketKembali: string;
  hargaTiketKembali: number;
  jumlahTiket: number; // auto (hargaTiketBerangkat + hargaTiketKembali)
  asuransi: number;
  transportLokal: number;
  uangHarianPerjalanan: number;
  uangHarian100: number;
  representasi: number;
  penginapan: number;
  taksi: number;
  visa: number;
  biayaLainnya: number;
  realisasiTotal: number; // auto (all real expenses)
  selisih: number; // auto (nilaiSPM - (jumlahTiket + asuransi + transportLokal + uangHarianPerjalanan + uangHarian100 + representasi))
}

export type SppdType = 'LUAR_KOTA' | 'DALAM_KOTA' | 'PAKET_MEETING' | 'KONTRAK_PAKET_MEETING' | 'LUAR_NEGERI';

export interface DashboardStats {
  totalRealisasi: number;
  totalPerjalanan: number;
  countByType: Record<SppdType, number>;
  totalBudgetByType: Record<SppdType, number>;
  tripsPerMonth: { month: string; counts: Record<SppdType, number>; total: number }[];
  topPegawai: { name: string; nip: string; count: number; totalCost: number }[];
}
