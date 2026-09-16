import { EXAM_DATA } from "./data.js";
import { state, els } from "./state.js";
import { escapeHtml, visualTheme, copyText, unique } from "./utils.js";
import { listUsers } from "./auth.js";

export function initFilters() {
  unique(EXAM_DATA.map(x => x.class_grade)).forEach(v => els.classFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
  unique(EXAM_DATA.map(x => x.hour)).sort((a,b) => a-b).forEach(v => els.hourFilter.insertAdjacentHTML("beforeend", `<option value="${v}">Jam ke-${v}</option>`));
  unique(EXAM_DATA.map(x => x.subject)).sort((a,b) => a.localeCompare(b,"id")).forEach(v => els.subjectFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
  unique(EXAM_DATA.map(x => x.day)).forEach(v => els.dayFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
  unique(EXAM_DATA.map(x => x.time)).sort().forEach(v => els.timeFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
}

export function updateStats() {
  const data = state.filtered;
  els.statTotal.textContent = data.length;
  els.statClasses.textContent = new Set(data.map(x => x.class_grade)).size;
  els.statSubjects.textContent = new Set(data.map(x => x.subject)).size;
  els.statTokens.textContent = new Set(data.map(x => x.code)).size;
}

export function applyFilters() {
  const q = els.searchFilter.value.trim().toLowerCase();
  const cls = els.classFilter.value, hour = els.hourFilter.value;
  const subject = els.subjectFilter.value, type = els.typeFilter.value;
  const day = els.dayFilter.value, time = els.timeFilter.value;

  state.filtered = EXAM_DATA.filter(x => {
    const haystack = [x.subject,x.class_grade,x.type,x.day,x.date,x.time,x.code,x.title].join(" ").toLowerCase();
    return (!q || haystack.includes(q))
      && (!cls || x.class_grade === cls)
      && (!hour || String(x.hour) === hour)
      && (!subject || x.subject === subject)
      && (!type || x.type === type)
      && (!day || x.day === day)
      && (!time || x.time === time);
  });
  state.page = 1;
  updateStats();
  renderTable();
}

export function renderTable() {
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.page > pages) state.page = pages;
  const start = (state.page - 1) * state.pageSize;
  const end = Math.min(start + state.pageSize, total);
  const rows = state.filtered.slice(start, end);

  els.resultCount.textContent = total === EXAM_DATA.length
    ? `Menampilkan seluruh ${total} data`
    : `Menampilkan ${total} dari ${EXAM_DATA.length} data`;
  els.paginationInfo.textContent = total ? `Data ${start+1}–${end} dari ${total}` : "Tidak ada data";

  if (!rows.length) {
    els.tableBody.innerHTML = `<tr><td colspan="8"><div class="empty"><i class="fa-regular fa-folder-open"></i><div>Tidak ada data yang sesuai filter.</div></div></td></tr>`;
  } else {
    els.tableBody.innerHTML = rows.map((x,i) => `
      <tr style="${visualTheme(x)}">
        <td data-label="No"><span class="row-number">${start+i+1}</span></td>
        <td class="subject-cell" data-label="Ujian">
          <div class="subject-title">${escapeHtml(x.subject)}</div>
          <div class="subject-meta">
            <span class="badge badge-class"><i class="fa-solid fa-graduation-cap"></i> Kelas ${escapeHtml(x.class_grade)}</span>
            <span class="badge badge-type"><i class="fa-solid fa-list-check"></i> ${escapeHtml(x.type)}</span>
          </div>
        </td>
        <td class="date-cell" data-label="Hari / Tanggal">
          <div class="schedule"><i class="fa-regular fa-calendar-days" style="margin-right:5px"></i>${escapeHtml(x.day)}, ${escapeHtml(x.date)}</div>
          <div class="schedule-sub">Jadwal sumber: ${escapeHtml(x.day)}, ${escapeHtml(x.date)}</div>
        </td>
        <td data-label="Jam"><span class="badge badge-hour"><i class="fa-regular fa-clock"></i> Jam ke-${escapeHtml(x.hour)}</span></td>
        <td data-label="Waktu"><span class="badge badge-time"><i class="fa-solid fa-stopwatch"></i> ${escapeHtml(x.time)}</span></td>
        <td data-label="Token Ujian">
          <div class="token-cell">
            <span class="token-code">${escapeHtml(x.code)}</span>
            <button class="copy-btn" data-copy="${escapeHtml(x.code)}"><i class="fa-regular fa-copy"></i> Salin</button>
          </div>
        </td>
        <td data-label="Publish"><span class="publish ${String(x.publish_status).toUpperCase()==="YES"?"yes":"no"}">${escapeHtml(x.publish_status || "-")}</span></td>
        <td data-label="Aksi"><button class="copy-btn" data-detail="${escapeHtml(x.code)}"><i class="fa-regular fa-eye"></i> Detail</button></td>
      </tr>
    `).join("");
  }
  renderPagination(pages);
}

export function renderPagination(pages) {
  const controls = [];
  controls.push(`<button class="pg-btn" ${state.page===1?"disabled":""} data-page="${state.page-1}"><i class="fa-solid fa-chevron-left"></i></button>`);
  const visible = new Set([1,pages,state.page-1,state.page,state.page+1].filter(n=>n>=1&&n<=pages));
  const nums = [...visible].sort((a,b)=>a-b);
  let prev=0;
  nums.forEach(n=>{
    if(n-prev>1) controls.push(`<span style="padding:0 4px;color:#98a2b3">…</span>`);
    controls.push(`<button class="pg-btn ${n===state.page?"active":""}" data-page="${n}">${n}</button>`);
    prev=n;
  });
  controls.push(`<button class="pg-btn" ${state.page===pages?"disabled":""} data-page="${state.page+1}"><i class="fa-solid fa-chevron-right"></i></button>`);
  els.paginationControls.innerHTML = controls.join("");
}

export function showToast(message, success=true) {
  const node=document.createElement("div");
  node.className="toast";
  node.innerHTML=`<i class="fa-solid ${success?"fa-circle-check":"fa-circle-exclamation"}"></i> ${escapeHtml(message)}`;
  document.body.appendChild(node);
  setTimeout(()=>node.remove(),1800);
}

function formatDateHeader(day, date, hour) {
  return `${String(day || "").trim().toUpperCase()}, ${String(date || "").trim().toUpperCase()} JAM KE-${hour}`;
}

function buildFilteredTokenClipboardText(rows) {
  if (!rows.length) return "";

  // Kelompok berdasarkan hari + tanggal + jam ke.
  const groups = new Map();

  rows.forEach(x => {
    const key = [
      String(x.day || "").trim(),
      String(x.date || "").trim(),
      String(x.hour ?? "").trim()
    ].join("|");

    if (!groups.has(key)) {
      groups.set(key, {
        day: x.day,
        date: x.date,
        hour: x.hour,
        rows: []
      });
    }

    groups.get(key).rows.push(x);
  });

  // Pertahankan urutan kelompok sesuai urutan data hasil filter.
  return [...groups.values()].map(group => {
    const classes = new Map();

    group.rows.forEach(x => {
      const className = String(x.class_grade || "").trim();
      if (!classes.has(className)) classes.set(className, []);
      classes.get(className).push(x);
    });

    // X → XI → XII, lalu kelas lain bila suatu saat ditambahkan.
    const classOrder = ["X", "XI", "XII"];
    const orderedClasses = [
      ...classOrder.filter(cls => classes.has(cls)),
      ...[...classes.keys()].filter(cls => !classOrder.includes(cls))
    ];

    const lines = [
      formatDateHeader(group.day, group.date, group.hour)
    ];

    orderedClasses.forEach(cls => {
      lines.push("");
      lines.push(`Kelas ${cls}`);

      classes.get(cls).forEach(x => {
        lines.push(`${x.subject} (${x.type}) - ${x.code}`);
      });
    });

    return lines.join("\n");
  }).join("\n\n");
}

export function openCopyPreview() {
  const rows = state.filtered.filter(x => x && x.code);

  if (!rows.length) {
    showToast("Tidak ada token pada hasil filter.", false);
    return;
  }

  const clipboardText = buildFilteredTokenClipboardText(rows);

  els.copyPreviewText.value = clipboardText;
  els.copyPreviewMeta.textContent =
    `${rows.length} token • ${new Set(rows.map(x => `${x.day}|${x.date}|${x.hour}`)).size} kelompok jadwal`;

  els.copyPreviewBackdrop.classList.remove("hidden");

  // Fokus ke textarea agar desktop/mobile langsung siap digunakan.
  requestAnimationFrame(() => {
    els.copyPreviewText.focus();
    els.copyPreviewText.setSelectionRange(0, 0);
  });
}

export async function copyFromPreview() {
  const text = els.copyPreviewText.value;

  if (!text.trim()) {
    showToast("Tidak ada teks untuk disalin.", false);
    return;
  }

  const ok = await copyText(text);

  if (ok) {
    showToast("Seluruh hasil filter berhasil disalin.");
  } else {
    // Tetap pilih semua sehingga user hanya perlu Ctrl+C / Cmd+C.
    els.copyPreviewText.focus();
    els.copyPreviewText.select();
    showToast("Clipboard diblokir browser. Teks sudah dipilih, tekan Ctrl+C / Cmd+C.", false);
  }
}

export function selectPreviewText() {
  els.copyPreviewText.focus();
  els.copyPreviewText.select();
  showToast("Seluruh teks hasil filter sudah dipilih.");
}

export function openDetail(code) {
  const x=EXAM_DATA.find(v=>v.code===code);
  if(!x) return;
  els.modalBody.innerHTML=`
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Mata Pelajaran</div><div class="detail-value">${escapeHtml(x.subject)}</div></div>
      <div class="detail-item"><div class="detail-label">Kelas</div><div class="detail-value">Kelas ${escapeHtml(x.class_grade)}</div></div>
      <div class="detail-item"><div class="detail-label">Jenis Soal</div><div class="detail-value">${escapeHtml(x.type)}</div></div>
      <div class="detail-item"><div class="detail-label">Hari / Tanggal</div><div class="detail-value">${escapeHtml(x.day)}, ${escapeHtml(x.date)}</div></div>
      <div class="detail-item"><div class="detail-label">Jam Ke</div><div class="detail-value">Jam ke-${escapeHtml(x.hour)}</div></div>
      <div class="detail-item"><div class="detail-label">Waktu Ujian</div><div class="detail-value">${escapeHtml(x.time)}</div></div>
      <div class="detail-item"><div class="detail-label">Publish Status</div><div class="detail-value">${escapeHtml(x.publish_status || "-")}</div></div>
      <div class="detail-item"><div class="detail-label">Publish Date</div><div class="detail-value">${escapeHtml(x.publish_date || "-")}</div></div>
    </div>
    <div class="modal-token">
      <div class="modal-token-label">TOKEN / KODE UJIAN</div>
      <div class="modal-token-row">
        <div class="modal-token-code">${escapeHtml(x.code)}</div>
        <button class="copy-btn" id="modalCopy"><i class="fa-regular fa-copy"></i> Salin Token</button>
      </div>
      <div class="note">Nilai token diambil dari field <b>Kode / data-code</b> pada HTML sumber yang Anda berikan.</div>
    </div>`;
  document.getElementById("modalCopy").addEventListener("click", async ()=>{
    const ok=await copyText(x.code); showToast(ok?"Token berhasil disalin":"Gagal menyalin token",ok);
  });
  els.modalBackdrop.classList.remove("hidden");
}

export function openAccountModal() {
  els.accountForm.reset();
  els.accountError.classList.add("hidden");
  renderUserList();
  els.accountBackdrop.classList.remove("hidden");
}

export function renderUserList() {
  els.accountUserList.innerHTML = listUsers().map(u =>
    `<span class="account-chip"><i class="fa-regular fa-user"></i>${escapeHtml(u)}</span>`
  ).join("");
}
