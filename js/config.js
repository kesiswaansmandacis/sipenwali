/**
 * config.js
 * Parameter Konfigurasi & Mock Master Data Multi-Role
 */

const CONFIG = {
  APP_NAME: 'AI Guru Wali',
  VERSION: '1.0.0',
  PERMENDIKDASMEN_REF: 'Permendikdasmen No. 11 Tahun 2025',
  
  // URL Web App Google Apps Script Anda
  API_BASE_URL: 'https://script.google.com/macros/s/AKfycbyxxTkUkWxODbXLIYJUN4coNFMEwc0406lu07jCOOyBcwlzKXjVQPmQFvAoQ1xPMJ8Ubg/exec',
  STORAGE_KEY_USER: 'ai_guru_wali_user',
  
  SEKOLAH_INFO: {
    nama_sekolah: 'SMA NEGERI 1 MERDEKA',
    alamat_sekolah: 'Jl. Pendidikan No. 100, Kota Edukasi',
    kepala_sekolah: 'Dr. H. Mulyadi, M.Pd.',
    nip_kepala_sekolah: '197001011995031001'
  },

  // Mock Master Guru & Kelas (Dapat Sync ke Sheet 'Guru')
  MOCK_GURU: [
    { id_guru: 'GRU-001', nip: '198503152010011002', nama_guru: 'Ahmad Fauzi, S.Pd.', kelas_binaan: 'Kelas X-A', role: 'Guru Wali' },
    { id_guru: 'GRU-002', nip: '199001012015022003', nama_guru: 'Siti Nurhaliza, M.Pd.', kelas_binaan: 'Kelas X-B', role: 'Guru Wali' },
    { id_guru: 'ADMIN-01', nip: '197001011995031001', nama_guru: 'Dr. H. Mulyadi, M.Pd.', kelas_binaan: 'Semua Kelas', role: 'Kepala Sekolah / Admin' }
  ],

  SUGGESTED_PROMPTS: [
    { label: '📈 Bagaimana perkembangan Budi?', prompt: 'Bagaimana perkembangan Budi Santoso?' },
    { label: '⚠️ Siapa yang perlu perhatian minggu ini?', prompt: 'Siapa saja murid yang perlu perhatian minggu ini?' },
    { label: '📄 Buat laporan semester', prompt: 'Buatkan draf narasi laporan perkembangan semester murid binaan.' },
    { label: '✉️ Buat surat orang tua', prompt: 'Buatkan draf surat/pesan santun untuk orang tua Budi Santoso.' }
  ],

  DASHBOARD_DATA: {
    total_murid: 32,
    murid_perlu_perhatian: 4,
    pendampingan_minggu_ini: 9,
    target_tercapai_percent: 88,
    grafik_tren: {
      bulan: ['Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober'],
      sesi_pendampingan: [12, 19, 15, 22, 28, 32],
      skor_karakter_avg: [3.8, 4.0, 4.2, 4.3, 4.6, 4.8]
    },
    grafik_target: {
      labels: ['Target Tercapai', 'Sedang Process', 'Perlu Perhatian'],
      data: [28, 8, 4]
    }
  },

  MOCK_MURID: [
    { id_murid: 'MRD-1001', nis: '0051234567', nama_murid: 'Budi Santoso', kelas: 'Kelas X-A', foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', alamat: 'Jl. Merdeka No. 45', nomor_hp: '081234567890', nama_ortu: 'Slamet Santoso', minat: 'Pemrograman', bakat: 'Matematika', cita_cita: 'Software Engineer', status: 'Aktif' },
    { id_murid: 'MRD-1002', nis: '0051234568', nama_murid: 'Siti Aminah', kelas: 'Kelas X-A', foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', alamat: 'Jl. Melati No. 12', nomor_hp: '081987654321', nama_ortu: 'Rahmat Hidayat', minat: 'Biologi', bakat: 'Sains', cita_cita: 'Dokter', status: 'Aktif' }
  ],

  MOCK_PENDAMPINGAN: [
    { id_pendampingan: 'PDP-1001', tanggal: '2026-07-28', nama_guru: 'Ahmad Fauzi, S.Pd.', id_murid: 'MRD-1001', nama_murid: 'Budi Santoso', masalah: 'Penurunan konsentrasi belajar.', analisis: 'Kurang istirahat malam.', target: 'Selesai latihan mandiri.', rtl: 'Tutor sebaya.', evaluasi: 'Murid sangat kooperatif.', upload_foto: '', status: 'Selesai' }
  ]
};
