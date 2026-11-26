/**
 * VeriSMA — Pusat Cek Fakta & Edukasi Anti-Hoaks Siswa SMA
 * Fitur interaktif lengkap berbasis Vanilla JavaScript.
 */

// Ganti placeholder berikut dengan URL Web App Google Apps Script setelah Anda deploy
const URL_APPS_SCRIPT = "URL_APPS_SCRIPT_ANDA";

document.addEventListener("DOMContentLoaded", () => {
  setupStudentLogin();
  setupHoaxAnalyzer();
  setupEduTabs();
  setupAntiHoaxQuiz();
  setupHoaxReportForm();
});

/* ==========================================================================
   1. LOGIN SIMULASI BERBASIS LOCALSTORAGE + DATA CONTOH SISWA
   ========================================================================== */
function setupStudentLogin() {
  const STORAGE_KEY = "verisma_student_session";
  const btnOpenLogin = document.getElementById("btnOpenLogin");
  const btnLogout = document.getElementById("btnLogout");
  const modalBackdrop = document.getElementById("loginModalBackdrop");
  const btnCloseLogin = document.getElementById("btnCloseLogin");
  const btnFillDemo = document.getElementById("btnFillDemo");
  const simLoginForm = document.getElementById("simLoginForm");
  const activeStudentPill = document.getElementById("activeStudentPill");

  const inputName = document.getElementById("simStudentName");
  const inputClass = document.getElementById("simStudentClass");
  const inputSchool = document.getElementById("simStudentSchool");

  function syncUI() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const student = JSON.parse(raw);
        activeStudentPill.textContent = `${student.name} • ${student.kelas}`;
        activeStudentPill.classList.remove("hidden");
        btnOpenLogin.classList.add("hidden");
        btnLogout.classList.remove("hidden");

        // Otomatis bantu isi identitas pelapor jika form belum diisi
        const repName = document.getElementById("repName");
        const repClass = document.getElementById("repClass");
        if (repName && !repName.value) repName.value = student.name;
        if (repClass && !repClass.value) repClass.value = `${student.kelas} / ${student.school}`;
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      activeStudentPill.classList.add("hidden");
      btnOpenLogin.classList.remove("hidden");
      btnLogout.classList.add("hidden");
    }
  }

  btnOpenLogin.addEventListener("click", () => {
    modalBackdrop.classList.remove("hidden");
  });

  btnCloseLogin.addEventListener("click", () => {
    modalBackdrop.classList.add("hidden");
  });

  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      modalBackdrop.classList.add("hidden");
    }
  });

  // Tombol isi data contoh agar siswa aman tanpa memakai data pribadi asli
  btnFillDemo.addEventListener("click", () => {
    const demoStudents = [
      { name: "Nadia Putri (Contoh)", kelas: "XI IPA 2", school: "SMAN 1 Nusantara" },
      { name: "Dimas Pratama (Contoh)", kelas: "X-4", school: "SMA Cendekia Bangsa" },
      { name: "Salsa Maharani (Contoh)", kelas: "XII IPS 1", school: "SMAN 3 Harapan" }
    ];
    const randomStudent = demoStudents[Math.floor(Math.random() * demoStudents.length)];
    inputName.value = randomStudent.name;
    inputClass.value = randomStudent.kelas;
    inputSchool.value = randomStudent.school;
  });

  simLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const sessionData = {
      name: inputName.value.trim(),
      kelas: inputClass.value.trim(),
      school: inputSchool.value.trim()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    modalBackdrop.classList.add("hidden");
    syncUI();
  });

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    syncUI();
  });

  syncUI();
}

/* ==========================================================================
   2. ALAT CEK HOAKS CEPAT ([SIMULASI PROTOTIPE AI])
   ========================================================================== */
function setupHoaxAnalyzer() {
  const newsInput = document.getElementById("newsInput");
  const btnAnalyze = document.getElementById("btnAnalyzeNews");
  const btnReset = document.getElementById("btnResetNews");
  const btnSampleHoax = document.getElementById("btnSampleHoax");
  const btnSampleFact = document.getElementById("btnSampleFact");

  const scoreValue = document.getElementById("scoreValue");
  const scoreTitle = document.getElementById("scoreTitle");
  const scoreDesc = document.getElementById("scoreDesc");
  const statusBadge = document.getElementById("statusBadge");
  const scoreMeterFill = document.getElementById("scoreMeterFill");
  const provocativeList = document.getElementById("provocativeList");
  const indicatorList = document.getElementById("indicatorList");

  const sampleHoaxText =
    "VIRAL!! SEBARKAN KE SEMUA GRUP SEKOLAH SEKARANG JUGA!! Pemerintah diam-diam membagikan bantuan kuota belajar 250GB dan uang tunai pelajar tanpa syarat. Klik link hadiah ini sebelum dihapus malam ini!!";
  const sampleFactText =
    "Kementerian Pendidikan Dasar dan Menengah merilis jadwal resmi asesmen jenjang SMA melalui situs kemendikdasmen.go.id. Pihak sekolah diminta merujuk surat edaran resmi dinas pendidikan setempat.";

  btnSampleHoax.addEventListener("click", () => {
    newsInput.value = sampleHoaxText;
    runAnalysis(sampleHoaxText);
  });

  btnSampleFact.addEventListener("click", () => {
    newsInput.value = sampleFactText;
    runAnalysis(sampleFactText);
  });

  btnAnalyze.addEventListener("click", () => {
    runAnalysis(newsInput.value);
  });

  btnReset.addEventListener("click", () => {
    newsInput.value = "";
    scoreValue.textContent = "--";
    scoreTitle.textContent = "Belum Ada Teks yang Diuji";
    scoreDesc.textContent =
      "Masukkan teks di sebelah kiri lalu klik tombol analisis untuk melihat estimasi keakuratan dan daftar kata provokatif yang terdeteksi.";
    statusBadge.textContent = "Siap Menganalisis";
    statusBadge.className = "badge-status neutral";
    scoreMeterFill.style.width = "0%";
    provocativeList.innerHTML = '<span class="muted-text">Belum ada kata provokatif terdeteksi.</span>';
    indicatorList.innerHTML = `
      <li>Deteksi kata sensasional &amp; perintah menyebarkan pesan.</li>
      <li>Pemeriksaan huruf kapital ekstrem dan tanda seru beruntun.</li>
      <li>Pengecekan keberadaan rujukan lembaga atau domain resmi.</li>
    `;
  });

  function runAnalysis(rawText) {
    const text = rawText.trim();
    if (!text) {
      alert("Silakan tempelkan teks berita atau pesan terlebih dahulu.");
      return;
    }

    const provocativeKeywords = [
      "viral",
      "sebarkan",
      "sebelum dihapus",
      "geger",
      "terbongkar",
      "diam-diam",
      "tanpa syarat",
      "klik link",
      "hadiah",
      "wajib tahu",
      "darurat",
      "konspirasi",
      "100% terbukti",
      "buruan"
    ];

    const lower = text.toLowerCase();
    const matchedWords = provocativeKeywords.filter((kw) => lower.includes(kw));

    // Skor dasar simulasi 86
    let score = 86;
    const notes = [];

    if (matchedWords.length > 0) {
      score -= matchedWords.length * 12;
      notes.push(`Terdeteksi ${matchedWords.length} kata/frasa bernada provokatif atau sensasional.`);
    } else {
      notes.push("Tidak ditemukan kata kunci clickbait atau ajakan viral berantai.");
    }

    if (/!{2,}/.test(text)) {
      score -= 12;
      notes.push("Penggunaan tanda seru beruntun (!!) terdeteksi, umum pada pesan pemicu kepanikan.");
    }

    const lettersOnly = text.replace(/[^a-zA-Z]/g, "");
    const upperOnly = text.replace(/[^A-Z]/g, "");
    if (lettersOnly.length > 15 && upperOnly.length / lettersOnly.length > 0.35) {
      score -= 14;
      notes.push("Proporsi huruf kapital terlalu tinggi (>35%), ciri khas pesan berantai emosional.");
    }

    if (/(\.go\.id|\.ac\.id|surat edaran|situs resmi)/i.test(text)) {
      score += 8;
      notes.push("Mencantumkan rujukan domain atau dokumen resmi yang dapat diverifikasi.");
    } else {
      score -= 6;
      notes.push("Tidak ditemukan penyebutan domain resmi (.go.id) atau sumber terverifikasi.");
    }

    score = Math.max(8, Math.min(96, score));

    scoreValue.textContent = `${score}%`;
    scoreMeterFill.style.width = `${score}%`;

    if (score < 45) {
      statusBadge.textContent = "Indikasi Tinggi Hoaks";
      statusBadge.className = "badge-status danger";
      scoreTitle.textContent = "[SIMULASI PROTOTIPE AI] Waspada Disinformasi!";
      scoreDesc.textContent =
        "Teks memuat banyak pola bahasa provokatif dan ciri pesan berantai. Jangan teruskan sebelum mengeceknya di TurnBackHoax.id.";
    } else if (score < 75) {
      statusBadge.textContent = "Perlu Verifikasi Lanjut";
      statusBadge.className = "badge-status warning";
      scoreTitle.textContent = "[SIMULASI PROTOTIPE AI] Klaim Belum Terkonfirmasi";
      scoreDesc.textContent =
        "Gaya bahasa cukup netral tetapi minim rujukan sumber resmi. Bandingkan informasi ini dengan dua media kredibel.";
    } else {
      statusBadge.textContent = "Cenderung Informatif";
      statusBadge.className = "badge-status safe";
      scoreTitle.textContent = "[SIMULASI PROTOTIPE AI] Struktur Bahasa Netral";
      scoreDesc.textContent =
        "Tidak ditemukan pola provokatif ekstrem. Tetap periksa tanggal terbit serta keaslian tautan sumber aslinya.";
    }

    if (matchedWords.length > 0) {
      provocativeList.innerHTML = matchedWords
        .map((word) => `<span class="prov-chip">${word}</span>`)
        .join("");
    } else {
      provocativeList.innerHTML =
        '<span class="muted-text">Tidak ada kata provokatif dari kamus simulasi yang ditemukan.</span>';
    }

    indicatorList.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");
  }
}

/* ==========================================================================
   3. NAVIGASI TAB EDUKASI & KUIS INTERAKTIF
   ========================================================================== */
function setupEduTabs() {
  const triggers = document.querySelectorAll(".tab-trigger");
  const panels = document.querySelectorAll(".tab-content");

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");

      triggers.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });

      panels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const activePanel = document.getElementById(targetId);
      if (activePanel) activePanel.classList.add("active");
    });
  });
}

function setupAntiHoaxQuiz() {
  const questions = [
    {
      q: "Kamu menerima pesan WhatsApp bertuliskan 'SEBARKAN KE 10 GRUP SEBELUM DIHAPUS! Kuota gratis 200GB untuk seluruh pelajar'. Sikap paling tepat adalah...",
      options: [
        "Langsung membagikan ke grup kelas supaya teman-teman ikut mendapatkannya",
        "Mengklik tautan hadiah lalu memasukkan nomor ponsel dan kata sandi email",
        "Menahan diri dan memeriksa kebenarannya di situs resmi pemerintah atau TurnBackHoax.id",
        "Menyalin pesan lalu mengubah nama pengirimnya agar terlihat resmi"
      ],
      correct: 2,
      explain: "Ajakan menyebarkan secara mendesak tanpa domain resmi (.go.id) merupakan pola umum hoaks dan tautan phishing."
    },
    {
      q: "Cara terbaik memeriksa apakah foto bencana yang viral sebenarnya merupakan dokumentasi peristiwa lama adalah...",
      options: [
        "Membaca kolom komentar hingga selesai",
        "Menggunakan fitur Reverse Image Search seperti Google Lens",
        "Memperbesar ukuran gambar di layar ponsel",
        "Menghitung berapa kali unggahan tersebut dibagikan"
      ],
      correct: 1,
      explain: "Reverse Image Search membantu melacak kapan dan di mana foto tersebut pertama kali dipublikasikan."
    },
    {
      q: "Manakah ciri judul berita yang mengarah pada clickbait atau disinformasi?",
      options: [
        "Mencantumkan tanggal, lokasi, dan narasumber resmi secara jelas",
        "Memakai huruf kapital berlebihan, tanda seru berlapis, dan kata pemicu emosi",
        "Menyertakan rujukan data dari lembaga riset terpercaya",
        "Menggunakan bahasa baku sesuai pedoman jurnalistik"
      ],
      correct: 1,
      explain: "Judul sensasional sengaja memancing emosi pembaca agar langsung menyebarkan tanpa membaca isi."
    },
    {
      q: "Apa kegunaan utama Google Fact Check Explorer?",
      options: [
        "Menelusuri klaim yang sudah diverifikasi oleh berbagai organisasi cek fakta",
        "Membuat desain infografik poster sekolah secara otomatis",
        "Memblokir nomor WhatsApp pengirim pesan berantai",
        "Menerjemahkan buku pelajaran ke berbagai bahasa"
      ],
      correct: 0,
      explain: "Google Fact Check Explorer menghimpun hasil pemeriksaan fakta dari lembaga terakreditasi."
    },
    {
      q: "Mengapa siswa SMA perlu menerapkan prinsip 'Saring Sebelum Sharing'?",
      options: [
        "Agar selalu menjadi yang paling cepat mengirim berita viral",
        "Mencegah penyebaran kepanikan, fitnah, serta menjaga jejak digital yang sehat",
        "Supaya baterai ponsel lebih hemat saat membuka media sosial",
        "Karena semua informasi di media sosial pasti tidak benar"
      ],
      correct: 1,
      explain: "Memverifikasi sebelum membagikan melindungi lingkungan sekolah dari disinformasi dan risiko hukum digital."
    }
  ];

  let index = 0;
  let score = 0;
  let locked = false;

  const counterEl = document.getElementById("quizCounter");
  const scoreEl = document.getElementById("quizScoreBadge");
  const questionEl = document.getElementById("quizQuestionText");
  const optionsWrap = document.getElementById("quizOptionsWrap");
  const explainBox = document.getElementById("quizExplainBox");
  const btnNext = document.getElementById("btnNextQuestion");
  const btnRestart = document.getElementById("btnRestartQuiz");

  function drawQuestion() {
    locked = false;
    const current = questions[index];
    counterEl.textContent = `Soal ${index + 1} dari ${questions.length}`;
    scoreEl.textContent = `Skor: ${score}`;
    questionEl.textContent = current.q;
    explainBox.classList.add("hidden");
    btnNext.classList.add("hidden");
    btnRestart.classList.add("hidden");

    optionsWrap.innerHTML = "";
    current.options.forEach((label, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-choice";
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${label}`;
      btn.addEventListener("click", () => selectOption(idx, btn));
      optionsWrap.appendChild(btn);
    });
  }

  function selectOption(chosenIdx, chosenBtn) {
    if (locked) return;
    locked = true;

    const current = questions[index];
    const buttons = optionsWrap.querySelectorAll(".option-choice");
    buttons.forEach((b) => (b.disabled = true));

    if (chosenIdx === current.correct) {
      score += 20;
      chosenBtn.classList.add("is-correct");
      explainBox.innerHTML = `<strong>Benar!</strong> ${current.explain}`;
    } else {
      chosenBtn.classList.add("is-wrong");
      buttons[current.correct].classList.add("is-correct");
      explainBox.innerHTML = `<strong>Kurang tepat.</strong> ${current.explain}`;
    }

    scoreEl.textContent = `Skor: ${score}`;
    explainBox.classList.remove("hidden");

    if (index < questions.length - 1) {
      btnNext.classList.remove("hidden");
    } else {
      questionEl.textContent = `Kuis Selesai! Skor Akhir Kamu: ${score} / 100`;
      btnRestart.classList.remove("hidden");
    }
  }

  btnNext.addEventListener("click", () => {
    index += 1;
    drawQuestion();
  });

  btnRestart.addEventListener("click", () => {
    index = 0;
    score = 0;
    drawQuestion();
  });

  drawQuestion();
}

/* ==========================================================================
   4. FORMULIR LAPOR HOAKS KE GOOGLE APPS SCRIPT (FETCH POST)
   ========================================================================== */
function setupHoaxReportForm() {
  const form = document.getElementById("hoaxReportForm");
  const btnSubmit = document.getElementById("btnSubmitReport");
  const feedback = document.getElementById("reportFeedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dataLaporan = {
      waktu_input: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      nama: document.getElementById("repName").value.trim(),
      kelas: document.getElementById("repClass").value.trim(),
      platform: document.getElementById("repPlatform").value,
      kategori: document.getElementById("repCategory").value,
      tautan: document.getElementById("repUrl").value.trim() || "-",
      isi_laporan: document.getElementById("repDesc").value.trim()
    };

    // Jika URL placeholder belum diganti, tampilkan konfirmasi simulasi lokal
    if (!URL_APPS_SCRIPT || URL_APPS_SCRIPT === "URL_APPS_SCRIPT_ANDA") {
      feedback.className = "feedback-alert sim";
      feedback.innerHTML =
        "<strong>Simulasi Berhasil:</strong> Data laporan valid dan siap dikirim. Ganti <code>URL_APPS_SCRIPT_ANDA</code> di <code>script.js</code> dengan URL Web App Google Apps Script Anda untuk menyimpan langsung ke Google Sheets.";
      feedback.classList.remove("hidden");
      form.reset();
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Mengirim ke Google Sheets...";

    try {
      const response = await fetch(URL_APPS_SCRIPT, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(dataLaporan)
      });

      const json = await response.json();

      if (json.status === "success") {
        feedback.className = "feedback-alert ok";
        feedback.textContent = "Laporan hoaks berhasil disimpan ke Google Sheets. Terima kasih!";
        feedback.classList.remove("hidden");
        form.reset();
      } else {
        throw new Error(json.message || "Gagal menyimpan laporan.");
      }
    } catch (err) {
      feedback.className = "feedback-alert err";
      feedback.textContent = `Gagal mengirim laporan: ${err.message}`;
      feedback.classList.remove("hidden");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Kirim Laporan Hoaks";
    }
  });
}
