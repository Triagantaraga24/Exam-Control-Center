export const state = {
  filtered: [],
  page: 1,
  pageSize: 15,
  currentUser: null
};

export const els = {};

export function bindElements() {
  const ids = [
    "loginView","appView","loginForm","loginError","username","password",
    "togglePassword","logoutBtn","loggedUser","searchFilter","classFilter",
    "hourFilter","subjectFilter","typeFilter","dayFilter","timeFilter",
    "pageSize","resetBtn","copyFilteredBtn","addAccountBtn","tableBody",
    "resultCount","paginationInfo","paginationControls","statTotal",
    "statClasses","statSubjects","statTokens","modalBackdrop","modalClose",
    "modalBody","accountBackdrop","accountClose","accountForm",
    "accountUsername","accountPassword","accountError","accountUserList",
    "copyPreviewBackdrop","copyPreviewClose","copyPreviewCloseBottom",
    "copyPreviewText","copyPreviewCopy","copyPreviewSelectAll","copyPreviewMeta"
  ];
  ids.forEach(id => els[id] = document.getElementById(id));
}
