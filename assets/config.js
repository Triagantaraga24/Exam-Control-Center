// Konfigurasi akun lokal.
// Catatan: karena aplikasi ini statis, kredensial berada di sisi client.
// Untuk keamanan produksi, pindahkan autentikasi ke backend/server-side.
window.CBT_CONFIG = Object.freeze({
  users: Object.freeze({
    "trgntrg24": "Admin123!",
    "davidhnadeak": "Admin456#",
    "panitiasts2627": "HopeYadika5!"
  }),
  datasetExpected: Object.freeze({
    total: 132,
    kelas: Object.freeze({"X": 40, "XI": 48, "XII": 44}),
    jenis: Object.freeze({"PG": 66, "ESSAY": 66})
  })
});
