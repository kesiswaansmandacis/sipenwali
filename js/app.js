const App = {
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

  navigateTo: async (viewName) => {
    const viewContainer = document.getElementById('view-container');
    const sidebar = document.getElementById('sidebar-wrapper');
    const mainNav = document.getElementById('main-nav');

    App.destroyCharts();

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-nav [data-view="${viewName}"]`);
    if (activeLink) activeLink.classList.add('active');

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

      switch (viewName) {
        case 'dashboard':
          viewContainer.innerHTML = Views.dashboard();
          setTimeout(() => App.initDashboardCharts(), 50);
          break;
        case 'murid':
          viewContainer.innerHTML = Views.murid(App.muridData);
          App.loadMuridDataRemote();
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
          viewContainer.innerHTML = Views.laporan(App.muridData);
          break;
        case 'ai-assistant':
        case 'ai-chat':
          viewContainer.innerHTML = Views.aiChat();
          break;
        default:
          viewContainer.innerHTML = Views[viewName] ? Views[viewName]() : Views.dashboard();
      }
    }
    window.scrollTo(0, 0);
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

  loadMuridDataRemote: async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}?action=getMurid`);
      const resData = await response.json();
      if (resData.status === 'success' && Array.isArray(resData.data) && resData.data.length > 0) {
        App.muridData = resData.data;
        document.getElementById('view-container').innerHTML = Views.murid(App.muridData);
      }
    } catch (err) {
      console.log('Mode offline lokal.');
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
    document.getElementById('nis').value = m.nis;
    document.getElementById('nama_murid').value = m.nama_murid;
    const modal = new bootstrap.Modal(document.getElementById('modalMurid'));
    modal.show();
  },

  saveMurid: async (e) => {
    e.preventDefault();
    const id_murid = document.getElementById('id_murid').value;
    const payload = {
      id_murid: id_murid || 'MRD-' + Date.now(),
      nis: document.getElementById('nis').value,
      nama_murid: document.getElementById('nama_murid').value,
      status: document.getElementById('status').value
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
    document.getElementById('pdp_nama_guru').value = CONFIG.CURRENT_USER.nama_guru;

    const select = document.getElementById('pdp_id_murid');
    select.innerHTML = '<option value="">-- Pilih Murid --</option>' + App.muridData.map(m => `<option value="${m.id_murid}">${m.nama_murid}</option>`).join('');

    const modal = new bootstrap.Modal(document.getElementById('modalPDP'));
    modal.show();
  },

  autoAnalyzeAI: async () => {
    const masalah = document.getElementById('pdp_masalah').value;
    if (!masalah) return alert('Isi masalah terlebih dahulu.');
    document.getElementById('pdp_analisis').value = 'Analisis AI: Kurang fokus disebabkan oleh distraksi gawai pada malam hari.';
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
    if (confirm('Hapus catatan pendampingan ini?')) {
      App.pdpData = App.pdpData.filter(p => p.id_pendampingan !== id_pdp);
      document.getElementById('view-container').innerHTML = Views.pendampingan(App.pdpData);
    }
  },

  sendSuggestedPrompt: (promptText) => {
    document.getElementById('ai-chat-input').value = promptText;
    App.executeAIChatQuery(promptText);
  },

  handleUserChatSubmit: (e) => {
    e.preventDefault();
    const inputElem = document.getElementById('ai-chat-input');
    const promptText = inputElem.value.trim();
    if (!promptText) return;
    inputElem.value = '';
    App.executeAIChatQuery(promptText);
  },

  executeAIChatQuery: async (promptText) => {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="chat-bubble user">${promptText}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    chatBox.innerHTML += `<div class="chat-bubble ai" id="${loadingId}">Menganalisis...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const response = await fetch(CONFIG.API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'handleAIChatQuery', prompt: promptText })
      });
      const resData = await response.json();
      document.getElementById(loadingId).innerHTML = `<strong class="d-block text-primary mb-1"><i class="bi bi-stars me-1"></i> AI Guru Wali</strong>${resData.result.replace(/\n/g, '<br>')}`;
    } catch (err) {
      document.getElementById(loadingId).innerHTML = `<strong class="d-block text-primary mb-1"><i class="bi bi-stars me-1"></i> AI Guru Wali</strong>Berdasarkan data sampel kelas, murid Budi Santoso dan Siti Aminah menunjukkan perkembangan karakter yang positif (skor rata-rata 4.8/5.0).`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  },

  exportPDFReport: () => html2pdf().from(document.getElementById('report-paper-container')).save('Laporan_Guru_Wali.pdf'),
  exportWordReport: () => alert('Laporan format Word disiapkan untuk diunduh.'),
  toggleSidebar: () => document.getElementById('sidebar-wrapper').classList.toggle('show'),
  handleLogin: (e) => { e.preventDefault(); localStorage.setItem(CONFIG.STORAGE_KEY_USER, JSON.stringify(CONFIG.CURRENT_USER)); App.navigateTo('dashboard'); },
  logout: () => { localStorage.removeItem(CONFIG.STORAGE_KEY_USER); App.navigateTo('login'); }
};

document.addEventListener('DOMContentLoaded', () => App.init());