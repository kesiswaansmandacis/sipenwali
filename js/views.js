const Views = {
  // 1. FORM LOGIN KOSONG DENGAN AUTENTIKASI RIIL
  login: () => `
    <div class="row justify-content-center align-items-center" style="min-height: 85vh;">
      <div class="col-md-5 col-lg-4">
        <div class="card card-custom p-4 shadow-lg border-0">
          <div class="text-center mb-4">
            <div class="icon-box icon-blue mx-auto mb-3" style="width: 60px; height: 60px;"><i class="bi bi-mortarboard-fill fs-2"></i></div>
            <h4 class="fw-bold mb-1 text-primary">AI Guru Wali</h4>
            <p class="text-muted small">Portal Pendampingan Holistik Terintegrasi AI<br><span class="badge bg-light text-dark border">Permendikdasmen No. 11 Th 2025</span></p>
          </div>

          <form id="form-login" onsubmit="App.handleLogin(event)">
            <div class="mb-3">
              <label class="form-label fw-bold">Username (NIP / NISN)</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                <input type="text" class="form-control" id="login-username" placeholder="Ketik NIP atau NISN Anda..." required>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold">Kata Sandi</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-lock"></i></span>
                <input type="password" class="form-control" id="login-password" placeholder="Ketik kata sandi..." required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" id="btn-login-submit">
              <i class="bi bi-box-arrow-in-right me-2"></i> Masuk Ke Aplikasi
            </button>
          </form>

          <div class="text-center mt-3 border-top pt-2">
            <small class="text-muted">Gunakan NIP untuk Guru/Admin, NISN untuk Siswa.</small>
          </div>
        </div>
      </div>
    </div>
  `,

  // 2. DASHBOARD GURU WALI / ADMIN
  dashboardGuru: () => {
    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_USER) || '{}');
    const data = CONFIG.DASHBOARD_DATA;

    return `
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1">Selamat Datang, ${user.nama || 'Pengguna'}!</h3>
          <p class="text-muted mb-0">Role: <span class="badge bg-primary">${user.role || 'Guru Wali'}</span> | Penugasan: <span class="fw-semibold text-dark">${user.kelas_binaan || 'Kelas X-A'}</span></p>
        </div>
        <div class="d-flex gap-2">
          ${user.role.includes('Admin') || user.role.includes('Kepala') ? `
            <button class="btn btn-danger" onclick="App.openModalResetPassword()"><i class="bi bi-key me-1"></i> Reset Password Users</button>
            <button class="btn btn-success" onclick="App.navigateTo('kelola-guru')"><i class="bi bi-person-gear me-1"></i> Kelola Master Guru</button>
          ` : ''}
          <button class="btn btn-primary" onclick="App.navigateTo('ai-assistant')"><i class="bi bi-robot me-1"></i> AI Assistant</button>
        </div>
      </div>

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

  // 3. DASHBOARD KHUSUS SISWA (PEMETAAN MANDIRI)
  dashboardSiswa: () => {
    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_USER) || '{}');
    const p = user.profil_murid || {
      hobi: 'Membaca, Koding',
      cita_cita: 'Software Engineer',
      mapel_sulit: 'Fisika Dasar',
      minat: 'Teknologi Informasi',
      bakat: 'Logika Matematika'
    };

    return `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold text-dark mb-1"><i class="bi bi-mortarboard-fill text-primary me-2"></i>Portal Murid - ${user.nama}</h3>
          <p class="text-muted mb-0">NISN: <span class="fw-bold text-dark">${user.username}</span> | Kelas: <span class="badge bg-primary">${user.kelas_binaan || 'Kelas X-A'}</span></p>
        </div>
        <button class="btn btn-outline-primary" onclick="App.navigateTo('ai-chat')">
          <i class="bi bi-robot me-1"></i> Tanya AI Mentor Belajar
        </button>
      </div>

      <div class="row g-4 mb-4">
        <!-- Form Pemetaan Profil Mandiri Siswa -->
        <div class="col-lg-7">
          <div class="card card-custom p-4">
            <h5 class="fw-bold text-primary mb-3"><i class="bi bi-pencil-square me-2"></i>Pemetaan Potensi Mandiri Siswa</h5>
            <form id="form-siswa-preference" onsubmit="App.saveStudentPreferences(event)">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Hobi Kamu</label>
                  <input type="text" id="sis_hobi" class="form-control" value="${p.hobi || ''}" placeholder="Contoh: Catur, Sepak Bola" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Cita-Cita</label>
                  <input type="text" id="sis_cita_cita" class="form-control" value="${p.cita_cita || ''}" placeholder="Contoh: Dokter, Engineer" required>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold text-danger"><i class="bi bi-exclamation-octagon me-1"></i>Mata Pelajaran yang Dirasa Paling Sulit</label>
                  <input type="text" id="sis_mapel_sulit" class="form-control border-danger" value="${p.mapel_sulit || ''}" placeholder="Contoh: Matematika Lanjut, Fisika" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Minat</label>
                  <input type="text" id="sis_minat" class="form-control" value="${p.minat || ''}" placeholder="Contoh: Sains & Teknologi">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Bakat yang Ingin Dikembangkan</label>
                  <input type="text" id="sis_bakat" class="form-control" value="${p.bakat || ''}" placeholder="Contoh: Pemrograman, Seni">
                </div>
                <div class="col-12 text-end pt-2">
                  <button type="submit" class="btn btn-primary fw-semibold px-4"><i class="bi bi-save me-1"></i> Simpan Pemetaan Saya</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Ringkasan Profil Siswa & AI Tips -->
        <div class="col-lg-5">
          <div class="card card-custom p-4 h-100">
            <h5 class="fw-bold text-success mb-3"><i class="bi bi-stars me-2"></i>Rekomendasi AI Mentor Belajar</h5>
            <div class="p-3 bg-light rounded border mb-3">
              <small class="text-muted d-block mb-1">Pelajaran yang Menantang:</small>
              <span class="badge bg-danger fs-6 mb-2">${p.mapel_sulit || 'Fisika Dasar'}</span>
              <p class="small text-dark mb-0">AI merekomendasikan metode belajar visual dan tutor sebaya dengan rekan kelas untuk mengatasi kendala di mata pelajaran ini.</p>
            </div>
            <button class="btn btn-outline-success w-100" onclick="App.navigateTo('ai-chat')">Mulai Konsultasi Belajar AI</button>
          </div>
        </div>
      </div>
    `;
  },

  // 4. ADMIN PANEL KELOLA GURU WALI
  kelolaGuru: (listGuru = []) => `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-1"><i class="bi bi-person-gear text-primary me-2"></i>Kelola Master Guru Wali & Penugasan</h3>
        <p class="text-muted mb-0">Tambah Guru Wali baru, atur penugasan Kelas, dan Reset Password (Admin Panel).</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-danger fw-semibold" onclick="App.openModalResetPassword()">
          <i class="bi bi-key-fill me-1"></i> Reset Password User
        </button>
        <button class="btn btn-primary px-3 py-2 fw-semibold" onclick="App.openModalAddGuru()">
          <i class="bi bi-person-plus-fill me-2"></i> Tambah Guru Wali Baru
        </button>
      </div>
    </div>

    <div class="card card-custom p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>NIP / Username</th>
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
                <td><span class="badge bg-success-subtle text-success border border-success">${g.kelas_binaan || 'Kelas X-A'}</span></td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-danger" onclick="App.openModalResetPasswordWithNip('${g.nip}', 'Guru')"><i class="bi bi-key"></i> Reset Pass</button>
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
        <p class="text-muted mb-0">Data NISN, Profil, Mapel Sulit, Hobi, Cita-cita, dan Orang Tua.</p>
      </div>
      <button class="btn btn-primary px-3 py-2 fw-semibold" onclick="App.openModalAddMurid()"><i class="bi bi-person-plus-fill me-2"></i> Tambah Murid Baru</button>
    </div>

    <div class="card card-custom p-3 mb-4">
      <div class="row g-2">
        <div class="col-md-8">
          <input type="text" id="search-murid" class="form-control" placeholder="Cari nama murid atau NISN..." onkeyup="App.filterMuridTable()">
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
          <thead class="table-light"><tr><th>Murid</th><th>NISN</th><th>Kelas</th><th>Mapel Sulit</th><th>Hobi & Cita-Cita</th><th>Status</th><th class="text-center">Aksi</th></tr></thead>
          <tbody>
            ${listMurid.map(m => `
              <tr>
                <td><div class="d-flex align-items-center gap-3"><img src="${m.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" class="rounded-circle border" style="width: 44px; height: 44px; object-fit: cover;"><div><div class="fw-bold text-dark">${m.nama_murid}</div><small class="text-muted">${m.nama_ortu || '-'}</small></div></div></td>
                <td class="fw-semibold text-secondary">${m.nisn || m.nis || '-'}</td>
                <td><span class="badge bg-secondary">${m.kelas || 'Kelas X-A'}</span></td>
                <td><span class="badge bg-danger-subtle text-danger border border-danger">${m.mapel_sulit || '-'}</span></td>
                <td><span class="badge bg-primary-subtle text-primary mb-1">${m.hobi || '-'}</span><br><small class="text-muted">Cita: ${m.cita_cita || '-'}</small></td>
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
      <div><h3 class="fw-bold mb-1"><i class="bi bi-journal-bookmark-fill text-primary me-2"></i>Pendampingan & Konseling</h3></div>
      <button class="btn btn-primary fw-semibold" onclick="App.openModalAddPendampingan()"><i class="bi bi-plus-circle-fill me-2"></i> Sesi Pendampingan Baru</button>
    </div>
    <div class="card card-custom p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light"><tr><th>Tanggal</th><th>Murid</th><th>Masalah & Analisis</th><th>Target & RTL</th><th>Status</th><th class="text-center">Aksi</th></tr></thead>
          <tbody>
            ${listPDP.map(p => `
              <tr>
                <td class="fw-bold text-secondary">${p.tanggal}</td>
                <td><div class="fw-bold text-dark">${p.nama_murid}</div></td>
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

  karakter: () => `<div class="card card-custom p-4"><h5>Penilaian 5 Dimensi Karakter</h5></div>`,
  komunikasi: () => `<div class="card card-custom p-4"><h5>Log Komunikasi Orang Tua</h5></div>`,
  laporan: () => `<div class="card card-custom p-4"><h5>Generator Laporan PDF/Word</h5></div>`,
  aiChat: () => `<div class="card card-custom p-4"><h5>AI Chat Interaktif</h5></div>`
};
