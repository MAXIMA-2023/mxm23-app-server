/*
NOTE untuk state_activities(edu):
-   fitur untuk organisator dan panit:
    - CREATE STATE 
    - UPDATE STATE
    - DELETE STATE
    - READ STATE (all, specific, by day)

-   data/informasi yang harus diisi untuk membuat state:
    - [name] nama state
    - [day] hari (D1-D7) cek jika sudah ada di database day_management
    - [stateLogo] link logo bentuk teks
    - [stateDesc] deskripsi state
    - [location] lokasi tempat pelaksanaan state
    - [quota] kuota peserta yg bisa daftar
    - [registered] jumlah peserta yg sudah terdaftar, bertambah ketika ada yang daftar

-   terdapat toggle untuk mengatur setiap batas waktu dari ketiga aktivitas diatas.
    untuk pengecekan batas waktu toggle, terdapat middleware untuk setiap aktivitas
    di toggle\middleware\toggle.middleware.js
    tinggal pake di routenya.

-   untuk pengisian gambar logo, sementara pakai fileupload dan simpan ke folder `.\stateLogo `
    dan hapus file setelah diupload ke folder.
    Guna untuk kedepannya menggunakan google cloud storage. Sehingga folder tersebut hanya sebagai TEMP saja.
    klo malas... yah isi teks kosong aja dulu saat input logo.
    
-   routing organisator dan panit dibedakan namun mengakses endpoint yang sama, guna mempermudah dalam memakai
    middleware pengecekan isPanitia dan isOrganisator. jika ada cara yang lebih efisien dari ini, sabi dicobain.

-   jika validasi data yang diinput ada banyak, bisa pakai zod biar gampang.
    kalau mau liat contoh ada di #discussion discord. 

-   gw udh nyiapin data dummy di database state_activities klo mau testing.
*/
