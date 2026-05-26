import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, X, Check, Users } from "lucide-react";
import { Pegawai } from "../types";

interface PegawaiMasterProps {
  pegawai: Pegawai[];
  onSave: (item: Partial<Pegawai>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

export default function PegawaiMaster({ pegawai = [], onSave, onDelete, isLoading }: PegawaiMasterProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formNip, setFormNip] = useState("");
  const [formGolongan, setFormGolongan] = useState("");
  const [formJabatan, setFormJabatan] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormNip("");
    setFormGolongan("");
    setFormJabatan("");
    setErrorMsg("");
  };

  const handleEdit = (p: Pegawai) => {
    setEditingId(p.id);
    setFormName(p.nama);
    setFormNip(p.nip);
    setFormGolongan(p.golongan);
    setFormJabatan(p.jabatan);
    setShowForm(true);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formName.trim() || !formNip.trim()) {
      setErrorMsg("Nama dan NIP wajib diisi!");
      return;
    }

    const payload: Partial<Pegawai> = {
      nama: formName.trim(),
      nip: formNip.trim(),
      golongan: formGolongan.trim() || "III/a",
      jabatan: formJabatan.trim() || "Pelaksana"
    };

    if (editingId) {
      payload.id = editingId;
    }

    const success = await onSave(payload);
    if (success) {
      resetForm();
      setShowForm(false);
    } else {
      setErrorMsg("Gagal menyimpan data pegawai. Silakan coba lagi.");
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pegawai "${nama}"?`)) {
      await onDelete(id);
    }
  };

  // Filtered pegawai
  const filtered = pegawai.filter(p => 
    p.nama.toLowerCase().includes(search.toLowerCase()) || 
    p.nip.includes(search) || 
    p.jabatan.toLowerCase().includes(search.toLowerCase()) ||
    p.golongan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Master Pegawai Rudenim Pontianak
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola daftar pegawai aktif untuk pengisian form SPPD secara otomatis (Auto-Fill)
          </p>
        </div>

        <button
          id="btn-add-pegawai"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-navy hover:bg-navy-mid text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all active:scale-97 shadow-sm shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "Tutup Form" : "Tambah Pegawai Baru"}</span>
        </button>
      </div>

      {/* Slide-in or Toggle Form Block */}
      {showForm && (
        <div id="form-block-pegawai" className="bg-white p-6 rounded-xl border border-indigo-100 shadow-md max-w-2xl transform transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-4 border-b border-slate-100 pb-2">
            {editingId ? "✏️ Edit Informasi Pegawai" : "➕ Input Data Pegawai Baru"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-semibold border border-red-150">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP & GELAR</label>
                <input
                  id="input-pegawai-nama"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Sos."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">NIP (NOMOR INDUK PEGAWAI)</label>
                <input
                  id="input-pegawai-nip"
                  type="text"
                  required
                  placeholder="Contoh: 198210152006041001"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">GOLONGAN / RUANG</label>
                <select
                  id="select-pegawai-golongan"
                  required
                  value={formGolongan}
                  onChange={(e) => setFormGolongan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-medium"
                >
                  <option value="">-- Pilih Golongan --</option>
                  <option value="IV/e">Pembina Utama (IV/e)</option>
                  <option value="IV/d">Pembina Utama Madya (IV/d)</option>
                  <option value="IV/c">Pembina Utama Muda (IV/c)</option>
                  <option value="IV/b">Pembina Tingkat I (IV/b)</option>
                  <option value="IV/a">Pembina (IV/a)</option>
                  <option value="III/d">Penata Tingkat I (III/d)</option>
                  <option value="III/c">Penata (III/c)</option>
                  <option value="III/b">Penata Muda Tingkat I (III/b)</option>
                  <option value="III/a">Penata Muda (III/a)</option>
                  <option value="II/d">Pengatur Tingkat I (II/d)</option>
                  <option value="II/c">Pengatur (II/c)</option>
                  <option value="II/b">Pengatur Muda Tingkat I (II/b)</option>
                  <option value="II/a">Pengatur Muda (II/a)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">JABATAN DINAS</label>
                <input
                  id="input-pegawai-jabatan"
                  type="text"
                  required
                  placeholder="Contoh: Bendahara Pengeluaran"
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:bg-white focus:border-navy focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-navy hover:bg-navy-mid text-white rounded text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Personel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Table Grid Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-pegawai-input"
              type="text"
              placeholder="Cari nama, NIP, atau jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 text-xs rounded focus:outline-hidden focus:border-navy font-medium"
            />
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Ditemukan {filtered.length} Pegawai
          </span>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIP (Identitas)</th>
                <th className="py-3 px-4">Golongan / Ruang</th>
                <th className="py-3 px-4">Jabatan Struktural</th>
                <th className="py-3 px-4 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all font-medium">
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{item.nama}</td>
                    <td className="py-3 px-4 font-mono select-all text-slate-600">{item.nip}</td>
                    <td className="py-3 px-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100">
                        {item.golongan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.jabatan}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-all cursor-pointer"
                          title="Ubah data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          className="p-1 px-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-600 transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 space-y-2">
                    <p className="font-semibold">Nama atau data pegawai tidak ditemukan</p>
                    <p className="text-[11px] text-slate-400">Silakan tambahkan data melalui form input di atas.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
