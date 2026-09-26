/**
 * GRID.id — Investment Readiness Gate
 * Single-page app with localStorage persistence
 */

const state = {
  currentStep: 1,
  userName: '',
  financial: {
    income: 0,
    expenses: 0,
    savings: 0,
    emergency: 0,
    debt: 0,
    debtInterest: 0
  },
  riskAnswers: {},
  fomoAnswers: {},
  literacyAnswers: {},
  lastResult: null
};

const STORAGE_KEY = 'grid_history';
const STORAGE_LAST = 'grid_last_result';

const riskQuestions = [
  {
    id: 'r1',
    question: 'Jika nilai investasi kamu turun 20% dalam sebulan, apa yang paling mungkin kamu lakukan?',
    options: [
      { value: 1, text: 'Langsung jual semua agar tidak rugi lebih banyak' },
      { value: 2, text: 'Khawatir, tapi menunggu sebentar sebelum memutuskan' },
      { value: 3, text: 'Tetap berpegang pada rencana jangka panjang' },
      { value: 4, text: 'Mungkin menambah investasi karena harga lebih murah' }
    ]
  },
  {
    id: 'r2',
    question: 'Jangka waktu investasi yang paling nyaman untukmu saat ini?',
    options: [
      { value: 1, text: 'Kurang dari 1 tahun (butuh dana segera)' },
      { value: 2, text: '1–3 tahun' },
      { value: 3, text: '3–7 tahun' },
      { value: 4, text: 'Lebih dari 7 tahun' }
    ]
  },
  {
    id: 'r3',
    question: 'Seberapa penting keamanan modal dibanding potensi keuntungan tinggi?',
    options: [
      { value: 1, text: 'Sangat penting — modal tidak boleh berkurang sama sekali' },
      { value: 2, text: 'Penting — keuntungan sedang sudah cukup asal stabil' },
      { value: 3, text: 'Seimbang — siap fluktuasi untuk keuntungan lebih baik' },
      { value: 4, text: 'Keuntungan tinggi lebih prioritas, fluktuasi bisa ditoleransi' }
    ]
  },
  {
    id: 'r4',
    question: 'Pengalaman investasi sebelumnya?',
    options: [
      { value: 1, text: 'Belum pernah sama sekali' },
      { value: 2, text: 'Pernah coba reksa dana / deposito / emas' },
      { value: 3, text: 'Sudah punya portofolio saham / crypto / properti' },
      { value: 4, text: 'Aktif mengelola portofolio dan memahami diversifikasi' }
    ]
  }
];

const literacyQuestions = [
  {
    id: 'l1',
    question: 'Apa yang dimaksud dengan diversifikasi dalam investasi?',
    options: [
      { value: 0, text: 'Membeli sebanyak mungkin saham dari satu perusahaan' },
      { value: 1, text: 'Menyebar investasi ke berbagai aset/instrumen untuk mengurangi risiko' },
      { value: 0, text: 'Menjual semua aset saat harga naik' },
      { value: 0, text: 'Hanya berinvestasi di aset yang sedang viral' }
    ],
    correct: 1
  },
  {
    id: 'l2',
    question: 'Dana darurat idealnya berapa bulan pengeluaran?',
    options: [
      { value: 0, text: '1 bulan saja sudah cukup' },
      { value: 1, text: '3–6 bulan (atau lebih jika pendapatan tidak stabil)' },
      { value: 0, text: 'Tidak perlu, karena bisa pinjam kapan saja' },
      { value: 0, text: '12 bulan wajib untuk semua orang' }
    ],
    correct: 1
  },
  {
    id: 'l3',
    question: 'Jika kamu punya utang berbunga tinggi (misalnya kartu kredit 2%/bulan), prioritas terbaik adalah…',
    options: [
      { value: 0, text: 'Tetap investasi dulu karena keuntungannya bisa lebih tinggi' },
      { value: 1, text: 'Lunasi utang berbunga tinggi terlebih dahulu' },
      { value: 0, text: 'Abaikan utang dan fokus cari cuan di crypto' },
      { value: 0, text: 'Pinjam lagi untuk menutup utang lama' }
    ],
    correct: 1
  },
  {
    id: 'l4',
    question: 'Keuntungan tinggi selalu berarti…',
    options: [
      { value: 0, text: 'Investasi yang aman dan cocok untuk semua orang' },
      { value: 1, text: 'Risiko yang juga lebih tinggi (tidak ada free lunch)' },
      { value: 0, text: 'Dijamin oleh pemerintah' },
      { value: 0, text: 'Cocok untuk dana darurat' }
    ],
    correct: 1
  },
  {
    id: 'l5',
    question: 'FOMO dalam investasi paling berbahaya karena…',
    options: [
      { value: 0, text: 'Membuat kita terlalu hati-hati' },
      { value: 1, text: 'Mendorong keputusan emosional tanpa mempertimbangkan kondisi finansial pribadi' },
      { value: 0, text: 'Hanya terjadi pada investor pemula' },
      { value: 0, text: 'Tidak berdampak pada hasil investasi' }
    ],
    correct: 1
  }
];

const fomoQuestions = [
  { id: 'f1', text: 'Saya merasa cemas kalau teman-teman saya untung besar dari investasi sementara saya tidak ikut serta.' },
  { id: 'f2', text: 'Saya sering mengecek media sosial untuk melihat apa yang sedang ramai dibicarakan soal investasi.' },
  { id: 'f3', text: 'Saya khawatir ketinggalan peluang investasi yang sedang viral.' },
  { id: 'f4', text: 'Saat melihat orang lain pamer keuntungan investasi, saya ingin segera ikut membeli aset yang sama.' },
  { id: 'f5', text: 'Saya cenderung memutuskan investasi lebih cepat ketika banyak orang di sekitar saya sedang membicarakannya.' }
];

const LIKERT_LABELS = [
  { value: 1, label: 'Sangat Tidak Sesuai' },
  { value: 2, label: 'Tidak Sesuai' },
  { value: 3, label: 'Sesuai' },
  { value: 4, label: 'Sangat Sesuai' }
];

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  document.getElementById('navLinks').classList.remove('open');
  if (pageId === 'dashboard') renderDashboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startAssessment() {
  state.currentStep = 1;
  state.userName = '';
  state.riskAnswers = {};
  state.fomoAnswers = {};
  state.literacyAnswers = {};
  showPage('assessment');
  showStep(1);
  renderRiskQuiz();
  renderFomoQuiz();
  renderLiteracyQuiz();
}

function showStep(step) {
  state.currentStep = step;
  document.querySelectorAll('.assessment-step').forEach(el => el.classList.add('hidden'));
  const el = document.getElementById('step-' + step);
  if (el) el.classList.remove('hidden');

  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = (step * 25) + '%';

  document.querySelectorAll('.progress-steps .step').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (sNum === step) s.classList.add('active');
    else if (sNum < step) s.classList.add('done');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(from) {
  if (from === 1) {
    if (!validateFinancialForm()) return;
    collectFinancialData();
  }
  if (from === 2) {
    if (!validateQuiz(state.riskAnswers, riskQuestions.length)) {
      alert('Mohon jawab semua pertanyaan gaya berinvestasi.');
      return;
    }
  }
  showStep(from + 1);
}

function prevStep(from) {
  showStep(from - 1);
}

function validateFinancialForm() {
  const name = document.getElementById('userName').value.trim();
  const income = document.getElementById('income').value;
  const expenses = document.getElementById('expenses').value;
  const savings = document.getElementById('savings').value;
  const emergency = document.getElementById('emergency').value;
  
  if (!name || !income || !expenses || !savings || emergency === '') {
    alert('Mohon lengkapi semua field wajib, termasuk Nama Responden.');
    return false;
  }
  return true;
}

function collectFinancialData() {
  state.userName = document.getElementById('userName').value.trim();
  state.financial = {
    income: Number(document.getElementById('income').value) || 0,
    expenses: Number(document.getElementById('expenses').value) || 0,
    savings: Number(document.getElementById('savings').value) || 0,
    emergency: Number(document.getElementById('emergency').value) || 0,
    debt: Number(document.getElementById('debt').value) || 0,
    debtInterest: Number(document.getElementById('debtInterest').value) || 0
  };
}

function validateQuiz(answers, total) {
  return Object.keys(answers).length >= total;
}

function renderRiskQuiz() {
  const container = document.getElementById('riskQuiz');
  container.innerHTML = riskQuestions.map((q, idx) => `
    <div class="quiz-item" data-qid="${q.id}">
      <h4>${idx + 1}. ${q.question}</h4>
      <div class="quiz-options">
        ${q.options.map(opt => `
          <label class="quiz-option" data-qid="${q.id}" data-value="${opt.value}">
            <input type="radio" name="${q.id}" value="${opt.value}" />
            <span class="radio-mark"></span>
            <span>${opt.text}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const qid = opt.dataset.qid;
      const value = Number(opt.dataset.value);
      state.riskAnswers[qid] = value;
      container.querySelectorAll(`.quiz-option[data-qid="${qid}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function renderFomoQuiz() {
  const container = document.getElementById('fomoQuiz');
  if (!container) return;

  container.innerHTML = fomoQuestions.map((q, idx) => `
    <div class="likert-item" data-qid="${q.id}">
      <h4>${idx + 1}. ${q.text}</h4>
      <div class="likert-scale">
        ${LIKERT_LABELS.map(opt => `
          <label class="likert-option" data-qid="${q.id}" data-value="${opt.value}">
            <input type="radio" name="${q.id}" value="${opt.value}" />
            <span class="likert-num">${opt.value}</span>
            <span>${opt.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.likert-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const qid = opt.dataset.qid;
      const value = Number(opt.dataset.value);
      state.fomoAnswers[qid] = value;
      container.querySelectorAll(`.likert-option[data-qid="${qid}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function renderLiteracyQuiz() {
  const container = document.getElementById('literacyQuiz');
  container.innerHTML = literacyQuestions.map((q, idx) => `
    <div class="quiz-item" data-qid="${q.id}">
      <h4>${idx + 1}. ${q.question}</h4>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <label class="quiz-option" data-qid="${q.id}" data-value="${opt.value}" data-idx="${i}">
            <input type="radio" name="${q.id}" value="${i}" />
            <span class="radio-mark"></span>
            <span>${opt.text}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const qid = opt.dataset.qid;
      const idx = Number(opt.dataset.idx);
      const value = Number(opt.dataset.value);
      state.literacyAnswers[qid] = { idx, value };
      container.querySelectorAll(`.quiz-option[data-qid="${qid}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function calculateReadinessScore() {
  const f = state.financial;
  const scores = {};

  let cashFlowScore = 0;
  if (f.income > 0) {
    const surplusRatio = (f.income - f.expenses) / f.income;
    if (surplusRatio >= 0.3) cashFlowScore = 25;
    else if (surplusRatio >= 0.2) cashFlowScore = 20;
    else if (surplusRatio >= 0.1) cashFlowScore = 15;
    else if (surplusRatio >= 0) cashFlowScore = 8;
    else cashFlowScore = Math.max(0, 5 + surplusRatio * 20);
  }
  scores.cashFlow = Math.round(Math.min(25, Math.max(0, cashFlowScore)));

  let emergencyScore = 0;
  if (f.expenses > 0) {
    const months = f.emergency / f.expenses;
    if (months >= 6) emergencyScore = 25;
    else if (months >= 4) emergencyScore = 22;
    else if (months >= 3) emergencyScore = 18;
    else if (months >= 2) emergencyScore = 12;
    else if (months >= 1) emergencyScore = 7;
    else emergencyScore = Math.round(months * 7);
  } else {
    emergencyScore = f.emergency > 0 ? 15 : 0;
  }
  scores.emergency = Math.round(Math.min(25, Math.max(0, emergencyScore)));

  let debtScore = 20;
  if (f.income > 0 && f.debt > 0) {
    const debtToIncome = f.debt / (f.income * 12);
    if (debtToIncome > 0.5) debtScore = 4;
    else if (debtToIncome > 0.3) debtScore = 8;
    else if (debtToIncome > 0.15) debtScore = 12;
    else if (debtToIncome > 0.05) debtScore = 16;
    else debtScore = 18;
    
    if (f.debtInterest >= 20) debtScore = Math.max(0, debtScore - 8);
    else if (f.debtInterest >= 12) debtScore = Math.max(0, debtScore - 4);
  } else if (f.debt === 0) {
    debtScore = 20;
  }
  scores.debt = Math.round(Math.min(20, Math.max(0, debtScore)));

  const riskValues = Object.values(state.riskAnswers);
  let riskScore = 0;
  if (riskValues.length > 0) {
    const avg = riskValues.reduce((a, b) => a + b, 0) / riskValues.length;
    riskScore = ((avg - 1) / 3) * 15;
    if (avg >= 3.2 && (scores.emergency < 12 || scores.cashFlow < 10)) {
      riskScore *= 0.7;
    }
  }
  scores.risk = Math.round(Math.min(15, Math.max(0, riskScore)));

  const litEntries = Object.values(state.literacyAnswers);
  let objectivePct = 0;
  if (litEntries.length > 0) {
    const correctCount = litEntries.filter(e => e.value === 1).length;
    objectivePct = correctCount / literacyQuestions.length;
  }

  const fomoValues = Object.values(state.fomoAnswers);
  let fomoAvg = 2.5; 
  if (fomoValues.length > 0) {
    fomoAvg = fomoValues.reduce((a, b) => a + b, 0) / fomoValues.length;
  }
  
  const attitudePct = (4 - fomoAvg) / 3;
  let litScore = (0.6 * objectivePct + 0.4 * attitudePct) * 15;

  let consistencyFlag = false;
  let consistencyNote = '';
  if (objectivePct >= 0.8 && fomoAvg >= 3.2) {
    consistencyFlag = true;
    litScore *= 0.75;
    consistencyNote = 'Terdeteksi ketidakkonsistenan: pemahaman objektif tinggi, namun sikap masih sangat terpengaruh tren/FOMO. Skor literasi disesuaikan.';
  } else if (objectivePct <= 0.2 && fomoAvg <= 1.8 && fomoValues.length > 0) {
    consistencyFlag = true;
    litScore *= 0.85;
    consistencyNote = 'Terdeteksi pola jawaban yang kurang selaras antara pemahaman dan sikap. Skor literasi disesuaikan agar lebih transparan.';
  }

  if (fomoAvg >= 3.2) {
    scores.risk = Math.round(Math.max(0, scores.risk * 0.85));
  }

  scores.literacy = Math.round(Math.min(15, Math.max(0, litScore)));
  scores.fomoAvg = Math.round(fomoAvg * 10) / 10;
  scores.objectivePct = Math.round(objectivePct * 100);
  scores.consistencyFlag = consistencyFlag;
  scores.consistencyNote = consistencyNote;

  const total = scores.cashFlow + scores.emergency + scores.debt + scores.risk + scores.literacy;

  let phase, phaseClass;
  if (total < 40) {
    phase = 'Belum Siap';
    phaseClass = 'phase-belum';
  } else if (total < 70) {
    phase = 'Mulai Bersiap';
    phaseClass = 'phase-mulai';
  } else {
    phase = 'Siap Berinvestasi';
    phaseClass = 'phase-siap';
  }

  return {
    name: state.userName,
    total: Math.round(total),
    scores,
    phase,
    phaseClass,
    financial: { ...f },
    timestamp: new Date().toISOString()
  };
}

function getRecommendations(result) {
  const recs = [];
  const s = result.scores;
  const f = result.financial;

  if (s.fomoAvg >= 3.2) {
    recs.push('Indikator FOMO kamu cukup tinggi. Latih kebiasaan: tunda keputusan investasi 24–48 jam, dan tanyakan “ini sesuai tujuan & kondisi saya, atau hanya karena orang lain sedang untung?”');
  }

  if (result.phase === 'Belum Siap') {
    recs.push('Prioritaskan membangun surplus bulanan: review pengeluaran dan cari cara menambah pemasukan jika memungkinkan.');
    if (s.emergency < 12) {
      const target = f.expenses * 3;
      recs.push(`Fokus kumpulkan dana darurat minimal 3 bulan pengeluaran (target sekitar Rp ${formatNumber(target)}). Simpan di instrumen likuid & aman.`);
    }
    if (f.debt > 0 && f.debtInterest >= 12) {
      recs.push('Lunasi utang berbunga tinggi terlebih dahulu sebelum memikirkan investasi. Bunga utang sering lebih besar dari keuntungan investasi.');
    }
    if (s.literacy < 10) {
      recs.push('Tingkatkan literasi dasar: pelajari konsep risiko, diversifikasi, dan bedakan edukasi vs promosi di media sosial.');
    }
    recs.push('Hindari keputusan investasi yang didorong FOMO atau rekomendasi influencer sebelum fondasi finansial stabil.');
  } else if (result.phase === 'Mulai Bersiap') {
    if (s.emergency < 18) {
      const target = f.expenses * 6;
      recs.push(`Perkuat dana darurat menuju 4–6 bulan pengeluaran (target ideal ~Rp ${formatNumber(target)}).`);
    }
    if (s.cashFlow < 18) {
      recs.push('Tingkatkan rasio tabungan bulanan (idealnya ≥20% dari penghasilan) agar ada ruang untuk investasi rutin.');
    }
    if (f.debt > 0) {
      recs.push('Susun rencana pelunasan sisa utang. Setelah utang berbunga tinggi lunas, alokasi bisa dialihkan ke investasi.');
    }
    if (s.literacy < 12) {
      recs.push('Lanjutkan belajar: pahami perbedaan instrumen (reksa dana, obligasi, saham) dan cocokkan dengan jangka waktu investasimu.');
    }
    recs.push('Mulai kecil dengan instrumen berisiko rendah (misalnya reksa dana pasar uang atau obligasi) sambil membangun kebiasaan investasi rutin — bukan mengejar tren.');
  } else {
    recs.push('Fondasi finansialmu sudah baik. Tetap jaga dana darurat dan hindari over-leverage.');
    recs.push('Susun tujuan investasi yang jelas (jangka waktu + target) sebelum memilih instrumen.');
    recs.push('Diversifikasi sesuai kenyamanan risiko kamu. Jangan menempatkan semua dana di satu aset hanya karena sedang "hot".');
    recs.push('Review portofolio secara berkala (misalnya tiap 6–12 bulan), bukan setiap hari mengikuti noise pasar.');
    if (s.literacy < 13) {
      recs.push('Vertikalkan literasi: pelajari alokasi aset, biaya produk, dan dampak inflasi jangka panjang.');
    }
  }

  return recs;
}

function getReasonText(result) {
  const parts = [];
  const s = result.scores;

  if (s.cashFlow >= 18) parts.push('arus kas bulanan relatif sehat');
  else if (s.cashFlow >= 10) parts.push('arus kas masih bisa diperbaiki');
  else parts.push('arus kas masih ketat atau defisit');

  if (s.emergency >= 18) parts.push('dana darurat sudah memadai');
  else if (s.emergency >= 10) parts.push('dana darurat mulai terbentuk tapi belum ideal');
  else parts.push('dana darurat masih sangat minim');

  if (s.debt >= 16) parts.push('beban utang terkelola dengan baik');
  else if (s.debt >= 10) parts.push('masih ada utang yang perlu diperhatikan');
  else parts.push('beban utang relatif tinggi dan menjadi prioritas');

  if (s.risk >= 10) parts.push('gaya berinvestasi cukup selaras');
  else parts.push('gaya berinvestasi perlu diselaraskan dengan kondisi aktual');

  if (s.literacy >= 12) parts.push('literasi dasar sudah baik');
  else if (s.literacy >= 7) parts.push('literasi dasar masih perlu diperkuat');
  else parts.push('pemahaman dasar investasi masih terbatas');

  return `Skor mencerminkan bahwa ${parts.join('; ')}. Fase "${result.phase}" menunjukkan langkah konkret yang paling relevan untuk kondisi saat ini — bukan penilaian keberhasilan atau kegagalan.`;
}

function calculateAndShowResult() {
  if (!validateQuiz(state.fomoAnswers, fomoQuestions.length)) {
    alert('Mohon lengkapi semua pernyataan sikap (Bagian A).');
    return;
  }
  if (!validateQuiz(state.literacyAnswers, literacyQuestions.length)) {
    alert('Mohon jawab semua pertanyaan pemahaman dasar (Bagian B).');
    return;
  }

  const result = calculateReadinessScore();
  state.lastResult = result;
  showStep(4);
  renderResult(result);
}

function renderResult(result) {
  const container = document.getElementById('resultContent');
  const recs = getRecommendations(result);
  const reason = getReasonText(result);
  const maxScores = { cashFlow: 25, emergency: 25, debt: 20, risk: 15, literacy: 15 };
  const labels = {
    cashFlow: 'Arus Kas',
    emergency: 'Dana Darurat',
    debt: 'Beban Utang',
    risk: 'Gaya Berinvestasi',
    literacy: 'Literasi & Sikap'
  };

  const s = result.scores;
  const fomoLabel = s.fomoAvg <= 1.8 ? 'Rendah' : s.fomoAvg <= 2.8 ? 'Sedang' : 'Tinggi';
  const consistencyHtml = s.consistencyFlag
    ? `<div class="consistency-note">${s.consistencyNote}</div>`
    : '';

  container.innerHTML = `
    <div class="result-header">
      <h3 style="color: var(--primary-light); margin-bottom: 1.5rem; font-weight: normal;">Hasil Evaluasi: <strong>${result.name}</strong></h3>
      <div class="result-score-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" class="ring-bg" />
          <circle cx="60" cy="60" r="54" class="ring-progress" style="--progress: ${result.total}" />
        </svg>
        <div class="result-score-value">${result.total}</div>
      </div>
      <div class="result-phase ${result.phaseClass}">${result.phase}</div>
      <p class="result-summary">Skor Kesiapan Investasi</p>
    </div>
    <div class="reason-box">${reason}</div>
    ${consistencyHtml}
    <div class="result-breakdown">
      ${Object.keys(labels).map(key => `
        <div class="breakdown-item">
          <span class="breakdown-label">${labels[key]}</span>
          <div class="breakdown-bar">
            <div class="breakdown-bar-fill" style="width: ${(result.scores[key] / maxScores[key]) * 100}%"></div>
          </div>
          <span class="breakdown-score">${result.scores[key]}/${maxScores[key]}</span>
        </div>
      `).join('')}
      <div class="breakdown-item">
        <span class="breakdown-label">Indikator FOMO (sikap)</span>
        <span class="breakdown-score" style="color:var(--text-soft)">${s.fomoAvg}/4 · ${fomoLabel}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Soal objektif benar</span>
        <span class="breakdown-score" style="color:var(--text-soft)">${s.objectivePct}%</span>
      </div>
    </div>
    <div class="recommendations">
      <h3>Langkah Konkret Selanjutnya</h3>
      <ol>${recs.map(r => `<li>${r}</li>`).join('')}</ol>
    </div>
    <p style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-top:1rem;">
      Ini bukan rekomendasi produk investasi. Fokus pada perbaikan fondasi dulu.
    </p>
  `;
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory() {
  if (!state.lastResult) return;
  const history = getHistory();
  history.push({ ...state.lastResult, id: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  localStorage.setItem(STORAGE_LAST, JSON.stringify(state.lastResult));
  alert(`Hasil evaluasi untuk ${state.lastResult.name} berhasil disimpan ke Dashboard.`);
  showPage('dashboard');
}

function clearHistory() {
  if (confirm('Hapus semua riwayat data responden? Tindakan ini tidak bisa dibatalkan.')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_LAST);
    renderDashboard();
  }
}

function renderDashboard() {
  const history = getHistory();
  const empty = document.getElementById('dashboardEmpty');
  const content = document.getElementById('dashboardContent');

  if (history.length === 0) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  content.classList.remove('hidden');

  const last = history[history.length - 1];

  document.getElementById('lastScore').textContent = last.total;
  document.getElementById('lastPhase').textContent = last.phase;
  document.getElementById('evalCount').textContent = history.length;

  const list = document.getElementById('historyItems');
  list.innerHTML = history.slice().reverse().map(item => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="history-item">
        <div>
          <div class="history-name">${item.name || 'Responden Anonim'}</div>
          <div class="history-date">${dateStr}</div>
          <span class="phase-badge ${item.phaseClass}">${item.phase}</span>
        </div>
        <div class="history-score" style="color:var(--primary-light)">${item.total}</div>
      </div>
    `;
  }).join('');

  drawScoreChart(history);
}

function drawScoreChart(history) {
  const canvas = document.getElementById('scoreChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 240 * dpr; 
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = 240;

  ctx.clearRect(0, 0, w, h);
  if (history.length === 0) return;

  const padding = { top: 20, right: 20, bottom: 45, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const scores = history.map(h => h.total);

  let minVal = Math.min(...scores);
  let maxVal = Math.max(...scores);
  
  if (maxVal === minVal) {
    minVal = Math.max(0, minVal - 10);
    maxVal = Math.min(100, maxVal + 10);
  } else if (maxVal - minVal < 20) {
    let mid = (maxVal + minVal) / 2;
    minVal = Math.max(0, mid - 10);
    maxVal = Math.min(100, mid + 10);
  } else {
    minVal = Math.max(0, minVal - 10);
    maxVal = Math.min(100, maxVal + 10);
  }

  ctx.strokeStyle = '#2d3a4f';
  ctx.lineWidth = 1;
  const gridCount = 4;
  
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (chartH / gridCount) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
    
    ctx.fillStyle = '#8b9cb3';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    const val = maxVal - (maxVal - minVal) * (i / gridCount);
    ctx.fillText(Math.round(val), padding.left - 8, y + 4);
  }

  const getY = (s) => padding.top + chartH - ((s - minVal) / (maxVal - minVal)) * chartH;

  if (scores.length === 1) {
    const x = padding.left + chartW / 2;
    const y = getY(scores[0]);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a8b8cc';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    const shortName = history[0].name ? history[0].name.split(' ')[0] : 'R-1';
    ctx.fillText(shortName, x, padding.top + chartH + 20);
  } else {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    scores.forEach((s, i) => {
      const x = padding.left + (i / (scores.length - 1)) * chartW;
      const y = getY(s);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    scores.forEach((s, i) => {
      const x = padding.left + (i / (scores.length - 1)) * chartW;
      const y = getY(s);
      
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a8b8cc';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const shortName = history[i].name ? history[i].name.split(' ')[0] : `R-${i+1}`;
      ctx.fillText(shortName, x, padding.top + chartH + 20);
    });
  }
}

function restartAssessment() {
  startAssessment();
  document.getElementById('form-financial').reset();
}

function formatNumber(n) {
  return new Intl.NumberFormat('id-ID').format(Math.round(n));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  showPage('home');
});