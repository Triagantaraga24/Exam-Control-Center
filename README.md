# Exam Control Center — Modular

Versi modular dari HTML sumber. Seluruh **132 data ujian** dipertahankan.

## Struktur
- `index.html` — markup/UI.
- `css/styles.css` — seluruh styling.
- `js/data.js` — data ujian.
- `js/auth.js` — autentikasi + akun tambahan.
- `js/state.js` — state dan DOM references.
- `js/ui.js` — filter, tabel, pagination, detail, copy token, UI akun.
- `js/utils.js` — helper/hash/copy/theme.
- `js/app.js` — event wiring dan bootstrap.

## Fitur baru
1. **Salin Token Hasil Filter**: menyalin seluruh token dari `state.filtered`, bukan hanya token pada halaman pagination yang sedang tampil. Setiap token dipisahkan newline dan urutannya mengikuti hasil filter.
2. **Tambah Akun**: dapat menambah akun baru melalui modal. Akun tambahan disimpan di `localStorage` sebagai hash SHA-256.
3. Data sumber tetap **132 record**.

## Menjalankan
Karena menggunakan JavaScript ES Module (`type="module"`), jalankan melalui web server lokal, misalnya VS Code Live Server atau:
`python -m http.server 8000`
lalu buka `http://localhost:8000/`.

> Catatan: autentikasi ini tetap merupakan autentikasi sisi browser. Untuk keamanan produksi, kredensial sebaiknya dipindahkan ke backend.


## Clipboard
Fitur **Salin Token Hasil Filter** menggunakan Clipboard API pada HTTPS/localhost dan fallback `execCommand("copy")` untuk browser yang lebih lama.

Untuk deployment, gunakan:
- HTTPS (misalnya Netlify/Vercel/GitHub Pages dengan HTTPS), atau
- localhost saat development.

Membuka `index.html` langsung melalui `file://` dapat membuat JavaScript module diblokir oleh browser dan akses clipboard dibatasi.
