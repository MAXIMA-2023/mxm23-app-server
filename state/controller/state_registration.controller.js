const stateRegDB = require('../model/state_registration.model')
const stateDB = require('../model/state_activities.model')
const MhsDB = require('../../user/model/mahasiswa.model')
const { validateEmptyEntries } = require("../../helpers/FormValidator");
const { Model, ForeignKeyViolationError } = require('objection')

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


const handleRegistration = async (req, res) => {
    const {nim, stateID} = req.body;
    const body = {nim, stateID};

    // Cek input kosong
    const emptyEntriesValidation = validateEmptyEntries(body); 
    if (emptyEntriesValidation.length > 0){
        return res.status(400).send({
            code : 400, 
            message : "Kolom input kosong.",
            error : emptyEntriesValidation
        });
    } 

    const transaction = await Model.startTransaction();    

    try {
        // Cek total pendaftaran 
        const registeredState = await stateRegDB.query().where({nim}).withGraphFetched('state_activities');
        if (registeredState.length >= 3){
            return res.status(403).send({
                code : 403,
                error : "REGISTRATION_LIMIT_EXCEEDED",
                message : "Anda tidak diperbolehkan mendaftar pada lebih dari 3 state."
            })            
        }

        // Cek keberadaan stateID 
        const state = await stateDB.query().where({stateID}).first();
        if (!state){
            return res.status(404).send({
                code : 404,
                message : "State tidak terdaftar."
            })            
        }

        // Cek apakah sudah pernah mendaftar di state yang sama
        const duplicateRegistration = registeredState.filter(data => data.stateID == stateID).length;
        if (duplicateRegistration){
            return res.status(403).send({
                code : 403,
                error : "DUPLICATE_REGISTRATION",
                message : "Anda telah terdaftar."
            })             
        }

        // Cek apakah peserta mendaftar lebih dari 1 state pada 1 hari yang sama
        const checkSameDayRegistration = [];

        for (let data of registeredState){
            checkSameDayRegistration.push(data.state_activities.day);             
            if (checkSameDayRegistration.includes(state.day)) {
                return res.status(403).send({
                    code : 403,
                    error : "SAME_DAY_REGISTRATION",
                    message : "Anda tidak diperbolehkan mendaftar lebih dari 1 state pada 1 hari yang sama."
                });
            }
           
        }

        // Cek apakah kuota state penuh
        if (state.registered >= state.quota){
            return res.status(403).send({
                code : 403, 
                error : "INSUFFICIENT_QUOTA", 
                message : "Kuota untuk state ini sudah penuh."
            })
        }

        // Masukkin record ke database
        const insert = await stateRegDB.query().insert({
            stateID, 
            nim, 
            attendanceTime : null, 
            isFirstAttended : false, 
            isLastAttendaned : false
        }); 
        if (!insert) throw new Error(); 

        // Update registered quota        
        const updateQuota = await stateDB.query().where({stateID}).update({
            registered : state.registered + 1
        });
        if (!updateQuota) throw new Error();

        await transaction.commit();
    
        return res.status(201).send({
            code : 201, 
            message : "Pendaftaran berhasil."
        })     

    } catch (err){
        await transaction.rollback();
        
        if (err instanceof ForeignKeyViolationError){
            return res.status(400).send({
                code : 400, 
                error : "INVALID_PARTICIPANT_ID",
                message : "Mahasiswa tidak terdaftar."
            });
        }

        return res.status(500).send({
            code : 500, 
            message : err.message
        });        
    }
};

const cancelRegistration = async (req, res) => {
    
}

/*
NOTE untuk maba regis STATE (farel):
-   Maba maksimal regis 3 state (DONE)
-   Maba tidak bisa regis state yang ada di Day yang sama (DONE)
-   Maba tidak bisa regis state yang sudah penuh (DONE)
-   Maba bisa cancel state yang sudah di regis 

-   Terdapat toggle untuk mengatur batas waktu pendaftaran state.
    untuk pengecekan batas waktu toggle, terdapat middleware untuk 
    pendaftaran di toggle\middleware\toggle.middleware.js,
    tinggal pasang ae di route.

-   Fitur untuk maba:
    - daftar state
    - cancel state (DELETE)

-   Untuk daftar, request yng harus diisi ke database state_registration:
    - nim maba yang daftar (DONE)
    - stateID yang di daftar maba (DONE)

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

module.exports = { handleRegistration }