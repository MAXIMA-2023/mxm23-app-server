const stateRegDB = require('../model/state_registration.model')
const stateDB = require('../model/state_activities.model')
const MhsDB = require('../../user/model/mahasiswa.model')
const { validateEmptyEntries } = require("../../helpers/FormValidator");

/*
NOTE untuk INTERNAL STATE: pendaftaran maba ke state (christo):
-   Fitur untuk organisator dan panit:
    - READ data yang daftar (all, specific(by nim dan token), by day, by stateID,)
    - UPDATE data yang daftar (cmn bisa facio dan bph doang)
    - DELETE data yang daftar (cmn bisa facio dan bph doang)

- Data yng ada di db state_registration:
    - [stateID] id state yang didaftar maba
    - [nim] nim maba yang daftar
    - [attendanceTIme] current time stamp saat maba absen
    - [isFirstAttended] 0/1, 0 jika belum absen, 1 jika sudah absen pertama
    - [isLastAttended] 0/1, 0 jika belum absen, 1 jika sudah absen kedua

-   Gw udah nyiapin data dummy di database state_registration, state_activities, dan mahasiswa
    jadi tinggal di update db lu, dan tinggal pake buat testing.

-   terdapat toggle untuk mengatur setiap batas waktu dari UPDATE dan DELETE.
    untuk pengecekan udah ada di middleware toggle di toggle\middleware\toggle.middleware.js
    langsung pake di route aja.

-   UNTUK panit D01,D02,D05(Eventus) bisa melihat semua list maba yang regis state
-   UNTUK organisator, hanya dapat melihat list maba yg daftar di state mereka sendiri

-   pastikan data yang ditampilkan adalah nim dan nama mhs, serta nama state yang didaftar, waktu absen,
    dan status absen (absen pertama, absen kedua). Yang berarti perlu join table state_activities, dan mahasiswa ke state_registration.

*/

/*
NOTE untuk maba regis STATE (farel):
-   Maba maksimal regis 3 state
-   Maba tidak bisa regis state yang ada di Day yang sama
-   Maba tidak bisa regis state yang sudah penuh
-   Maba bisa cancel state yang sudah di regis

-   Terdapat toggle untuk mengatur batas waktu pendaftaran state.
    untuk pengecekan batas waktu toggle, terdapat middleware untuk 
    pendaftaran di toggle\middleware\toggle.middleware.js,
    tinggal pasang ae di route.

-   Fitur untuk maba:
    - daftar state
    - cancel state (DELETE)

-   Untuk daftar, request yng harus diisi ke database state_registration:
    - nim maba yang daftar
    - stateID yang di daftar maba

-   ketika maba daftar, maka value registered di database state yg didaftar maba
    akan bertambah 1. ketika maba cancel, maka value registered di database state -1

-   jika validasi data yang diinput ada banyak, bisa pakai zod biar gampang.
    kalau mau liat contoh ada di #discussion discord. atau klo  ada cara yang lebih 
    efisien, sabi dicobain.

NOTE untuk maba absen STATE:
-   Pastikan user telah punya token absensi
-   konsep simple utk absen:
    - maba punya qr (FE generate qr dari token yang diambil dari BE)
    - saat awal dan akhir, panitia akan scan qr milik maba (FE akan kirim token ke endpoint yg buat absen).
    - jika qr valid, maka maba akan diabsen. (BE menerima token dan mencari maba dengan token tersebut dan absen dah)

-   Terdapat toggle untuk mengatur batas waktu absen state.

-   Fitur untuk absen maba:
    - absen pertama
    - absen kedua

-   Absen pertama mengubah value attendanceTIME di database state_registration 
    menjadi waktu current time saat dia absen serta value isFirstAttended menjadi 1.

-   Absen kedua mengubah value isLastAttended menjadi 1.

*/
