
const DATA = Array.isArray(window.CBT_DATA) ? window.CBT_DATA : [];
const CONFIG = window.CBT_CONFIG || {};
const USERS = CONFIG.users || {};

const state = {
  page: 1,
  pageSize: 15,
  selected: new Set(),
  filtered: [],
  initialized: false
};

const $ = id => document.getElementById(id);
const normalize = value => String(value ?? "").trim();

function esc(value){
  return normalize(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function icon(name){
  const paths = {
    copy:'<rect x="9" y="9" width="10" height="10" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    refresh:'<path d="M20 11a8 8 0 0 0-14-5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 5l2-2"/><path d="M20 20v-4h-4"/>',
    login:'<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-5"/>',
    logout:'<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
}

function hydrateIcons(){
  document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon));
}

function parseExamTime(raw){
  raw = normalize(raw).replace(/\s+/g," ");
  const dayMatch = raw.match(/^(.+?),\s*(?:tanggal\s*)?(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})\s+Jam\s*ke[-\s]*(\d+)/i);
  const fallbackJam = raw.match(/Jam\s*ke[-\s]*(\d+)/i);
  const timeMatch = raw.match(/\(\s*(\d{1,2}[.:]\d{2})\s*-\s*(\d{1,2}[.:]\d{2})\s*\)/i);

  const months = {
    januari:"01", februari:"02", maret:"03", april:"04", mei:"05", juni:"06",
    juli:"07", agustus:"08", september:"09", oktober:"10", november:"11", desember:"12"
  };

  let day = "";
  let jam = "";
  let date = "";

  if(dayMatch){
    day = dayMatch[1].trim();
    jam = dayMatch[5].trim();
    const month = months[dayMatch[3].toLowerCase()];
    if(month){
      date = `${dayMatch[4]}-${month}-${String(dayMatch[2]).padStart(2,"0")}`;
    }
  } else {
    const comma = raw.match(/^([^,]+),/);
    day = comma ? comma[1].trim() : "";
    jam = fallbackJam ? fallbackJam[1].trim() : "";
  }

  const normalizeTime = value => value ? value.replace(".",":") : "";
  return {
    day,
    jam,
    start: timeMatch ? normalizeTime(timeMatch[1]) : "",
    end: timeMatch ? normalizeTime(timeMatch[2]) : "",
    date
  };
}

function examInfo(row){
  return {...row, parsed: parseExamTime(row.waktuUjian)};
}

function validateData(){
  const expected = CONFIG.datasetExpected || {};
  const errors = [];
  if(DATA.length !== expected.total) errors.push(`Total data ${DATA.length}; seharusnya ${expected.total}.`);
  if(new Set(DATA.map(x=>x.kode)).size !== DATA.length) errors.push("Token/kode tidak unik.");
  for(const [k,v] of Object.entries(expected.kelas || {})){
    const actual = DATA.filter(x=>x.kelas === k).length;
    if(actual !== v) errors.push(`Kelas ${k}: ${actual}; seharusnya ${v}.`);
  }
  for(const [k,v] of Object.entries(expected.jenis || {})){
    const actual = DATA.filter(x=>x.jenis === k).length;
    if(actual !== v) errors.push(`${k}: ${actual}; seharusnya ${v}.`);
  }
  return errors;
}

function fillSelect(id, values){
  const select = $(id);
  const placeholder = select.options[0]?.cloneNode(true);
  select.innerHTML = "";
  if(placeholder) select.appendChild(placeholder);

  values.forEach(value=>{
    const o = document.createElement("option");
    o.value = value;
    o.textContent = value;
    select.appendChild(o);
  });
}

function initFilters(){
  const rows = DATA.map(examInfo);

  const uniqueSorted = (values, numeric=false) => {
    const clean = [...new Set(values.map(normalize).filter(Boolean))];
    return clean.sort((a,b) => numeric
      ? Number(a) - Number(b)
      : a.localeCompare(b,"id",{numeric:true,sensitivity:"base"})
    );
  };

  fillSelect("classFilter", uniqueSorted(rows.map(x=>x.kelas)));
  fillSelect("jamFilter", uniqueSorted(rows.map(x=>x.parsed.jam), true));
  fillSelect("mapelFilter", uniqueSorted(rows.map(x=>x.nama)));
  fillSelect("dayFilter", uniqueSorted(rows.map(x=>x.parsed.day)));
  fillSelect(
    "timeFilter",
    uniqueSorted(rows.map(x => x.parsed.start && x.parsed.end
      ? `${x.parsed.start} - ${x.parsed.end}` : ""))
  );
  fillSelect("dateFilter", uniqueSorted(rows.map(x=>x.parsed.date)));

  // Diagnostic count for the UI/debugging console.
  console.info("[CBT] Filter data:", {
    hari: uniqueSorted(rows.map(x=>x.parsed.day)),
    jam: uniqueSorted(rows.map(x=>x.parsed.jam), true),
    waktu: uniqueSorted(rows.map(x=>x.parsed.start && x.parsed.end
      ? `${x.parsed.start} - ${x.parsed.end}` : ""))
  });
}

function filteredRows(){
  const q = normalize($("search").value).toLowerCase();
  const filters = {
    kelas:$("classFilter").value, jam:$("jamFilter").value, mapel:$("mapelFilter").value,
    jenis:$("typeFilter").value, hari:$("dayFilter").value, waktu:$("timeFilter").value, tanggal:$("dateFilter").value
  };
  return DATA.map(examInfo).filter(x=>{
    const hay = `${x.kode} ${x.nama} ${x.deskripsi} ${x.kelas} ${x.jenis} ${x.waktuUjian}`.toLowerCase();
    const time = x.parsed.start && x.parsed.end ? `${x.parsed.start} - ${x.parsed.end}` : "";
    return (!q || hay.includes(q))
      && (!filters.kelas || x.kelas === filters.kelas)
      && (!filters.jam || x.parsed.jam === filters.jam)
      && (!filters.mapel || x.nama === filters.mapel)
      && (!filters.jenis || x.jenis === filters.jenis)
      && (!filters.hari || x.parsed.day === filters.hari)
      && (!filters.waktu || time === filters.waktu)
      && (!filters.tanggal || x.parsed.date === filters.tanggal);
  });
}

function renderStats(){
  const stats = [
    ["Total Data",DATA.length,"seluruh ruang"],
    ["Kelas X",DATA.filter(x=>x.kelas==="X").length,"ruang"],
    ["Kelas XI",DATA.filter(x=>x.kelas==="XI").length,"ruang"],
    ["Kelas XII",DATA.filter(x=>x.kelas==="XII").length,"ruang"],
    ["PG / Essay",`${DATA.filter(x=>x.jenis==="PG").length} / ${DATA.filter(x=>x.jenis==="ESSAY").length}`,"jenis soal"]
  ];
  $("stats").innerHTML = stats.map(s=>`<div class="stat"><div class="stat-label">${esc(s[0])}</div><div class="stat-value">${esc(s[1])}</div><div class="stat-note">${esc(s[2])}</div></div>`).join("");
}

function tag(value,type){
  return `<span class="tag tag-${type}-${String(value).toLowerCase()}">${esc(value)}</span>`;
}

function render(){
  state.filtered = filteredRows();
  const maxPage = Math.max(1,Math.ceil(state.filtered.length/state.pageSize));
  state.page = Math.min(state.page,maxPage);
  const start = (state.page-1)*state.pageSize;
  const rows = state.filtered.slice(start,start+state.pageSize);

  $("resultCount").textContent = `Menampilkan ${state.filtered.length} dari ${DATA.length}`;
  $("tbody").innerHTML = rows.map((x,i)=>{
    const p=x.parsed;
    const checked=state.selected.has(x.no) ? "checked" : "";
    return `<tr>
      <td class="check-col"><input type="checkbox" class="row-check" data-no="${x.no}" ${checked}></td>
      <td>${start+i+1}</td>
      <td><div class="subject">${esc(x.nama)}</div><div class="meta">${esc(x.deskripsi)}</div></td>
      <td><span class="tag tag-${x.kelas.toLowerCase()}">${esc(x.kelas)}</span></td>
      <td><span class="tag tag-${x.jenis.toLowerCase()}">${esc(x.jenis)}</span></td>
      <td><div>${esc(p.day)}, Jam ke-${esc(p.jam)}</div><div class="meta">${esc(p.date)}</div></td>
      <td>${esc(x.waktuUjian)}</td>
      <td><span class="token">${esc(x.kode)}</span></td>
      <td><button class="btn btn-light copy-one" data-copy="${esc(x.kode)}"><span class="ico" data-icon="copy"></span> Salin</button></td>
    </tr>`;
  }).join("");

  $("empty").classList.toggle("hidden", state.filtered.length !== 0);
  $("pageInfo").textContent = state.filtered.length ? `${start+1}–${Math.min(start+state.pageSize,state.filtered.length)} dari ${state.filtered.length}` : "0 data";
  $("pageNumber").textContent = `${state.page} / ${maxPage}`;
  $("prevPage").disabled = state.page <= 1;
  $("nextPage").disabled = state.page >= maxPage;

  const selectedVisible = state.filtered.filter(x=>state.selected.has(x.no));
  $("selectedCount").textContent = `${state.selected.size} dipilih`;
  $("selectAll").checked = state.filtered.length > 0 && selectedVisible.length === state.filtered.length;
  $("selectAll").indeterminate = selectedVisible.length > 0 && selectedVisible.length < state.filtered.length;
  hydrateIcons();
}

function selectVisible(checked){
  state.filtered.forEach(x=>checked ? state.selected.add(x.no) : state.selected.delete(x.no));
  render();
}

function selectedRows(){
  return DATA.filter(x=>state.selected.has(x.no));
}

function copyFormat(rows){
  if(!rows.length) return "";

  // Format khusus salinan token UJIAN SUSULAN.
  // Tidak menampilkan hari/jam ujian; hanya dikelompokkan berdasarkan kelas.
  const classOrder = ["X", "XI", "XII"];
  const groups = new Map(classOrder.map(k => [k, []]));

  rows.forEach(x => {
    const kelas = String(x.kelas || "").trim();
    if(!groups.has(kelas)) groups.set(kelas, []);
    groups.get(kelas).push(x);
  });

  const blocks = ["UJIAN SUSULAN"];

  for(const [kelas, items] of groups){
    if(!items.length) continue;

    const lines = [`Kelas ${kelas}`];
    items.forEach(x => {
      const jenis = String(x.jenis || "").toUpperCase() === "ESSAY" ? "Essay" : "PG";
      lines.push(`* ${x.nama} (${jenis}) - ${x.kode}`);
    });

    blocks.push(lines.join("\n"));
  }

  return blocks.join("\n\n");
}

function openCopyModal(rows,title){
  if(!rows.length){toast("Tidak ada token yang bisa disalin.");return;}
  $("modalTitle").textContent=title;
  $("modalCount").textContent=`${rows.length} token`;
  $("copyText").value=copyFormat(rows);
  $("copyModal").classList.remove("hidden");
  $("copyModal").setAttribute("aria-hidden","false");
  setTimeout(()=>{$("copyText").focus();$("copyText").select()},50);
}

function closeModal(){
  $("copyModal").classList.add("hidden");
  $("copyModal").setAttribute("aria-hidden","true");
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("Berhasil disalin ke clipboard.");
  }catch{
    const ta=document.createElement("textarea");
    ta.value=text;document.body.appendChild(ta);ta.select();
    document.execCommand("copy");ta.remove();
    toast("Berhasil disalin ke clipboard.");
  }
}

function toast(message){
  const el=$("toast");
  el.textContent=message;
  el.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>el.classList.add("hidden"),1800);
}

function resetFilters(){
  ["search","classFilter","jamFilter","mapelFilter","typeFilter","dayFilter","timeFilter","dateFilter"].forEach(id=>$(id).value="");
  state.page=1;
  state.selected.clear();
  render();
}

function doLogin(){
  const username=normalize($("username").value);
  const password=$("password").value;
  if(Object.prototype.hasOwnProperty.call(USERS,username) && USERS[username]===password){
    sessionStorage.setItem("cbtUser",username);
    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("currentUser").textContent=username;
    if(!state.initialized){initFilters();state.initialized=true;}
    renderStats();render();
    return;
  }
  $("loginError").classList.remove("hidden");
  $("password").focus();
}

function logout(){
  sessionStorage.removeItem("cbtUser");
  location.reload();
}

function bind(){
  $("loginForm").addEventListener("submit",e=>{e.preventDefault();doLogin();});
  $("togglePassword").addEventListener("click",()=>{
    const input=$("password");
    const visible=input.type==="text";
    input.type=visible?"password":"text";
    $("togglePassword").innerHTML=visible ? icon("login") : icon("close");
    $("togglePassword").title=visible?"Tampilkan password":"Sembunyikan password";
  });
  $("logoutBtn").addEventListener("click",logout);
  ["search","classFilter","jamFilter","mapelFilter","typeFilter","dayFilter","timeFilter","dateFilter"].forEach(id=>{
    $(id).addEventListener("input",()=>{state.page=1;render();});
    $(id).addEventListener("change",()=>{state.page=1;render();});
  });
  $("selectAll").addEventListener("change",e=>selectVisible(e.target.checked));
  $("copyFilteredBtn").addEventListener("click",()=>openCopyModal(state.filtered,"Token Terfilter"));
  $("copySelectedBtn").addEventListener("click",()=>openCopyModal(selectedRows(),"Token Terpilih"));
  $("resetBtn").addEventListener("click",resetFilters);
  $("prevPage").addEventListener("click",()=>{if(state.page>1){state.page--;render();}});
  $("nextPage").addEventListener("click",()=>{state.page++;render();});
  $("modalCopyBtn").addEventListener("click",()=>copyToClipboard($("copyText").value));
  document.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",closeModal));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
  $("tbody").addEventListener("change",e=>{
    if(!e.target.classList.contains("row-check"))return;
    const no=Number(e.target.dataset.no);
    e.target.checked?state.selected.add(no):state.selected.delete(no);
    render();
  });
  $("tbody").addEventListener("click",e=>{
    const btn=e.target.closest("[data-copy]");
    if(btn) openCopyModal(DATA.find(x=>x.kode===btn.dataset.copy) ? [DATA.find(x=>x.kode===btn.dataset.copy)] : [],"Token Ruang Ujian");
  });
}

(function boot(){
  hydrateIcons();
  const errors=validateData();
  if(errors.length){
    document.body.innerHTML=`<main style="padding:40px;font-family:system-ui"><h1>Validasi data gagal</h1><p>${errors.map(esc).join("<br>")}</p></main>`;
    return;
  }
  bind();
  const saved=sessionStorage.getItem("cbtUser");
  if(saved && Object.prototype.hasOwnProperty.call(USERS,saved)) doLogin();
  else $("username").focus();
})();
