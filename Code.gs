/**
 * =========================================================================
 * SIM-WALI (Sistem Informasi Mentoring Wali) - Backend Google Apps Script
 * =========================================================================
 * 
 * PETUNJUK INSTALASI:
 * 1. Buka Google Spreadsheet baru di https://sheets.new
 * 2. Buat 3 Tab (Sheet) dengan nama persis:
 *    - "Users"
 *    - "Profil_Murid"
 *    - "Sesi_Bimbingan"
 *    (Atau jalankan fungsi initDatabase() sekali di Apps Script untuk auto-create)
 * 3. Buka menu Extensions > Apps Script (Ekstensi > Apps Script).
 * 4. Hapus semua kode default, lalu Paste seluruh kode ini ke dalam Code.gs.
 * 5. (Opsional untuk AI Gemini): Masuk ke Project Settings (ikon gerigi) > Script Properties:
 *    - Property: GEMINI_API_KEY
 *    - Value: [Masukkan API Key dari Google AI Studio]
 * 6. Klik "Deploy" > "New deployment" (Terapkan > Penerapan baru).
 * 7. Pilih tipe "Web app".
 *    - Description: SIM-WALI API v1
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja, bahkan anonim) -> PENTING agar bisa diakses dari Web/GitHub Pages
 * 8. Salin URL Web App yang dihasilkan (akhiran /exec) dan tempelkan ke variabel API_URL di frontend.
 * =========================================================================
 */

// Konfigurasi Nama Tab
const SHEETS = {
  USERS: "Users",
  PROFIL: "Profil_Murid",
  SESI: "Sesi_Bimbingan"
};

/**
 * Handle HTTP GET Requests (CORS Enabled)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "ping";
    let result = { success: true, timestamp: new Date().toISOString() };

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case "ping":
        result.message = "SIM-WALI Google Apps Script API is active & running.";
        break;

      case "init":
        result = initDatabase();
        break;

      case "getUsers":
        result.data = getSheetData(ss.getSheetByName(SHEETS.USERS));
        break;

      case "getProfilMurid":
        const muridId = e.parameter.murid_id;
        const allProfil = getSheetData(ss.getSheetByName(SHEETS.PROFIL));
        result.data = muridId ? allProfil.filter(p => p.murid_id === muridId) : allProfil;
        break;

      case "getSesiBimbingan":
        const kelas = e.parameter.kelas;
        const filterMuridId = e.parameter.murid_id;
        const allSesi = getSheetData(ss.getSheetByName(SHEETS.SESI));
        
        let filtered = allSesi;
        if (filterMuridId) {
          filtered = filtered.filter(s => String(s.murid_id_list || "").includes(filterMuridId));
        }
        result.data = filtered;
        break;

      default:
        result = { success: false, error: "Action '" + action + "' tidak dikenali di doGet." };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests (CORS Enabled)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let result = { success: true, timestamp: new Date().toISOString() };

    switch (action) {
      // 1. Otentikasi Login
      case "login":
        result = handleLogin(ss, payload.user_id, payload.password);
        break;

      // 2. Simpan / Perbarui Profil Murid
      case "saveProfil":
        result = handleSaveProfil(ss, payload.profil);
        break;

      // 3. Ajukan Sesi Bimbingan (Murid / Guru)
      case "ajukanBimbingan":
        result = handleAjukanBimbingan(ss, payload.sesi);
        break;

      // 4. Update Jurnal Guru & Status Bimbingan
      case "saveJurnalGuru":
        result = handleSaveJurnalGuru(ss, payload.sesi_id, payload.jurnal_guru, payload.status, payload.ai_summary);
        break;

      // 5. Generate AI Insight via Gemini API
      case "generateGemini":
        result = handleGeminiAnalysis(payload);
        break;

      default:
        result = { success: false, error: "Action '" + action + "' tidak dikenali di doPost." };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Utility: Membuat Response JSON dengan Header CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utility: Membaca data sheet menjadi array of object berdasarkan header baris ke-1
 */
function getSheetData(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0].map(h => String(h).trim().toLowerCase());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Lewati baris kosong
    if (!row[0] && !row[1]) continue;

    const item = {};
    headers.forEach((h, idx) => {
      let val = row[idx];
      // Auto parse JSON field jika ada (seperti array / object)
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try {
          val = JSON.parse(val);
        } catch (e) {}
      }
      item[h] = val;
    });
    data.push(item);
  }
  return data;
}

/**
 * Handle Login Otentikasi
 */
function handleLogin(ss, userId, password) {
  const users = getSheetData(ss.getSheetByName(SHEETS.USERS));
  const user = users.find(u => String(u.user_id).trim() === String(userId).trim());

  if (!user) {
    return { success: false, error: "User ID / NIS tidak ditemukan." };
  }

  if (user.password && String(user.password).trim() !== String(password).trim()) {
    return { success: false, error: "Password salah. Silakan periksa kembali." };
  }

  // Sembunyikan password di response
  const sanitized = Object.assign({}, user);
  delete sanitized.password;

  return {
    success: true,
    user: sanitized,
    message: "Login berhasil sebagai " + user.nama_lengkap
  };
}

/**
 * Handle Simpan / Update Profil Murid
 */
function handleSaveProfil(ss, profil) {
  if (!profil || !profil.murid_id) {
    return { success: false, error: "Data profil atau murid_id tidak valid." };
  }

  const sheet = ss.getSheetByName(SHEETS.PROFIL);
  const rows = sheet.getDataRange().getValues();
  let foundRowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(profil.murid_id).trim()) {
      foundRowIndex = i + 1; // 1-indexed di Sheets
      break;
    }
  }

  const rowData = [
    profil.murid_id,
    profil.hobi || "",
    profil.cita_cita || "",
    profil.gaya_belajar || "",
    JSON.stringify(profil.mapel_disukai || []),
    JSON.stringify(profil.mapel_menantang || []),
    profil.kendala_belajar || ""
  ];

  if (foundRowIndex > 0) {
    // Update baris yang sudah ada
    sheet.getRange(foundRowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Tambah baris baru
    sheet.appendRow(rowData);
  }

  return { success: true, message: "Profil murid berhasil disimpan ke Google Sheets." };
}

/**
 * Handle Pengajuan Sesi Bimbingan
 */
function handleAjukanBimbingan(ss, sesi) {
  if (!sesi) return { success: false, error: "Data sesi tidak valid." };

  const sheet = ss.getSheetByName(SHEETS.SESI);
  const sesiId = sesi.sesi_id || "sesi_" + new Date().getTime();

  const rowData = [
    sesiId,
    sesi.jenis_sesi || "Personal",
    JSON.stringify(sesi.murid_id_list || [sesi.murid_id]),
    sesi.inisiator || "murid",
    sesi.waktu_lokasi || "",
    sesi.topik_kendala || "",
    sesi.status || "Menunggu",
    sesi.jurnal_guru || "",
    JSON.stringify(sesi.ai_summary || null)
  ];

  sheet.appendRow(rowData);
  return {
    success: true,
    sesi_id: sesiId,
    message: "Sesi bimbingan berhasil diajukan dan dicatat."
  };
}

/**
 * Handle Simpan Jurnal Guru & Hasil AI
 */
function handleSaveJurnalGuru(ss, sesiId, jurnalGuru, status, aiSummary) {
  const sheet = ss.getSheetByName(SHEETS.SESI);
  const rows = sheet.getDataRange().getValues();
  let targetRow = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(sesiId).trim()) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow <= 0) {
    return { success: false, error: "Sesi bimbingan dengan ID " + sesiId + " tidak ditemukan." };
  }

  // Kolom 7: status, Kolom 8: jurnal_guru, Kolom 9: ai_summary
  if (status) sheet.getRange(targetRow, 7).setValue(status);
  if (jurnalGuru !== undefined) sheet.getRange(targetRow, 8).setValue(jurnalGuru);
  if (aiSummary !== undefined) sheet.getRange(targetRow, 9).setValue(JSON.stringify(aiSummary));

  return { success: true, message: "Jurnal guru dan AI insight berhasil disimpan." };
}

/**
 * Integrasi Google AI Studio (Gemini API) via UrlFetchApp
 */
function handleGeminiAnalysis(payload) {
  const geminiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  
  const studentName = payload.studentName || "Murid";
  const className = payload.className || "-";
  const hobbies = payload.hobbies || "-";
  const goals = payload.goals || "-";
  const learningStyle = payload.learningStyle || "-";
  const favoriteSubjects = Array.isArray(payload.favoriteSubjects) ? payload.favoriteSubjects.join(", ") : (payload.favoriteSubjects || "-");
  const challengingSubjects = Array.isArray(payload.challengingSubjects) ? payload.challengingSubjects.join(", ") : (payload.challengingSubjects || "-");
  const independentObstacles = payload.independentObstacles || "-";
  const teacherJournal = payload.teacherJournal || "-";
  const sessionTopic = payload.sessionTopic || "-";

  if (!geminiKey) {
    // Fallback cerdas jika Script Properties belum diisi GEMINI_API_KEY
    return {
      success: true,
      source: "fallback-script",
      message: "Catatan: GEMINI_API_KEY belum disetel di Script Properties. Menggunakan analisis template cerdas.",
      data: {
        summaryPoints: [
          "Murid " + studentName + " memiliki minat kuat pada " + favoriteSubjects + " dengan gaya belajar " + learningStyle + ".",
          "Fokus pendampingan diarahkan pada mapel menantang (" + challengingSubjects + ") dan kendala mandiri: " + independentObstacles + ".",
          "Sesi mentoring menunjukkan potensi positif murid untuk meraih cita-cita sebagai " + goals + "."
        ],
        recommendations: [
          "Guru Wali: Terapkan metode belajar bertahap dan fasilitasi diskusi kelompok/tutor sebaya pada mapel yang menantang.",
          "Orang Tua & Rumah: Ciptakan rutinitas belajar terstruktur 30-45 menit dan berikan apresiasi positif atas hobi " + hobbies + "."
        ],
        encouragementQuote: '"Setiap usaha belajar adalah langkah nyata menuju cita-cita ' + goals + '. Teruslah bersemangat, ' + studentName + '!"'
      }
    };
  }

  const prompt = "Anda adalah konselor pendidikan & asisten AI ahli bimbingan siswa untuk Guru Wali Kelas di Indonesia.\n" +
    "Analisis data mentoring berikut:\n" +
    "- Nama Siswa: " + studentName + "\n" +
    "- Kelas: " + className + "\n" +
    "- Hobi: " + hobbies + "\n" +
    "- Cita-cita: " + goals + "\n" +
    "- Gaya Belajar: " + learningStyle + "\n" +
    "- Mapel Disukai: " + favoriteSubjects + "\n" +
    "- Mapel Menantang: " + challengingSubjects + "\n" +
    "- Kendala Belajar: " + independentObstacles + "\n" +
    "- Topik Sesi: " + sessionTopic + "\n" +
    "- Jurnal Guru: " + teacherJournal + "\n\n" +
    "Buatkan output JSON valid persis seperti ini (tanpa backtick markdown tambahan):\n" +
    "{\n" +
    '  "summaryPoints": ["Poin ringkas 1", "Poin ringkas 2", "Poin ringkas 3"],\n' +
    '  "recommendations": ["Rekomendasi konkret 1 untuk Guru Wali", "Rekomendasi konkret 2 untuk Orang Tua/Murid"],\n' +
    '  "encouragementQuote": "Kalimat motivasi hangat untuk murid"\n' +
    "}";

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey;
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const jsonResp = JSON.parse(response.getContentText());

  if (jsonResp.candidates && jsonResp.candidates[0] && jsonResp.candidates[0].content) {
    const rawText = jsonResp.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(rawText);
    return {
      success: true,
      source: "gemini-api",
      data: parsedData
    };
  } else {
    throw new Error("Gagal menerima respon dari Gemini API: " + response.getContentText());
  }
}

/**
 * Inisialisasi Struktur Tabel Google Sheets (Jalankan 1x saat pertama kali)
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Users
  let sheetUsers = ss.getSheetByName(SHEETS.USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEETS.USERS);
    sheetUsers.appendRow([
      "user_id", "nama_lengkap", "role", "password", "kelas", "no_whatsapp", "link_wa_grup", "guru_wali_id"
    ]);
    sheetUsers.getRange("A1:H1").setFontWeight("bold").setBackground("#0f4c81").setFontColor("#ffffff");
    
    // Sample Data
    sheetUsers.appendRow(["guru_101", "Pak Ahmad Fauzi, S.Pd.", "guru_wali", "password123", "X-A", "6281234567890", "https://chat.whatsapp.com/DK7wHSeq77Fj2SbRt2KM4L", ""]);
    sheetUsers.appendRow(["murid_01", "Budi Santoso", "murid", "123", "X-A", "6285712345678", "https://chat.whatsapp.com/DK7wHSeq77Fj2SbRt2KM4L", "guru_101"]);
    sheetUsers.appendRow(["murid_02", "Siti Rahmawati", "murid", "123", "X-A", "6285888991122", "https://chat.whatsapp.com/DK7wHSeq77Fj2SbRt2KM4L", "guru_101"]);
  }

  // 2. Sheet Profil_Murid
  let sheetProfil = ss.getSheetByName(SHEETS.PROFIL);
  if (!sheetProfil) {
    sheetProfil = ss.insertSheet(SHEETS.PROFIL);
    sheetProfil.appendRow([
      "murid_id", "hobi", "cita_cita", "gaya_belajar", "mapel_disukai", "mapel_menantang", "kendala_belajar"
    ]);
    sheetProfil.getRange("A1:G1").setFontWeight("bold").setBackground("#0f4c81").setFontColor("#ffffff");
    
    // Sample Data
    sheetProfil.appendRow([
      "murid_01", "Robotika & Koding", "Software Engineer Google", "Visual & Praktik Langsung",
      JSON.stringify(["Informatika / Koding", "Matematika"]),
      JSON.stringify(["Kimia"]),
      "Kesulitan menghafal reaksi kimia organik saat belajar mandiri."
    ]);
  }

  // 3. Sheet Sesi_Bimbingan
  let sheetSesi = ss.getSheetByName(SHEETS.SESI);
  if (!sheetSesi) {
    sheetSesi = ss.insertSheet(SHEETS.SESI);
    sheetSesi.appendRow([
      "sesi_id", "jenis_sesi", "murid_id_list", "inisiator", "waktu_lokasi", "topik_kendala", "status", "jurnal_guru", "ai_summary"
    ]);
    sheetSesi.getRange("A1:I1").setFontWeight("bold").setBackground("#0f4c81").setFontColor("#ffffff");
  }

  return {
    success: true,
    message: "Struktur Google Sheets SIM-WALI berhasil dibuat dengan 3 Tab: Users, Profil_Murid, & Sesi_Bimbingan."
  };
}
