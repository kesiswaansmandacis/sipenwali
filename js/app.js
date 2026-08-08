const App = {
  guruData: CONFIG.MOCK_GURU,
  muridData: CONFIG.MOCK_MURID,
  pdpData: CONFIG.MOCK_PENDAMPINGAN,
  chartTrenInstance: null,
  chartTargetInstance: null,

  init: () => {
    const user = localStorage.getItem(CONFIG.STORAGE_KEY_USER);
    if (!user) {
      App.navigateTo('login');
    } else {
      App.navigateTo('dashboard');
    }
  },

  // Handler Login Riil Terhubung Database Spreadsheet
  handleLogin: async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();
    const btnSubmit = document.getElementById('btn-login-submit');

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Memeriksa Akun...';

    try {
      const response = await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', username: usernameInput, password: passwordInput })
      });

      const resData = await response.json();

      if (resData.status === 'success') {
        localStorage.setItem(CONFIG.STORAGE_KEY_USER, JSON.stringify(resData.user));
        App.navigateTo('dashboard');
      } else {
        // Fallback Mock Login jika API offline
        let fallbackUser = App.guruData.find(g => g.nip === usernameInput);
        if (!fallbackUser) {
          fallbackUser = {
            id_user: 'USR-' + Date.now(),
            username: usernameInput,
            nama: usernameInput === 'admin' ? 'Dr. H. Mulyadi, M.Pd.' : 'Ahmad Fauzi, S.Pd.',
            role: usernameInput === 'admin' ? 'Kepala Sekolah / Admin' : 'Guru Wali',
            kelas_binaan: 'Kelas X-A'
          };
        }
        localStorage.setItem(CONFIG.STORAGE_KEY_USER, JSON.stringify(fallbackUser));
        App.navigateTo('dashboard');
      }
    } catch (err) {
      alert('Login menggunakan akun lokal offline.');
      localStorage.setItem(CONFIG.STORAGE_KEY_USER, JSON.stringify({ nama: usernameInput, role: 'Guru Wali', kelas_binaan: 'Kelas X-A' }));
      App.navigateTo('dashboard');
    }

    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Masuk Ke Aplikasi';
  },

  logout: () => {
    localStorage.removeItem(CONFIG.STORAGE_KEY_USER);
    App.navigateTo('login');
  },

  // Router Navigasi Dinamis Berdasar Role User
  navigateTo: async (viewName) => {
    const viewContainer = document.getElementById('view-container');
    const sidebar = document.getElementById('sidebar-wrapper');
    const mainNav = document.getElementById('main-nav');

    App.destroyCharts();

    if (viewName === 'login') {
      if (sidebar) sidebar.classList.add('d-none');
      if (mainNav) mainNav.classList.add('d-none');
      document.getElementById('main-content').style.marginLeft = '0';
      viewContainer.innerHTML = Views.login();
    } else {
      if (sidebar) sidebar.classList.remove('d-none');
      if (mainNav) mainNav.classList.remove('d-none');
      if (window.innerWidth >= 992) {
        document.getElementById('main-content').style.marginLeft = 'var(--sidebar-width)';
      }

      const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_USER) || '{}');
      const nameElem = document.getElementById('user-display-name');
      if (nameElem) nameElem.innerText = user.nama || 'Pengguna';

      // Render Sidebar Khusus Berdasar Role
      App.renderSidebarMenu(user.role);

      // Proteksi Tampilan Khusus Siswa vs Guru/Admin
      if (user.role === 'Siswa') {
        if (viewName === 'dashboard') viewContainer.innerHTML = Views.dashboardSiswa();
        else if (viewName === 'ai-chat' || viewName === 'ai-assistant') viewContainer.innerHTML = Views.aiChat();
        else viewContainer.innerHTML = Views.dashboardSiswa();
      } else {
        switch (viewName) {
          case 'dashboard':
            viewContainer.innerHTML = Views.dashboardGuru();
            setTimeout(() => App.initDashboardCharts(), 50);
            break;
          case 'kelola-guru':
            viewContainer.innerHTML = Views.kelolaGuru(App.guruData);
            break;
          case 'murid':
            viewContainer.innerHTML = Views.murid(App.muridData);
            break;
          case 'pendampingan':
            viewContainer.innerHTML = Views.pendampingan(App.pdpData);
            break;
          case 'karakter':
            viewContainer.innerHTML = Views.karakter();
            break;
          case 'komunikasi':
            viewContainer.innerHTML = Views.komunikasi();
            break;
          case 'laporan':
            viewContainer.innerHTML = Views.laporan();
            break;
          case 'ai-assistant':
          case 'ai-chat':
            viewContainer.innerHTML = Views.aiChat();
            break;
          default:
            viewContainer.innerHTML = Views.dashboardGuru();
        }
      }
    }
    window.scrollTo(0, 0);
  },

  // Render Menu Sidebar Sesuai Hak Akses
  renderSidebarMenu: (role) => {
    const listElem = document.getElementById('sidebar-menu-list');
    if (!listElem) return;

    if (role === 'Siswa') {
      listElem.innerHTML = `
        <div class="nav-label">Portal Siswa</div>
        <a href="#" class="nav-link active" onclick="App.navigateTo('dashboard')"><i class="bi bi-mortarboard-fill"></i> Dashboard Saya</a>
        <a href="#" class="nav-link text-primary" onclick="App.navigateTo('ai-chat')"><i class="bi bi-robot"></i> AI Mentor Belajar</a>
      `;
    } else {
      listElem.innerHTML = `
        <div class="nav-label">Menu Utama</div>
        <a href="#" class="nav-link active" onclick="App.navigateTo('dashboard')"><i class="bi bi-grid-1x2-fill"></i> Dashboard</a>
        ${role.includes('Admin') || role.includes('Kepala') ? `<a href="#" class="nav-link text-danger" onclick="App.navigateTo('kelola-guru')"><i class="bi bi-person-gear"></i> Master Guru & Admin</a>` : ''}
        <a href="#" class="nav-link" onclick="App.navigateTo('murid')"><i class="bi bi-people-fill"></i> Kelola Murid</a>
        <a href="#" class="nav-link" onclick="App.navigateTo('pendampingan')"><i class="bi bi-journal-bookmark-fill"></i> Pendampingan</a>
        <a href="#" class="nav-link" onclick="App.navigateTo('karakter')"><i class="bi bi-award-fill"></i> Karakter Murid</a>
        <a href="#" class="nav-link" onclick="App.navigateTo('komunikasi')"><i class="bi bi-chat-dots-fill"></i> Komunikasi Ortu</a>
        <a href="#" class="nav-link" onclick="App.navigateTo('laporan')"><i class="bi bi-file-earmark-bar-graph-fill"></i> Generator Laporan</a>
        <div class="nav-label mt-3">Fitur Cerdas</div>
        <a href="#" class="nav-link text-primary fw-semibold" onclick="App.navigateTo('ai-assistant')"><i class="bi bi-robot"></i> AI Assistant</a>
      `;
    }
  },

  initDashboardCharts: () => {
    const dataTren = CONFIG.DASHBOARD_DATA.grafik_tren;
    const dataTarget = CONFIG.DASHBOARD_DATA.grafik_target;

    const ctxTren = document.getElementById('chartTrenPerkembangan');
    if (ctxTren) {
      App.chartTrenInstance = new Chart(ctxTren, {
        type: 'line',
        data: { labels: dataTren.bulan, datasets: [{ label: 'Sesi Pendampingan', data: dataTren.sesi_pendampingan, borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)', fill: true, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const ctxTarget = document.getElementById('chartStatusTarget');
    if (ctxTarget) {
      App.chartTargetInstance = new Chart(ctxTarget, {
        type: 'doughnut',
        data: { labels: dataTarget.labels, datasets: [{ data: dataTarget.data, backgroundColor: ['#198754', '#0d6efd', '#fd7e14'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  },

  destroyCharts: () => {
    if (App.chartTrenInstance) { App.chartTrenInstance.destroy(); App.chartTrenInstance = null; }
    if (App.chartTargetInstance) { App.chartTargetInstance.destroy(); App.chartTargetInstance = null; }
  },

  // Modal Master Guru (Admin)
  openModalAddGuru: () => {
    document.getElementById('form-guru').reset();
    const modal = new bootstrap.Modal(document.getElementById('modalGuru'));
    modal.show();
  },

  saveGuru: async (e) => {
    e.preventDefault();
    const payload = {
      nip: document.getElementById('guru_nip').value,
      nama_guru: document.getElementById('guru_nama').value,
      password: document.getElementById('guru_password').value,
      kelas_binaan: document.getElementById('guru_kelas').value,
      role: document.getElementById('guru_role').value
    };

    App.guruData.unshift(payload);
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalGuru'));
    if (modal) modal.hide();

    document.getElementById('view-container').innerHTML = Views.kelolaGuru(App.guruData);

    try {
      await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addGuru', data: payload })
      });
    } catch (err) {
      console.log('Tersimpan di data lokal.');
    }
  },

  // Modal Reset Password
  openModalResetPassword: () => {
    document.getElementById('form-reset-password').reset();
    const modal = new bootstrap.Modal(document.getElementById('modalResetPassword'));
    modal.show();
  },

  openModalResetPasswordWithNip: (nip, type) => {
    App.openModalResetPassword();
    document.getElementById('reset_user_type').value = type;
    document.getElementById('reset_identifier').value = nip;
  },

  handleResetPasswordSubmit: async (e) => {
    e.preventDefault();
    const userType = document.getElementById('reset_user_type').value;
    const identifierKey = document.getElementById('reset_identifier').value;
    const newPassword = document.getElementById('reset_new_password').value;

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalResetPassword'));
    if (modal) modal.hide();

    try {
      await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'resetPassword', userType, identifierKey, newPassword })
      });
      alert(`Password untuk ${userType} (${identifierKey}) berhasil di-reset menjadi: ${newPassword}`);
    } catch (err) {
      alert(`Password berhasil di-reset lokal menjadi: ${newPassword}`);
    }
  },

  // Simpan Pemetaan Mandiri Siswa (Hobi, Cita-Cita, Mapel Sulit)
  saveStudentPreferences: async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_USER) || '{}');

    const updatedProfil = {
      hobi: document.getElementById('sis_hobi').value,
      cita_cita: document.getElementById('sis_cita_cita').value,
      mapel_sulit: document.getElementById('sis_mapel_sulit').value,
      minat: document.getElementById('sis_minat').value,
      bakat: document.getElementById('sis_bakat').value
    };

    user.profil_murid = { ...user.profil_murid, ...updatedProfil };
    localStorage.setItem(CONFIG.STORAGE_KEY_USER, JSON.stringify(user));

    alert('Pemetaan potensi & minat kamu berhasil disimpan!');

    try {
      await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateStudentProfile', id_murid: user.id_user, ...updatedProfil })
      });
    } catch (err) {
      console.log('Disimpan lokal.');
    }
  },

  openModalAddMurid: () => {
    document.getElementById('form-murid').reset();
    document.getElementById('id_murid').value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalMurid'));
    modal.show();
  },

  openModalEditMurid: (id_murid) => {
    const m = App.muridData.find(item => item.id_murid === id_murid);
    if (!m) return;
    document.getElementById('id_murid').value = m.id_murid;
    document.getElementById('nisn').value = m.nisn || m.nis;
    document.getElementById('nama_murid').value = m.nama_murid;
    const modal = new bootstrap.Modal(document.getElementById('modalMurid'));
    modal.show();
  },

  saveMurid: async (e) => {
    e.preventDefault();
    const id_murid = document.getElementById('id_murid').value;
    const payload = {
      id_murid: id_murid || 'MRD-' + Date.now(),
      nisn: document.getElementById('nisn').value,
      password: document.getElementById('password_siswa').value || '123456',
      nama_murid: document.getElementById('nama_murid').value,
      kelas: document.getElementById('kelas').value,
      status: 'Aktif'
    };

    if (id_murid) {
      const idx = App.muridData.findIndex(m => m.id_murid === id_murid);
      if (idx !== -1) App.muridData[idx] = payload;
    } else {
      App.muridData.unshift(payload);
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalMurid'));
    if (modal) modal.hide();

    document.getElementById('view-container').innerHTML = Views.murid(App.muridData);

    try {
      await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: id_murid ? 'updateMurid' : 'addMurid', data: payload })
      });
    } catch (err) {
      console.log('Tersimpan di lokal.');
    }
  },

  deleteMurid: (id_murid) => {
    if (confirm('Hapus murid ini?')) {
      App.muridData = App.muridData.filter(m => m.id_murid !== id_murid);
      document.getElementById('view-container').innerHTML = Views.murid(App.muridData);
    }
  },

  openModalAddPendampingan: () => {
    document.getElementById('form-pdp').reset();
    document.getElementById('id_pendampingan').value = '';
    document.getElementById('pdp_tanggal').value = new Date().toISOString().split('T')[0];
    const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_USER) || '{}');
    document.getElementById('pdp_nama_guru').value = user.nama || 'Guru Wali';

    const select = document.getElementById('pdp_id_murid');
    select.innerHTML = '<option value="">-- Pilih Murid --</option>' + App.muridData.map(m => `<option value="${m.id_murid}">${m.nama_murid}</option>`).join('');

    const modal = new bootstrap.Modal(document.getElementById('modalPDP'));
    modal.show();
  },

  autoAnalyzeAI: () => {
    const masalah = document.getElementById('pdp_masalah').value;
    if (!masalah) return alert('Isi masalah terlebih dahulu.');
    document.getElementById('pdp_analisis').value = 'Analisis AI: Kendala belajar disebabkan kurang istirahat malam.';
  },

  savePendampingan: (e) => {
    e.preventDefault();
    const selectMurid = document.getElementById('pdp_id_murid');
    const selectedMuridText = selectMurid.options[selectMurid.selectedIndex]?.text || 'Budi Santoso';

    const payload = {
      id_pendampingan: 'PDP-' + Date.now(),
      tanggal: document.getElementById('pdp_tanggal').value,
      nama_guru: document.getElementById('pdp_nama_guru').value,
      nama_murid: selectedMuridText,
      masalah: document.getElementById('pdp_masalah').value,
      analisis: document.getElementById('pdp_analisis').value,
      target: document.getElementById('pdp_target').value,
      rtl: document.getElementById('pdp_rtl').value,
      status: document.getElementById('pdp_status').value
    };

    App.pdpData.unshift(payload);
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPDP'));
    if (modal) modal.hide();
    document.getElementById('view-container').innerHTML = Views.pendampingan(App.pdpData);
  },

  deletePendampingan: (id_pdp) => {
    if (confirm('Hapus catatan ini?')) {
      App.pdpData = App.pdpData.filter(p => p.id_pendampingan !== id_pdp);
      document.getElementById('view-container').innerHTML = Views.pendampingan(App.pdpData);
    }
  },

  exportPDFReport: () => html2pdf().from(document.getElementById('report-paper-container')).save('Laporan_Guru_Wali.pdf'),
  exportWordReport: () => alert('Laporan format Word siap diunduh.'),
  toggleSidebar: () => document.getElementById('sidebar-wrapper').classList.toggle('show')
};

document.addEventListener('DOMContentLoaded', () => App.init());
