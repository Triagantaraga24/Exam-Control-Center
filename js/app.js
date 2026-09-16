import { EXAM_DATA } from "./data.js";
import { authenticate, addUser, hasUser } from "./auth.js";
import { state, els, bindElements } from "./state.js";
import {
  initFilters, applyFilters, renderTable, openCopyPreview, copyFromPreview,
  selectPreviewText, openDetail, openAccountModal, renderUserList, showToast
} from "./ui.js";

function loginSuccess(username) {
  state.currentUser = username;
  sessionStorage.setItem("exam_user", username);
  els.loggedUser.textContent = username;
  els.loginView.classList.add("hidden");
  els.appView.classList.remove("hidden");
  applyFilters();
}

function logout() {
  sessionStorage.removeItem("exam_user");
  state.currentUser = null;
  els.appView.classList.add("hidden");
  els.loginView.classList.remove("hidden");
  els.password.value = "";
}

function closeModal() {
  els.modalBackdrop.classList.add("hidden");
  els.accountBackdrop.classList.add("hidden");
}

function resetFilters() {
  els.searchFilter.value = "";
  els.classFilter.value = "";
  els.hourFilter.value = "";
  els.subjectFilter.value = "";
  els.typeFilter.value = "";
  els.dayFilter.value = "";
  els.timeFilter.value = "";
  applyFilters();
}

function bindEvents() {
  els.loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const username=els.username.value.trim(), password=els.password.value;
    try {
      if (await authenticate(username,password)) {
        els.loginError.classList.add("hidden");
        loginSuccess(username);
      } else {
        els.loginError.textContent="Username atau password salah.";
        els.loginError.classList.remove("hidden");
      }
    } catch (err) {
      els.loginError.textContent=err.message || "Login gagal.";
      els.loginError.classList.remove("hidden");
    }
  });

  els.togglePassword.addEventListener("click",()=>{
    const hidden=els.password.type==="password";
    els.password.type=hidden?"text":"password";
    els.togglePassword.innerHTML=hidden
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';
  });

  els.logoutBtn.addEventListener("click",logout);

  [els.searchFilter,els.classFilter,els.hourFilter,els.subjectFilter,els.typeFilter,els.dayFilter,els.timeFilter]
    .forEach(el=>el.addEventListener("input",applyFilters));

  els.pageSize.addEventListener("change",()=>{
    state.pageSize=Number(els.pageSize.value);
    state.page=1;
    renderTable();
  });

  els.resetBtn.addEventListener("click",resetFilters);
  els.copyFilteredBtn.addEventListener("click",openCopyPreview);
  els.copyPreviewCopy.addEventListener("click",copyFromPreview);
  els.copyPreviewSelectAll.addEventListener("click",selectPreviewText);
  els.copyPreviewClose.addEventListener("click",()=>els.copyPreviewBackdrop.classList.add("hidden"));
  els.copyPreviewCloseBottom.addEventListener("click",()=>els.copyPreviewBackdrop.classList.add("hidden"));
  els.copyPreviewBackdrop.addEventListener("click",e=>{
    if(e.target===els.copyPreviewBackdrop) els.copyPreviewBackdrop.classList.add("hidden");
  });
  els.addAccountBtn.addEventListener("click",openAccountModal);

  els.tableBody.addEventListener("click",e=>{
    const copy=e.target.closest("[data-copy]");
    if(copy) {
      import("./utils.js").then(async ({copyText})=>{
        const ok=await copyText(copy.dataset.copy);
        showToast(ok?"Token berhasil disalin":"Gagal menyalin token",ok);
      });
    }
    const detail=e.target.closest("[data-detail]");
    if(detail) openDetail(detail.dataset.detail);
  });

  els.paginationControls.addEventListener("click",e=>{
    const btn=e.target.closest("[data-page]");
    if(!btn || btn.disabled) return;
    state.page=Number(btn.dataset.page);
    renderTable();
  });

  els.modalClose.addEventListener("click",()=>els.modalBackdrop.classList.add("hidden"));
  els.accountClose.addEventListener("click",()=>els.accountBackdrop.classList.add("hidden"));
  els.modalBackdrop.addEventListener("click",e=>{if(e.target===els.modalBackdrop)els.modalBackdrop.classList.add("hidden")});
  els.accountBackdrop.addEventListener("click",e=>{if(e.target===els.accountBackdrop)els.accountBackdrop.classList.add("hidden")});

  els.accountForm.addEventListener("submit",async e=>{
    e.preventDefault();
    els.accountError.classList.add("hidden");
    const username=els.accountUsername.value.trim();
    const password=els.accountPassword.value;
    try {
      await addUser(username,password);
      renderUserList();
      els.accountForm.reset();
      els.accountBackdrop.classList.add("hidden");
      showToast(`Akun ${username} berhasil ditambahkan.`);
    } catch(err) {
      els.accountError.textContent=err.message || "Gagal menambahkan akun.";
      els.accountError.classList.remove("hidden");
    }
  });

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape") {
      closeModal();
      els.copyPreviewBackdrop.classList.add("hidden");
    }
  });
}

bindElements();
initFilters();
state.filtered=[...EXAM_DATA];

const existing=sessionStorage.getItem("exam_user");
if(existing && hasUser(existing)) loginSuccess(existing);
