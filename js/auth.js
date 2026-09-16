import { sha256 } from "./utils.js";

export const USERS = {
  "trgntrg24": "3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121",
  "davidhnadeak": "b06d31d260ca33a78399a9f0ea0afbaafbc839c5989d45981bcb8a77b8e39799",
  "panitiasts2627": "405860e02d34d3338b83ab6ee6e172b64ca8ecc7b83f080e6d4ca8c68defde9d"
};

const STORAGE_KEY = "exam_control_users";

function getUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? { ...USERS, ...saved } : { ...USERS };
  } catch {
    return { ...USERS };
  }
}

function saveUsers(users) {
  const custom = { ...users };
  delete custom.trgntrg24;
  delete custom.davidhnadeak;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

export async function authenticate(username, password) {
  const users = getUsers();
  const hash = await sha256(password);
  return users[username] === hash;
}

export function listUsers() {
  return Object.keys(getUsers());
}

export async function addUser(username, password) {
  const cleanUsername = username.trim();
  if (!cleanUsername || !password) throw new Error("Username dan password wajib diisi.");
  if (!/^[A-Za-z0-9._-]{3,50}$/.test(cleanUsername)) {
    throw new Error("Username hanya boleh berisi huruf, angka, titik, underscore, dan tanda minus.");
  }
  const users = getUsers();
  if (users[cleanUsername]) throw new Error("Username sudah terdaftar.");
  users[cleanUsername] = await sha256(password);
  saveUsers(users);
  return cleanUsername;
}

export function hasUser(username) {
  return Boolean(getUsers()[username]);
}
