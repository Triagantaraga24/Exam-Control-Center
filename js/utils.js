export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

export async function sha256(text) {
  if (!window.crypto?.subtle) throw new Error("Web Crypto API tidak tersedia.");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function copyText(text) {
  const value = String(text ?? "");

  /*
   * IMPORTANT:
   * execCommand("copy") is executed synchronously while the browser still
   * considers the call to originate from the user's click/tap.
   * This avoids losing the transient user activation after an await.
   */
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.setAttribute("readonly", "");
  ta.setAttribute("aria-hidden", "true");

  Object.assign(ta.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "2px",
    height: "2px",
    padding: "0",
    margin: "0",
    border: "0",
    outline: "0",
    opacity: "0.01",
    pointerEvents: "none",
    zIndex: "2147483647"
  });

  document.body.appendChild(ta);

  let legacyCopied = false;

  try {
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, value.length);

    if (typeof document.execCommand === "function") {
      legacyCopied = document.execCommand("copy");
    }
  } catch (_) {
    legacyCopied = false;
  }

  ta.remove();

  if (legacyCopied) return true;

  /*
   * Secondary path for modern browsers.
   * This is intentionally attempted only after the synchronous method.
   */
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value)
      .then(() => true)
      .catch(() => false);
  }

  return false;
}

export function unique(values) {
  return [...new Set(values.filter(v => v !== null && v !== undefined && v !== ""))];
}

export function visualTheme(x) {
  const classTheme = {
    X:["#eff6ff","#93c5fd","#1d4ed8"],
    XI:["#f5f3ff","#c4b5fd","#6d28d9"],
    XII:["#ecfdf5","#86efac","#15803d"]
  }[x.class_grade] || ["#f8fafc","#cbd5e1","#475569"];
  const typeTheme = x.type === "PG"
    ? ["#eef2ff","#a5b4fc","#4338ca"]
    : ["#fff7ed","#fdba74","#c2410c"];
  const timeTheme = {
    "06.30 - 08.00":["#fdf2f8","#f9a8d4","#be185d"],
    "07.00 - 08.30":["#fff1f2","#fda4af","#be123c"],
    "08.15 - 09.45":["#ecfeff","#67e8f0","#0e7490"],
    "09.00 - 10.30":["#eff6ff","#93c5fd","#1d4ed8"],
    "10.00 - 11.30":["#f0fdf4","#86efac","#15803d"],
    "11.00 - 12.30":["#fffbeb","#fcd34d","#a16207"]
  }[x.time] || ["#f8fafc","#cbd5e1","#475569"];
  const hourTheme = {
    1:["#ecfeff","#67e8f0","#0e7490"],
    2:["#fdf4ff","#e9d5ff","#86198f"],
    3:["#f0fdf4","#86efac","#166534"],
    4:["#fff7ed","#fdba74","#c2410c"],
    5:["#eff6ff","#93c5fd","#1d4ed8"]
  }[x.hour] || ["#f8fafc","#cbd5e1","#475569"];
  return `--class-bg:${classTheme[0]};--class-border:${classTheme[1]};--class-text:${classTheme[2]};--type-bg:${typeTheme[0]};--type-border:${typeTheme[1]};--type-text:${typeTheme[2]};--time-bg:${timeTheme[0]};--time-border:${timeTheme[1]};--time-text:${timeTheme[2]};--hour-bg:${hourTheme[0]};--hour-border:${hourTheme[1]};--hour-text:${hourTheme[2]};`;
}
