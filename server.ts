import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Define Types inside server for standard standalone execution
interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  golongan: string;
  jabatan: string;
}

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "sppd_db.json");

// Define Initial Data
const defaultPegawai: Pegawai[] = [
  {
    id: "peg-1",
    nama: "Herry Bejo, S.H., M.H.",
    nip: "197508212000031002",
    golongan: "IV/b",
    jabatan: "Kepala Rumah Detensi Imigrasi"
  },
  {
    id: "peg-2",
    nama: "Budi Santoso, S.Sos.",
    nip: "198210152006041001",
    golongan: "III/d",
    jabatan: "Kepala Sub Bagian Tata Usaha (PPK)"
  },
  {
    id: "peg-3",
    nama: "Agus Pratama, A.Md.Im.",
    nip: "198904122011011003",
    golongan: "III/c",
    jabatan: "Kepala Seksi Registrasi, Administrasi dan Pelaporan"
  },
  {
    id: "peg-4",
    nama: "Siti Rahmawati, S.E.",
    nip: "199112022014032002",
    golongan: "III/b",
    jabatan: "Bendahara Pengeluaran"
  },
  {
    id: "peg-5",
    nama: "Diana Lestari, S.Ak.",
    nip: "199405202018012001",
    golongan: "III/a",
    jabatan: "Analis Laporan Keuangan"
  },
  {
    id: "peg-6",
    nama: "Yusuf Wijaya",
    nip: "199607182019031001",
    golongan: "II/c",
    jabatan: "Pengawal Rumah Detensi Imigrasi"
  }
];

const defaultSppdLuarKota = [
  {
    id: "lk-1",
    noSprint: "W19.IMI.IMI.3-KP.04.02-1024",
    noKuitansi: "KU-098/RUDNIM/V/2026",
    pegawaiId: "peg-3",
    namaPegawai: "Agus Pratama, A.Md.Im.",
    nip: "198904122011011003",
    golongan: "III/c",
    jabatan: "Kepala Seksi Registrasi, Administrasi dan Pelaporan",
    tglMulai: "2026-05-10",
    tglSelesai: "2026-05-13",
    jangkaWaktu: 4,
    maksudPerjalanan: "Pengawalan Deportasi Deteni WN China ke Bandara Internasional Soekarno-Hatta, Tangerang",
    tempatKeberangkatan: "Pontianak",
    tempatTujuan: "Tangerang/Jakarta",
    uangHarian: 1720000, // 4 hari x 430rb
    uangPenginapan: 2100000, // 3 malam x 700rb
    uangTransport: 850000,
    taksi: 350000,
    uangRepresentasi: 0,
    maskapaiBerangkat: "Lion Air",
    noTiketBerangkat: "JT-711",
    hargaTiketBerangkat: 1450000,
    maskapaiKembali: "Citilink",
    noTiketKembali: "QG-420",
    hargaTiketKembali: 1250000,
    grandTotal: 7720000
  },
  {
    id: "lk-2",
    noSprint: "W19.IMI.IMI.3-KP.04.02-1088",
    noKuitansi: "KU-112/RUDNIM/V/2026",
    pegawaiId: "peg-1",
    namaPegawai: "Herry Bejo, S.H., M.H.",
    nip: "197508212000031002",
    golongan: "IV/b",
    jabatan: "Kepala Rumah Detensi Imigrasi",
    tglMulai: "2026-05-18",
    tglSelesai: "2026-05-20",
    jangkaWaktu: 3,
    maksudPerjalanan: "Koordinasi Penanganan Pengungsi dan Pengawasan Orang Asing dengan Direktorat Jenderal Imigrasi",
    tempatKeberangkatan: "Pontianak",
    tempatTujuan: "Jakarta",
    uangHarian: 1590000, // 3 hari x 530rb (Gol IV)
    uangPenginapan: 3000000, // 2 malam x 1.5jt
    uangTransport: 1100000,
    taksi: 400000,
    uangRepresentasi: 450000, // 3 hari x 150rb (Kepala Rudenim)
    maskapaiBerangkat: "Garuda Indonesia",
    noTiketBerangkat: "GA-501",
    hargaTiketBerangkat: 2100000,
    maskapaiKembali: "Garuda Indonesia",
    noTiketKembali: "GA-504",
    hargaTiketKembali: 1950000,
    grandTotal: 10590000
  }
];

const defaultSppdDalamKota = [
  {
    id: "dk-1",
    noSprint: "W19.IMI.IMI.3-KP.04.02-1045",
    noKuitansi: "KU-105/RUDNIM/V/2026",
    pegawaiId: "peg-6",
    namaPegawai: "Yusuf Wijaya",
    nip: "199607182019031001",
    golongan: "II/c",
    jabatan: "Pengawal Rumah Detensi Imigrasi",
    tglMulai: "2026-05-11",
    tglSelesai: "2026-05-11",
    jangkaWaktu: 1,
    maksudPerjalanan: "Koordinasi dan Penyerahan Dokumen Keimigrasian ke Kantor Wilayah Kemenkumham Kalbar",
    tempatTujuan: "Kanwil Kemenkumham Kalbar, Pontianak",
    transportLokal: 150000,
    uangHarian: 150000,
    grandTotal: 300000
  },
  {
    id: "dk-2",
    noSprint: "W19.IMI.IMI.3-KP.04.02-1065",
    noKuitansi: "KU-109/RUDNIM/V/2026",
    pegawaiId: "peg-5",
    namaPegawai: "Diana Lestari, S.Ak.",
    nip: "199405202018012001",
    golongan: "III/a",
    jabatan: "Analis Laporan Keuangan",
    tglMulai: "2026-05-15",
    tglSelesai: "2026-05-16",
    jangkaWaktu: 2,
    maksudPerjalanan: "Uji Petik Laporan Keuangan dan Inventarisasi Aset BMN ke Kanim Kelas II TPI Entikong",
    tempatTujuan: "Kanim Entikong, Sanggau",
    transportLokal: 450000,
    uangHarian: 300000, // 2 hari x 150rb
    grandTotal: 750000
  }
];

const defaultSppdPaketMeeting = [
  {
    id: "pm-1",
    noSprint: "W19.IMI.IMI.3-KP.04.02-1033",
    pegawaiId: "peg-4",
    namaPegawai: "Siti Rahmawati, S.E.",
    nip: "199112022014032002",
    golongan: "III/b",
    jabatan: "Bendahara Pengeluaran",
    namaKegiatan: "Rapat Koordinasi Penyusunan Pagu Indikatif TA 2027",
    lokasiKegiatan: "Hotel Mercure Pontianak",
    tglMulai: "2026-05-04",
    tglSelesai: "2026-05-05",
    jangkaWaktu: 2,
    uangHarian: 300000, // 2 hari x 150rb (uang saku rapat)
    transport: 200000,
    detailPendukung: "Undangan Dinas Surat Nomor W19-UM.01.01-0941",
    grandTotal: 500000
  }
];

const defaultKontrakPaketMeeting = [
  {
    id: "km-1",
    noSpm: "SPM-0089/RUDNIM/V/2026",
    namaRekanan: "PT. Borneo Vista Hotelindo",
    hotel: "Hotel Aston Pontianak",
    namaKegiatan: "Fokus Group Discussion (FGD) Peningkatan Pengamanan Blok Hunian Deteni Rudenim Pontianak",
    tglMulai: "2026-05-12",
    tglSelesai: "2026-05-13",
    jangkaWaktu: 2,
    jumlahPeserta: 30,
    jumlahKamar: 15,
    hargaPaket: 28000000,
    biayaPenginapan: 15000000,
    biayaRuangMeeting: 13000000,
    grandTotal: 28000000
  }
];

const defaultSppdLuarNegeri = [
  {
    id: "ln-1",
    noSprint: "W19.IMI.IMI.3-KP.04.02-1099",
    pegawaiId: "peg-2",
    namaPegawai: "Budi Santoso, S.Sos.",
    nip: "198210152006041001",
    golongan: "III/d" as const,
    jabatan: "Kepala Sub Bagian Tata Usaha (PPK)",
    maksudPerjalanan: "Koordinasi Pemulangan/Deportasi Deteni WN Malaysia dan Penyelarasan Dokumen Konsuler Keimigrasian",
    negaraTujuan: "Malaysia",
    kotaTujuan: "Kuala Lumpur",
    tglMulai: "2026-05-22",
    tglSelesai: "2026-05-25",
    jangkaWaktu: 4,
    nilaiSPM: 35000000,
    maskapaiBerangkat: "AirAsia",
    noTiketBerangkat: "AK-1028",
    hargaTiketBerangkat: 2200000,
    maskapaiKembali: "Malaysia Airlines",
    noTiketKembali: "MH-815",
    hargaTiketKembali: 3100000,
    jumlahTiket: 5300000,
    asuransi: 450000,
    transportLokal: 900000,
    uangHarianPerjalanan: 2400000, // 2 hari x 1.2jt (perjalanan)
    uangHarian100: 9200000, // 2 hari x 4.6jt (full dinas Gol B/C USD eq)
    representasi: 1200000,
    penginapan: 8500000,
    taksi: 500000,
    visa: 0,
    biayaLainnya: 800000,
    realisasiTotal: 29250000,
    // selisih = nilaiSPM - (jumlahTiket + asuransi + transportLokal + uangHarianPerjalanan + uangHarian100 + representasi)
    // 35,000,000 - (5,300,000 + 450,000 + 900,000 + 2,400,000 + 9,200,000 + 1,200,000)
    // = 35,000,000 - 19,450,000 = 15,550,000
    selisih: 15550000
  }
];

const emptyDatabase = {
  pegawai: defaultPegawai,
  sppd_luar_kota: defaultSppdLuarKota,
  sppd_dalam_kota: defaultSppdDalamKota,
  sppd_paket_meeting: defaultSppdPaketMeeting,
  kontrak_paket_meeting: defaultKontrakPaketMeeting,
  sppd_luar_negeri: defaultSppdLuarNegeri
};

// Ensure database file exists
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(emptyDatabase, null, 2), "utf-8");
      return emptyDatabase;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db client", error);
    return emptyDatabase;
  }
}

function writeDB(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing db client", error);
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API REST routes
  
  // Get all DB
  app.get("/api/db", (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // Reset/Initialize DB
  app.post("/api/db/reset", (req, res) => {
    writeDB(emptyDatabase);
    res.json({ message: "Database reset to defaults", db: emptyDatabase });
  });

  // CRUD PEGAWAI
  app.get("/api/pegawai", (req, res) => {
    const db = readDB();
    res.json(db.pegawai || []);
  });

  app.post("/api/pegawai", (req, res) => {
    const db = readDB();
    const item = req.body;
    if (!item.nama || !item.nip) {
      return res.status(400).json({ error: "Nama dan NIP wajib diisi" });
    }

    if (!db.pegawai) db.pegawai = [];

    if (item.id) {
      // Edit
      const index = db.pegawai.findIndex((p: any) => p.id === item.id);
      if (index !== -1) {
        db.pegawai[index] = { ...db.pegawai[index], ...item };
      } else {
        db.pegawai.push(item);
      }
    } else {
      // Create
      const newItem = { ...item, id: "peg-" + Date.now() };
      db.pegawai.push(newItem);
    }

    writeDB(db);
    res.json({ success: true, db });
  });

  app.delete("/api/pegawai/:id", (req, res) => {
    const db = readDB();
    const { id } = req.params;
    db.pegawai = (db.pegawai || []).filter((p: any) => p.id !== id);
    writeDB(db);
    res.json({ success: true, db });
  });

  // CRUD SPPD
  app.post("/api/sppd/:type", (req, res) => {
    const { type } = req.params;
    const db = readDB();
    const item = req.body;
    const key = `sppd_${type.toLowerCase()}`;

    if (!db[key]) {
      db[key] = [];
    }

    // Auto-calculate properties
    const tglMulai = new Date(item.tglMulai || "");
    const tglSelesai = new Date(item.tglSelesai || "");
    let jangkaWaktu = 0;
    if (!isNaN(tglMulai.getTime()) && !isNaN(tglSelesai.getTime())) {
      jangkaWaktu = Math.max(1, Math.round((tglSelesai.getTime() - tglMulai.getTime()) / 86400000) + 1);
    }
    item.jangkaWaktu = jangkaWaktu;

    // Apply calculations based on SPPD Types
    if (type === "LUAR_KOTA") {
      item.uangHarian = Number(item.uangHarian || 0);
      item.uangPenginapan = Number(item.uangPenginapan || 0);
      item.uangTransport = Number(item.uangTransport || 0);
      item.taksi = Number(item.taksi || 0);
      item.uangRepresentasi = Number(item.uangRepresentasi || 0);
      item.hargaTiketBerangkat = Number(item.hargaTiketBerangkat || 0);
      item.hargaTiketKembali = Number(item.hargaTiketKembali || 0);
      
      // Auto Grand Total
      item.grandTotal = item.uangHarian + item.uangPenginapan + item.uangTransport + 
                        item.taksi + item.uangRepresentasi + 
                        item.hargaTiketBerangkat + item.hargaTiketKembali;

    } else if (type === "DALAM_KOTA") {
      item.transportLokal = Number(item.transportLokal || 0);
      item.uangHarian = Number(item.uangHarian || 0);
      item.grandTotal = item.transportLokal + item.uangHarian;

    } else if (type === "PAKET_MEETING") {
      item.uangHarian = Number(item.uangHarian || 0);
      item.transport = Number(item.transport || 0);
      item.grandTotal = item.uangHarian + item.transport;

    } else if (type === "KONTRAK_PAKET_MEETING") {
      item.jumlahPeserta = Number(item.jumlahPeserta || 0);
      item.jumlahKamar = Number(item.jumlahKamar || 0);
      item.hargaPaket = Number(item.hargaPaket || 0);
      item.biayaPenginapan = Number(item.biayaPenginapan || 0);
      item.biayaRuangMeeting = Number(item.biayaRuangMeeting || 0);
      item.grandTotal = item.hargaPaket;

    } else if (type === "LUAR_NEGERI") {
      item.nilaiSPM = Number(item.nilaiSPM || 0);
      item.hargaTiketBerangkat = Number(item.hargaTiketBerangkat || 0);
      item.hargaTiketKembali = Number(item.hargaTiketKembali || 0);
      
      item.jumlahTiket = item.hargaTiketBerangkat + item.hargaTiketKembali;
      item.asuransi = Number(item.asuransi || 0);
      item.transportLokal = Number(item.transportLokal || 0);
      item.uangHarianPerjalanan = Number(item.uangHarianPerjalanan || 0);
      item.uangHarian100 = Number(item.uangHarian100 || 0);
      item.representasi = Number(item.representasi || 0);
      item.penginapan = Number(item.penginapan || 0);
      item.taksi = Number(item.taksi || 0);
      item.visa = Number(item.visa || 0);
      item.biayaLainnya = Number(item.biayaLainnya || 0);

      // Realisasi total: all incurred expenses
      item.realisasiTotal = item.jumlahTiket + item.asuransi + item.transportLokal + 
                            item.uangHarianPerjalanan + item.uangHarian100 + item.representasi + 
                            item.penginapan + item.taksi + item.visa + item.biayaLainnya;
      
      // Auto calculation: selisih = nilaiSPM - (jumlahTiket + asuransi + transportLokal + uangHarianPerjalanan + uangHarian100 + representasi)
      item.selisih = item.nilaiSPM - (item.jumlahTiket + item.asuransi + item.transportLokal + 
                                       item.uangHarianPerjalanan + item.uangHarian100 + item.representasi);
    }

    if (item.id) {
      // Update
      const index = db[key].findIndex((x: any) => x.id === item.id);
      if (index !== -1) {
        db[key][index] = { ...db[key][index], ...item };
      } else {
        db[key].push(item);
      }
    } else {
      // Create
      item.id = `${type.toLowerCase().substring(0, 2)}-${Date.now()}`;
      db[key].push(item);
    }

    writeDB(db);
    res.json({ success: true, db });
  });

  app.delete("/api/sppd/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const db = readDB();
    const key = `sppd_${type.toLowerCase()}`;

    if (db[key]) {
      db[key] = db[key].filter((x: any) => x.id !== id);
      writeDB(db);
    }

    res.json({ success: true, db });
  });

  // Serve static UI assets inside Vite app / Dist app
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router HTML5 History API fallback by sending index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
