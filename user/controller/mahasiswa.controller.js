
const env = require("dotenv").config({path : "../../.env"});
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mahasiswa = require('../model/mahasiswa.model');
const { validateEmptyEntries } = require("../../helpers/FormValidator");


// API Client
const register = async (req, res) => {

    // NOTE : blm fix
    const {nim, nama, email, password, whatsapp, angkatan, idLine, prodi} = req.body;
    const body = {nim, nama, email, password, whatsapp, angkatan, idLine, prodi};

    // Cek input kosong 
    const emptyEntriesValidation = validateEmptyEntries(body);

    if (emptyEntriesValidation.length > 0){
        return res.status(400).send({
            code : 400, 
            message : "Kolom input kosong.",
            error : emptyEntriesValidation
        });
    } 

    try {

        const fieldErrorList = [];

        // Validasi NIM
        const mahasiswa = await Mahasiswa.query().where({nim}).first();
        if (mahasiswa) {
            return res.status(409).send({
                code : 409,
                message : "NIM sudah terdaftar."
            })
        } 

        // Validasi Password 
        if (password.length < 8){
            fieldErrorList.push({
                error : `INVALID_PASSWORD`,
                message : `Password harus lebih panjang dari 8 karakter.`                
            })          
        }

        // Validasi Email 
        const studentEmailPattern = /^(\w+(.\w+)*)(@student.umn.ac.id)$/gm;
        if (!studentEmailPattern.test(email)){
            fieldErrorList.push({
                error : `INVALID_EMAIL`,
                message : `Email harus menggunakan email student.`                
            })                 
        }        
        
        // Validasi Angkatan 
        if (angkatan != 2023){
            fieldErrorList.push({
                error : `INVALID_CLASSYEAR`,
                message : `HoMe hanya dibuka untuk mahasiswa angkatan 2023.`                
            })               
        }

        // Error Handling
        if (fieldErrorList.length > 0){
            return res.status(400).send({
                code : 400,
                message : "Gagal melakukan registrasi.",
                error : fieldErrorList
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Sukses
        await Mahasiswa.query().insert({
            nim, 
            name : nama, 
            email,
            password : hashedPassword,
            whatsapp, 
            angkatan,
            idLine,
            prodi
        });

        return res.status(201).send({
            code : 201, 
            message : "Pendaftaran berhasil."
        })        

    } catch (err){
        return res.status(500).send({
            code : 500, 
            message : err.message
        });
    }

}



// API Client
const login = async (req, res) => {

    // NOTE : login pake nim aja ato (nim or email) ato gmn??
    const { nim = "", password = "" } = req.body; 

    try {
        
        // Cek NIM & Password
        const user = await Mahasiswa.query().where({nim}).first() || {}
        const userPassword = user?.password || "";
        if (user === {} || !await bcrypt.compare(password, userPassword)){
            return res.status(401).json({
                code : 401,                    
                message : "NIM dan/atau kata sandi salah."
            });                          
        }

        // Assign JWT
        const jwtPayload = {id : user.nim, name : user.name} 
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn : process.env.JWT_LIFETIME * 86400}) // NOTE : lifetime berapa lama?

        // NOTE : password perlu dihide ga di response?
        const data = user;
        delete data.password;

        res.cookie('__SESS_TOKEN', token, {
            httpOnly : true,
            sameSite : 'None',
            secure : true,
        });        

        return res.status(200).send({
            code : 200, 
            message : "Login berhasil.",
            data,
            token,
            expiresIn : process.env.JWT_LIFETIME * 86400
        })        

    } catch(err){
        return res.status(500).send({
            code : 500, 
            message : err.message
        });
    }

}


// API Internal
const getAllStudent = async (req, res) => {
    try {

        const daftarMahasiswa = await Mahasiswa.query();

        return res.status(200).send({
            code : 200, 
            message : "Berhasil mengambil seluruh data mahasiswa.",
            data : daftarMahasiswa
        });

    } catch (err){
        return res.status(500).send({
            code : 500, 
            message : err.message
        });        
    }
}

// API Internal
const getSpecificStudent = async (req, res) => {
    try {

        const { nim = "" } = req.params;

        const dataMahasiswa = await Mahasiswa.query().where({nim}).first();
        if (!dataMahasiswa){
            return res.status(404).send({
                code : 404, 
                message : `Mahasiswa dengan NIM : ${nim} tidak ditemukan.`
            });
        }

        return res.status(200).send({
            code : 200, 
            message : `Berhasil mengambil data mahasiswa dengan NIM : ${nim}`,
            data : dataMahasiswa
        });

    } catch (err){
        return res.status(500).send({
            code : 500, 
            message : err.message
        });        
    }
}

// API Internal
const updateStudent = async (req, res) => {
    // NOTE : blm fix

    const {nama, email, whatsapp, angkatan, idLine, prodi} = req.body;
    const body = {nama, email, whatsapp, angkatan, idLine, prodi};

    // Cek input kosong 
    const emptyEntriesValidation = validateEmptyEntries(body);

    if (emptyEntriesValidation.length > 0){
        return res.status(400).send({
            code : 400, 
            message : "Kolom input kosong.",
            error : emptyEntriesValidation
        });
    }     

    try {

        const { nim = " " } = req.params;

        const fieldErrorList = [];

        // Validasi Email 
        const studentEmailPattern = /^(\w+(.\w+)*)(@student.umn.ac.id)$/gm;
        if (!studentEmailPattern.test(email)){
            fieldErrorList.push({
                error : `INVALID_EMAIL`,
                message : `Email harus menggunakan email student.`                
            })                 
        }        
        
        // Validasi Angkatan 
        if (angkatan != 2023){
            fieldErrorList.push({
                error : `INVALID_CLASSYEAR`,
                message : `HoMe hanya dibuka untuk mahasiswa angkatan 2023.`                
            })               
        } 
        
        // Error Handler 
        if (fieldErrorList.length > 0){
            return res.status(400).send({
                code : 400,
                message : "Gagal melakukan perubahan data.",
                error : fieldErrorList
            });
        }

        const daftarMahasiswa = await Mahasiswa.query().where({nim}).update({ 
            name : nama, email, whatsapp, angkatan, idLine, prodi
        });

        if (!daftarMahasiswa){
            return res.status(404).send({
                code : 404, 
                message : `Mahasiswa dengan NIM : ${nim} tidak ditemukan.`
            });
        }

        return res.status(200).send({
            code : 200, 
            message : `Berhasil mengubah data mahasiswa dengan NIM : ${nim}`,
        });


    } catch(err) {
        return res.status(500).send({
            code : 500, 
            message : err.message
        });         
    }
    
}


// API Internal
const deleteStudent = async (req, res) => {
    try {

        const { nim = "" } = req.params;

        const daftarMahasiswa = await Mahasiswa.query().where({nim}).delete();
        if (!daftarMahasiswa){
            return res.status(404).send({
                code : 404, 
                message : `Mahasiswa dengan NIM : ${nim} tidak ditemukan.`
            });
        }

        return res.status(200).send({
            code : 200, 
            message : `Berhasil menghapus data mahasiswa dengan NIM : ${nim}`,
        });

    } catch (err){
        return res.status(500).send({
            code : 500, 
            message : err.message
        });        
    }
}

module.exports = {register, login, getAllStudent, getSpecificStudent, updateStudent, deleteStudent}