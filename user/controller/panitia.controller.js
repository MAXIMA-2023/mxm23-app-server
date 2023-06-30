const PanitDB = require('../model/panitia.model')
const DivisiDB = require('../model/divisi.model')
const { validateEmptyEntries } = require("../../helpers/FormValidator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
// const address = require('address')
// const logging = require('../../loggings/controllers/loggings.controllers')

exports.register = async(req, res) => {

    try{
        const { 
            name,
            nim, 
            password, 
            email, 
            divisiID
        } = req.body

        //cek form kosong
        const emptyEntriesValidation = validateEmptyEntries(req.body);
        if (emptyEntriesValidation.length > 0){
            return res.status(400).send({
                message : "Kolom input kosong.",
                error : emptyEntriesValidation
            });
        }

        //cek paswword
        if(password.length<8){
            return res.status(400).send({
                message: 'password harus terdiri dari setidaknya 8 karakter.  '
            })
        }
        
        //password enkripsi
        const hashPass = await bcrypt.hashSync(password, 8)


        //cek nim
        const cekNIM = await PanitDB.query().where({ nim })
        if(cekNIM.length !== 0){
            return res.status(400).send({
                message: 'NIM sudah terdaftar!'
            })
        }
        
        //cek divisi
        const cekDiv = await DivisiDB.query().where({ divisiID })
        if(cekDiv.length === 0 || cekDiv === []){
            return res.status(409).send({ 
                message: 'Divisi yang kamu input tidak terdaftar!' 
            })       
        }
        
        //cek email student
        const emailPattern = /^[a-zA-Z0-9._-]+@student\.umn\.ac\.id$/;
        if(!emailPattern.test(email)){
            return res.status(400).send({
                message: 'Email harus menggunakan email student'
            })
        }
        // if(divisiID === 'D01'){
        //     return res.status(401).send({ 
        //         message: 'Anda tidak dapat mendaftar pada divisi tersebut' 
        //     })
        // }

        const verified2 = 0
        await PanitDB.query().insert({
            name,
            nim,
            password: hashPass,
            email,
            divisiID, 
            isverified: verified2
        })

        return res.status(200).send({ message: 'Akun baru berhasil ditambahkan' })
    }
    catch(err){
        // logging.registerLog('Register/Panitia', nim, ip, err.message)
        return res.status(500).send({ message: err.message })
    }
}

exports.login = async(req, res)=>{
    const { nim, password } = req.body
    try{
        //cek form kosong
        const emptyEntriesValidation = validateEmptyEntries(req.body);
        if (emptyEntriesValidation.length > 0){
            return res.status(400).send({
                message : "Kolom input kosong.",
                error : emptyEntriesValidation
            });
        }
        
        //cek nim terdaftar
        const checkingNim = await PanitDB.query().where({ nim })
        if(checkingNim.length === 0){
            return res.status(404).send({
                message : 'NIM ' + nim + ' tidak terdaftar! Harap melakukan register dahulu'
            })
        }

        //compare password
        const isPassValid = bcrypt.compareSync(password, checkingNim[0].password)
        if(!isPassValid){
            return res.status(400).send({
                message: 'NIM atau password salah!'
            })
        }
        
        //is verivied
        const ver = await PanitDB.query().select('isverified').where({ nim })
        if(ver[0].isverified === 0){
            return res.status(400).send({
                message: 'Akun anda belum terverifikasi!'
            })
        }

        //assign jwt nim aja 
        const JWTtoken = jwt.sign({
                nim: checkingNim[0].nim
                //nama
                //role: 'panitia' / 'organsator'
            }, process.env.JWT_SECRET, {
                expiresIn: 86400 //equals to 24Hprocess.env.JWT_LIFETIME
        })

        return res.status(200).send({
            message: "Berhasil login",
            token: JWTtoken
        })
    }
    catch(err){
        // logging.loginLog('Login/Panitia', nim, ip, err.message)
        return res.status(500).send({ message: err.message })
    }
}

exports.readAllData = async(req, res) => {
    try {
        const result = await PanitDB.query()

        for(let i = 0; i < result.length; i++){
            const div = await DivisiDB.query().select('name').where({ divisiID: result[i].divisiID })

            result[i].divisiName = div[0].name
        }

        return res.status(200).send(result)    
    } 
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.readSpecificData = async(req, res) => {

    try {
        const { nim } = req.params
        //nim kosong?
        if(nim === null || nim === ':nim'){
            return res.status(200).send({
                message: 'NIM anda kosong! Harap diisi terlebih dahulu'
            })
        }

        //cek nim
        const cekNIM = await PanitDB.query().where({ nim })
        if(cekNIM.length === 0 || cekNIM === []){
            return res.status(200).send({ 
                message: 'NIM ' + nim + ' tidak ditemukan'
            }) 
        }
        
        //cari spesifik nim
        const result = await PanitDB.query().where({ nim })
        const div = await DivisiDB.query().select('name').where({ divisiID: result[0].divisiID })
        result[0].divisi = div[0].name

        return res.status(200).send(result)
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateData = async(req,res)=>{
    try {
        const { nim } = req.params
        //nim kosong?
        if(nim === null || nim === ':nim'){
            return res.status(404).send({
                message: 'NIM anda kosong! Harap diisi terlebih dahulu'
            })
        }

        const { 
            name, 
            email, 
            divisiID
        } = req.body

        //cek form kosong
        const emptyEntriesValidation = validateEmptyEntries(req.body);
        if (emptyEntriesValidation.length > 0){
            return res.status(400).send({
                message : "Kolom input kosong.",
                error : emptyEntriesValidation
            });
        }
        
        //cek nim
        const cekNIM = await PanitDB.query().where({ nim })
        if(cekNIM.length === 0 || cekNIM === []){
            return res.status(404).send({ 
                message: 'NIM ' + nim + ' tidak ditemukan!'
            })
        }

        //cek divisi terdaftar ato kaga
        const cekDiv = await DivisiDB.query().where({ divisiID })
        if(cekDiv.length === 0 || cekDiv === []){
            return res.status(404).send({ 
                message: 'Divisi yang kamu input tidak terdaftar!' 
            })
        }

        //cek pake email student
        const emailPattern = /^[a-zA-Z0-9._-]+@student\.umn\.ac\.id$/;
        if(!emailPattern.test(email)){
            return res.status(400).send({
                message: 'Email harus menggunakan email student'
            })
        }
        //update ke db
        await PanitDB.query().update({
            name,
            email,
            divisiID
        }).where({ nim })

        return res.status(200).send({ message: 'Data berhasil diupdate' })
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateVerified = async(req, res) => {
    try{
        const { nim } = req.params
        //nim kosong?
        if(nim === null || nim === ':nim'){
            return res.status(404).send({
                message: 'NIM anda kosong! Harap diisi terlebih dahulu'
            })
        }

        //cek divisi dari divisi D01 ato D02
        const cekDivisi = await PanitDB.query().select('divisiID').where({ nim });
        if (cekDivisi.length === 0 || (cekDivisi[0].divisiID !== "D01" && cekDivisi[0].divisiID !== "D02")) {
            return res.status(403).send({
                message: "Divisi anda tidak memiliki otoritas yang cukup! " + cekDivisi[0].divisiID
            });
        }

        const { isverified } = req.body
        //note klo frontend dah kelar, buatin jadi dia langsung berubah otomatis tanpa input value isverified
        //cek nim 
        const cekNIM = await PanitDB.query().where({ nim })
        if(cekNIM.length === 0 || cekNIM === []){
            return res.status(404).send({ 
                message: 'NIM ' + nim + ' tidak ditemukan!'
            })
        }

        //value verified hanya 0 atau 1
        if(isverified < 0 || isverified > 1){
            return res.status(406).send({ 
                message: 'Value hanya boleh angka 0 atau 1 saja!' 
            })
        }

        //update ke db isverified
        await PanitDB.query().update({
            isverified
        }).where({ nim })
        return res.status(200).send({ message: 'Data berhasil diupdate' })
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.deleteData = async (req, res) => {
    try {
        const { nim } = req.params;
        const { nimPanit } = req.body;
        //nim kosong?
        if (!nimPanit || nimPanit === ':nim') {
            return res.status(404).send({
                message: 'NIM kosong! Harap diisi terlebih dahulu.'
            });
        }

        //cek divisi dari D01/ D02 bukan
        const cekDivisi = await PanitDB.query().select('divisiID').where({ nim });
        if (cekDivisi.length === 0 || (cekDivisi[0].divisiID !== "D01" && cekDivisi[0].divisiID !== "D02")) {
            return res.status(403).send({
                message: "Divisi anda tidak memiliki otoritas yang cukup! " + cekDivisi[0].divisiID
            });
        }

        //delete panitia yang dipilih
        const deletedPanitia = await PanitDB.query().where({ nim: nimPanit }).delete();
        if (deletedPanitia === 0) {
            return res.status(404).send({
                message: `Mahasiswa dengan NIM ${nimPanit} tidak ditemukan.`
            });
        }

        return res.status(200).send({
            message: `Berhasil menghapus data mahasiswa dengan NIM ${nimPanit}.`
        });

    } catch (error) {
        return res.status(500).send({
            message: 'Terjadi kesalahan pada server.'
        });
    }
};