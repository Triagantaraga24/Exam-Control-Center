# CBT Token Dashboard — STS Ganjil 2026/2027

Dashboard statis HTML + CSS + JavaScript berbasis dataset **132 ruang ujian** dari file sumber.

## Validasi dataset
- Total: 132
- Kelas X: 40
- Kelas XI: 48
- Kelas XII: 44
- PG: 66
- Essay: 66
- Token unik: 132

## Fitur
- Login 3 akun.
- Filter: pencarian, kelas, jam, mapel, jenis soal, hari, waktu ujian, tanggal.
- Checkbox per ruang.
- Pilih semua hasil filter.
- Salin token satu ruang.
- Salin semua token hasil filter.
- Salin semua token terpilih.
- Modal textarea yang fleksibel/editable sebelum copy.
- Format copy dikelompokkan berdasarkan jadwal dan kelas.
- Pagination.
- Responsive desktop/tablet/mobile.
- Font sans-serif untuk teks dan monospace untuk angka/token.
- Ant Design-inspired UI: card, button, tag, spacing, focus state, responsive layout.
- Dataset dipisahkan dari UI dalam `assets/data.js`.

## Akun
1. `trgntrg24` / `Admin123!`
2. `davidhnadeak` / `Admin456#`
3. `panitiasts2627` / `HopeYadika5!`

## Menjalankan
Bisa langsung membuka `index.html`.

Untuk penggunaan yang lebih konsisten:
```bash
python -m http.server 8080
```
Kemudian buka `http://localhost:8080`.

## Catatan keamanan
Karena ini aplikasi statis, username/password berada di JavaScript client-side. Ini cocok untuk dashboard lokal/internal, **bukan** autentikasi server-side untuk internet publik.
