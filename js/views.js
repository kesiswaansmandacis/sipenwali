const Views = {
  // 1. FORM LOGIN DENGAN NIP/NISN KOSONG & PILIHAN ROLE
  login: () => `
    <div class="row justify-content-center align-items-center" style="min-height: 85vh;">
      <div class="col-md-6 col-lg-5">
        <div class="card card-custom p-4 shadow-lg border-0">
          <div class="text-center mb-4">
            <div class="icon-box icon-blue mx-auto mb-3" style="width: 65px; height: 60px;"><i class="bi bi-mortarboard-fill fs-2"></i></div>
            <h4 class="fw-bold mb-1 text-primary">AI Guru Wali</h4>
            <p class="text-muted small">Portal Pendampingan Holistik Terintegrasi AI<br><span class="badge bg-light text-dark border">Permendikdasmen No. 11 Th 2025</span></p>
          </div>

          <form id="form-login" onsubmit="App.handleLogin(event)">
            <div class="mb-3">
              <label class="form-label fw-bold">Login Sebagai (Hak Akses)</label>
              <select id="login-role" class="form-select border-primary" onchange="App.toggleLoginFields()" required>
                <option value="Guru Wali">Guru Wali</option>
                <option value="Kepala Sekolah / Admin">Kepala Sekolah / Admin</option>
                <option value="Murid / Orang Tua">Murid / Orang Tua</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold" id="label-username">NIP / ID Guru</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                <input type="text" class="form-control" id="login-nip" placeholder="Masukkan NIP / NISN Anda..." required>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold">Kata Sandi</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-lock"></i></span>
                <input type="password" class="form-control" id="login-password" placeholder="Masukkan kata sandi..." required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">
              <i class="bi bi-box-arrow-in-right me-2"></i> Masuk Ke Aplikasi
            </button>
          </form>

          <div class="text-center mt-3 border-top pt-2">
            <small class="text-muted">Bantu Layanan? Kontak Admin Sekolah</small>
          </div>
        </div>
      </div>
    </div>
  `,

  // 2. DASHBOARD DINAMIS SESUAI USER LOGIN
  dashboard: () => {
    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_USER) || '{}');
    const data = CONFIG.DASHBOARD_DATA;

    return `
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1">Selamat Datang, ${user.nama_guru || 'Pengguna'}!</h3>
          <p class="text-muted mb-0">Role: <span class="badge bg-primary">${user.role || 'Guru Wali'}</span> | Penugasan: <span class="fw-semibold text-dark">${user.kelas_binaan || 'Kelas X-A'}</span></p>
        </div>
        <div class="d-flex gap-2">
          ${user.role === 'Kepala Sekolah / Admin' ? `
            <button class="btn btn-success" onclick="App.navigateTo('kelola-guru')"><i class="bi bi-person-gear me-1"></i> Kelola Master Guru & Kelas</button>
          ` : ''}
          <button class="btn btn-primary" onclick="App.navigateTo('ai-assistant')"><i class="bi bi-robot me-1"></i> AI Assistant</button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3"><div class="card card-custom p-3 stat-card"><div class="d-flex align-items-center justify-content-between"><div><p class="text-muted small mb-1 fw-medium">Murid Binaan</p><h3 class="fw-bold mb-0 text-dark">${data.total_murid} <span class="fs-6 text-muted">Siswa</span></h3></div><div class="icon-box icon-blue"><i class="bi bi-people-fill"></i></div></div></div></div>
        <div class="col-12 col-sm-6 col-xl-3"><div class="card card-custom p-3 stat-card warning"><div class="d-flex align-items-center justify-content-between"><div><p class="text-muted small mb-1 fw-medium">Perlu Perhatian</p><h3 class="fw-bold mb-0 text-danger">${data.murid_perlu_perhatian} <span class="fs-6 text-muted">Siswa</span></h3></div><div class="icon-box icon-orange"><i class="bi bi-exclamation-triangle-fill"></i></div></div></div></div>
        <div class="col-12 col-sm-6 col-xl-3"><div class="card card-custom p-3 stat-card green"><div class="d-flex align-items-center justify-content-between"><div><p class="text-muted small mb-1 fw-medium">Pendampingan M-Ini</p><h3 class="fw-bold mb-0 text-success">${data.pendampingan_minggu_ini} <span class="fs-6 text-muted">Sesi</span></h3></div><div class="icon-box icon-green"><i class="bi bi-calendar2-check-fill"></i></div></div></div></div>
        <div class="col-12 col-sm-6 col-xl-3"><div class="card card-custom p-3 stat-card teal"><div class="d-flex align-items-center justify-content-between"><div><p class="text-muted small mb-1 fw-medium">Target Tercapai</p><h3 class="fw-bold mb-0 text-teal">${data.target_tercapai_percent}%</h3></div><div class="icon-box icon-teal"><i class="bi bi-trophy-fill"></i></div></div></div></div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-lg-8"><div class="card card-custom p-4 h-100"><h5 class="fw-bold mb-3">Grafik Perkembangan Murid (${user.kelas_binaan || 'Kelas X-A'})</h5><div class="chart-container"><canvas id="chartTrenPerkembangan"></canvas></div></div></div>
        <div class="col-lg-4"><div class="card card-custom p-4 h-100"><h5 class="fw-bold mb-3">Status Target Murid</h5><div class="chart-container d-flex align-items-center justify-content-center"><canvas id="chartStatusTarget"></canvas></div></div></div>
      </div>
    `;
  },

  // 3. PANEL ADMIN KELOLA MASTER GURU & KELAS BINAAN
  kelolaGuru: (listGuru = []) => `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-1"><i class="bi bi-person-gear text-primary me-2"></i>Kelola Master Guru Wali & Kelas</h3>
        <p class="text-muted mb-0">Tambah Guru Wali baru dan atur penugasan Kelas Binaan (Admin Panel).</p>
      </div>
      <button class="btn btn-primary px-3 py-2 fw-semibold" onclick="App.openModalAddGuru()">
        <i class="bi bi-person-plus-fill me-2"></i> Tambah Guru Wali Baru
      </button>
    </div>

    <div class="card card-custom p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>NIP / ID Guru</th>
              <th>Nama Guru Lengkap</th>
              <th>Role Hak Akses</th>
              <th>Penugasan Kelas Binaan</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${listGuru.map(g => `
              <tr>
                <td class="fw-bold text-secondary">${g.nip}</td>
                <td class="fw-bold text-dark">${g.nama_guru}</td>
                <td><span class="badge ${g.role.includes('Admin') ? 'bg-danger' : 'bg-primary'}">${g.role}</span></td>
                <td><span class="badge bg-success-subtle text-success border border-success">${g.kelas_binaan}</span></td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-danger" onclick="alert('Guru berhasil dihapus')"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `,

  murid: (listMurid = []) => `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-1"><i class="bi bi-people-fill text-primary me-2"></i>Kelola Data Murid Binaan</h3>
        <p class="text-muted mb-0">Data NIS, Profil, Orang Tua, Minat, Bakat, dan Cita-cita.</p>
      </div>
      <button class="btn btn-primary px-3 py-2 fw-semibold" onclick="App.openModalAddMurid()"><i class="bi bi-person-plus-fill me-2"></i> Tambah Murid Baru</button>
    </div>

    <div class="card card-custom p-3 mb-4">
      <div class="row g-2">
        <div class="col-md-8">
          <input type="text" id="search-murid" class="form-control" placeholder="Cari nama murid..." onkeyup="App.filterMuridTable()">
        </div>
        <div class="col-md-4">
          <select id="filter-status-murid" class="form-select" onchange="App.filterMuridTable()">
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Perlu Perhatian">Perlu Perhatian</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card card-custom p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light"><tr><th>Murid</th><th>NIS</th><th>Kelas</th><th>Orang Tua / Kontak</th><th>Minat & Bakat</th><th>Cita-cita</th><th>Status</th><th class="text-center">Aksi</th></tr></thead>
          <tbody>
            ${listMurid.map(m => `
              <tr>
                <td><div class="d-flex align-items-center gap-3"><img src="${m.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" class="rounded-circle border" style="width: 44px; height: 44px; object-fit: cover;"><div><div class="fw-bold text-dark">${m.nama_murid}</div><small class="text-muted">${m.alamat || '-'}</small></div></div></td>
                <td class="fw-semibold text-secondary">${m.nis}</td>
                <td><span class="badge bg-secondary">${m.kelas || 'Kelas X-A'}</span></td>
                <td><div class="fw-medium text-dark">${m.nama_ortu || '-'}</div><small class="text-success">${m.nomor_hp || '-'}</small></td>
                <td><span class="badge bg-primary-subtle text-primary mb-1">${m.minat || '-'}</span><br><small class="text-muted">Bakat: ${m.bakat || '-'}</small></td>
                <td><span class="fw-semibold text-dark">${m.cita_cita || '-'}</span></td>
                <td><span class="badge ${m.status === 'Aktif' ? 'bg-success' : 'bg-danger'}">${m.status}</span></td>
                <td class="text-center"><div class="btn-group btn-group-sm"><button class="btn btn-outline-primary" onclick="App.openModalEditMurid('${m.id_murid}')"><i class="bi bi-pencil-square"></i></button><button class="btn btn-outline-danger" onclick="App.deleteMurid('${m.id_murid}')"><i class="bi bi-trash"></i></button></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `,

  pendampingan: (listPDP = []) => `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div><h3 class="fw-bold mb-1"><i class="bi bi-journal-bookmark-fill text-primary me-2"></i>Pendampingan & Konseling</h3><p class="text-muted mb-0">Dokumentasi masalah, analisis kendala, target, RTL, evaluasi & foto.</p></div>
      <button class="btn btn-primary fw-semibold" onclick="App.openModalAddPendampingan()"><i class="bi bi-plus-circle-fill me-2"></i> Sesi Pendampingan Baru</button>
    </div>
    <div class="card card-custom p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light"><tr><th>Tanggal</th><th>Murid & Guru</th><th>Masalah & Analisis</th><th>Target & RTL</th><th>Status</th><th class="text-center">Aksi</th></tr></thead>
          <tbody>
            ${listPDP.map(p => `
              <tr>
                <td class="fw-bold text-secondary">${p.tanggal}</td>
                <td><div class="fw-bold text-dark">${p.nama_murid}</div><small class="text-muted">${p.nama_guru || 'Guru Wali'}</small></td>
                <td><div class="fw-semibold text-danger small">${p.masalah}</div><small class="text-muted">Akar: ${p.analisis || '-'}</small></td>
                <td><small class="fw-semibold text-primary d-block">Target: ${p.target || '-'}</small><small class="text-dark">RTL: ${p.rtl || '-'}</small></td>
                <td><span class="badge ${p.status === 'Selesai' ? 'bg-success' : 'bg-warning text-dark'}">${p.status}</span></td>
                <td class="text-center"><button class="btn btn-sm btn-outline-danger" onclick="App.deletePendampingan('${p.id_pendampingan}')"><i class="bi bi-trash"></i></button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `,

  karakter: () => `
    <div class="d-flex justify-content-between align-items-center mb-4"><div><h3 class="fw-bold mb-1"><i class="bi bi-award-fill text-primary me-2"></i>Pengembangan Karakter Murid</h3><p class="text-muted mb-0">Penilaian 5 Dimensi Karakter (Kedisiplinan, Kejujuran, Tanggung Jawab, Mandiri, Empati).</p></div></div>
    <div class="card card-custom p-4">
      <table class="table table-hover align-middle text-center">
        <thead class="table-light"><tr><th class="text-start">Murid</th><th>Kedisiplinan</th><th>Kejujuran</th><th>Tanggung Jawab</th><th>Kemandirian</th><th>Empati</th></tr></thead>
        <tbody>
          <tr><td class="text-start fw-bold">Budi Santoso</td><td><span class="badge bg-success">5 / 5</span></td><td><span class="badge bg-success">5 / 5</span></td><td><span class="badge bg-primary">4 / 5</span></td><td><span class="badge bg-primary">4 / 5</span></td><td><span class="badge bg-success">5 / 5</span></td></tr>
          <tr><td class="text-start fw-bold">Siti Aminah</td><td><span class="badge bg-success">5 / 5</span></td><td><span class="badge bg-success">5 / 5</span></td><td><span class="badge bg-success">5 / 5</span></td><td><span class="badge bg-success">5 / 5</span></td><td><span class="badge bg-success">5 / 5</span></td></tr>
        </tbody>
      </table>
    </div>
  `,

  komunikasi: () => `
    <div class="d-flex justify-content-between align-items-center mb-4"><div><h3 class="fw-bold mb-1"><i class="bi bi-chat-dots-fill text-primary me-2"></i>Komunikasi Orang Tua / Wali</h3></div></div>
    <div class="card card-custom p-4">
      <table class="table table-hover align-middle">
        <thead class="table-light"><tr><th>Tanggal</th><th>Murid</th><th>Media</th><th>Topik</th><th>Respon Ortu</th></tr></thead>
        <tbody>
          <tr><td>25/07/2026</td><td class="fw-bold">Budi Santoso</td><td><span class="badge bg-success"><i class="bi bi-whatsapp"></i> WhatsApp</span></td><td>Apresiasi Nilai Matematika</td><td>Orang tua mendukung penuh.</td></tr>
        </tbody>
      </table>
    </div>
  `,

  laporan: () => `
    <div class="d-flex justify-content-between align-items-center mb-4 no-print">
      <div><h3 class="fw-bold mb-1 text-primary"><i class="bi bi-file-earmark-pdf-fill me-2"></i>Generator Laporan</h3></div>
      <div class="d-flex gap-2">
        <button class="btn btn-success fw-semibold" onclick="App.exportWordReport()"><i class="bi bi-file-earmark-word me-1"></i> Export Word</button>
        <button class="btn btn-danger fw-semibold" onclick="App.exportPDFReport()"><i class="bi bi-file-earmark-pdf me-1"></i> Export PDF</button>
        <button class="btn btn-primary fw-semibold" onclick="window.print()"><i class="bi bi-printer me-1"></i> Cetak</button>
      </div>
    </div>
    <div class="report-paper shadow-sm" id="report-paper-container">
      <div class="kop-surat text-center"><div class="kop-title">SMA NEGERI 1 MERDEKA</div><div class="kop-subtitle">LAPORAN PERKEMBANGAN INDIVIDU MURID</div></div>
      <p class="mt-4"><strong>Nama Murid:</strong> Budi Santoso (NIS: 0051234567)</p>
      <p><strong>Rangkuman Perkembangan:</strong> Murid menunjukkan kemajuan positif dalam aspek partisipasi akademik dan pembentukan karakter.</p>
    </div>
  `,

  aiChat: () => `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div><h3 class="fw-bold mb-1 text-primary"><i class="bi bi-chat-square-quote-fill me-2"></i>Asisten AI Guru Wali</h3></div>
    </div>
    <div class="card card-custom p-3 mb-4">
      <small class="fw-bold text-muted d-block mb-2">Contoh Pertanyaan Cepat:</small>
      <div class="d-flex flex-wrap gap-2">
        ${CONFIG.SUGGESTED_PROMPTS.map(p => `<button class="prompt-chip" onclick="App.sendSuggestedPrompt('${p.prompt}')">${p.label}</button>`).join('')}
      </div>
    </div>
    <div class="card card-custom p-3">
      <div class="chat-container mb-3" id="chat-box">
        <div class="chat-bubble ai"><strong class="d-block text-primary mb-1"><i class="bi bi-stars me-1"></i> AI Guru Wali</strong>Halo! Ada yang bisa saya bantu terkait data murid binaan?</div>
      </div>
      <form id="form-ai-chat" onsubmit="App.handleUserChatSubmit(event)">
        <div class="input-group">
          <input type="text" id="ai-chat-input" class="form-control py-2" placeholder="Ketik pertanyaan..." required>
          <button class="btn btn-primary px-4 fw-semibold" type="submit"><i class="bi bi-send-fill me-1"></i> Kirim</button>
        </div>
      </form>
    </div>
  `
};
