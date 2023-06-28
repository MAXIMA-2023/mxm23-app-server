const OrganisatorDB = require('../model/organisator.model')
const StateDB = require('../../state/model/state_activities.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validateEmptyEntries } = require('../../helpers/FormValidator')

exports.registerOrganisator = async (req, res) => {

    try {
        const {name, nim, email, password, stateID} = req.body
        const hashPass = await bcrypt.hashSync(password, 8)
        const cekNIM = await OrganisatorDB.query().where({ nim })
        const cekState = await StateDB.query().where({ stateID })

        // Cek input kosong 
        const emptyEntriesValidation = validateEmptyEntries(req.body);

        if (emptyEntriesValidation.length > 0){
            return res.status(400).send({
                code : 400, 
                message : "Kolom input kosong.",
                error : emptyEntriesValidation
            });
        }

        if(cekNIM.length !== 0){
            return res.status(400).send({
                message: 'Akun anda sebelumnya telah terdaftar'
            })
        }

        // Misal kalo cuman boleh 1 yang register per state 
        // if(cekState.length !== 0){
        //     return res.status(400).send({
        //         message: 'Sudah ada yang register menggunakan STATE tersebut!'
        //     })
        // }

        if(cekState.length === 0 || cekState === []){
            return res.status(409).send({ 
                message: 'STATE yang kamu input tidak terdaftar!' 
            })       
        }

        await OrganisatorDB.query().insert({
            name,
            nim,
            password: hashPass,
            email,
            stateID, 
            isverified: 0
        })
        return res.status(200).send({massage: 'Akun berhasil terdaftar!'})
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.loginOrganisator = async (req, res) => {
    const {nim, password} = req.body

        // Cek input kosong 
        const emptyEntriesValidation = validateEmptyEntries(req.body);

        if (emptyEntriesValidation.length > 0){
            return res.status(400).send({
                code : 400, 
                message : "Kolom input kosong.",
                error : emptyEntriesValidation
            });
        }

    try {
        const checkingnim = await OrganisatorDB.query().where({ nim })
        //nim salah
        if(checkingnim.length === 0){
            return res.status(404).send({
                message : 'NIM ' + nim + ' tidak terdaftar! Harap melakukan register!'
            })
        }
        //password salah
        const isPassValid = bcrypt.compareSync(password, checkingnim[0].password)
        if(!isPassValid){
            return res.status(400).send({
                message: 'NIM atau password salah!'
            })
        }

        const ver = await OrganisatorDB.query().select('isverified').where({ nim })
        if(ver[0].isverified !== 1){
            return res.status(400).send({
                message: 'Akun anda belum terverifikasi!'
            })
        }
        
        const getStateName = await StateDB.query().where({ stateID: checkingnim[0].stateID })

        const JWTtoken = jwt.sign({ 
            name: checkingnim[0].name,
            nim: checkingnim[0].nim,
            email: checkingnim[0].email,
            role: 'organisator',
            stateName: checkingnim[0].name,
            stateID: getStateName[0].stateID
        },process.env.JWT_SECRET, {
            expiresIn: 86400 //equals to 24H
    })

    return res.status(200).send({massage: 'Berhasil login!'
    , token: JWTtoken
})

    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.getOrganisator = async (req, res) => {
    try {
        const result = await OrganisatorDB.query()

        for(let i = 0; i < result.length; i++){
            const StateName = await StateDB.query().select('name')
            .where({ stateID: result[i].stateID })

            result[i].stateName = StateName[0].name
        }

        return res.status(200).send(result)    
    } 
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.getOrganisatorspesifik = async (req, res) => {
    try {
        const { nim } = req.params

        if(nim === null || nim === ':nim'){
            return res.status(200).send({
                message: 'NIM anda kosong! Harap diisi'
            })
        }

        const cekNIM = await OrganisatorDB.query().where({ nim })
        if(cekNIM.length === 0 || cekNIM === []){
            return res.status(200).send({ 
                message: 'NIM ' + nim + ' tidak ditemukan'
            }) 
        }
            
        const result = await OrganisatorDB.query().where({ nim })
        const Statename = await StateDB.query().select('name').where({ stateID: result[0].stateID })
        result[0].Statenameisi = Statename[0].name

        return res.status(200).send(result)
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

// exports.getUpdate = async (req, res) => {
//     try{
//         const { nim } = req.params

//         if(nim === null || nim === ':nim'){
//             return res.status(404).send({
//                 message: 'NIM anda kosong! Harap diisi'
//             })
//         }

//         const authorizedDiv = ['D01', 'D02']
//         const division = req.division

//         if(!authorizedStatename.includes(Statenameision)){
//             return res.status(403).send({
//                 message: "Divisi anda tidak punya otoritas yang cukup!"
//             })
//         }

//         const cekNIM = await OrganisatorDB.query().where({ nim })
//         if(cekNIM.length === 0 || cekNIM === []){
//             return res.status(404).send({ 
//                 message: 'NIM ' + nim + ' tidak ditemukan!'
//             })
//         }

//         const liatState = await StateDB.query().select('stateID').where({ stateID: cekNIM[0].stateID })
//         if(liatState.length === 0 || liatState === []){
//             return res.status(403).send({
//                 message: "State anda tidak terdaftar!"
//             })
//         }
//         await OrganisatorDB.query().update({
//             isverified: verified
//         }).where({ nim })
//         return res.status(200).send({ message: 'Data berhasil diupdate' })
        
//     }catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }


// exports.updateVerified = async(req, res) => {
//     try{
//         const { nim } = req.params

//         if(nim === null || nim === ':nim'){
//             return res.status(404).send({
//                 message: 'NIM anda kosong! Harap diisi terlebih dahulu'
//             })
//         }

//         const { verified } = req.body
//         const authorizedStatename = ['D01', 'D02', 'D03', 'D04']
//         const Statenameision = req.Statenameision

//         if(!authorizedStatename.includes(Statenameision)){
//             return res.status(403).send({
//                 message: "Statenameisi anda tidak punya otoritas yang cukup!"
//             })
//         }

//         const cekNIM = await OrganisatorDB.query().where({ nim })
//         if(cekNIM.length === 0 || cekNIM === []){
//             return res.status(404).send({ 
//                 message: 'NIM ' + nim + ' tidak ditemukan!'
//             })
//         }

//         if(verified < 0 || verified > 1){
//             return res.status(406).send({ 
//                 message: 'Value hanya boleh angka 0 atau 1 saja!' 
//             })
//         }

//         await OrgDB.query().update({
//             verified
//         }).where({ nim })
//         return res.status(200).send({ message: 'Data berhasil diupdate' })
//     }
//     catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }

// exports.getDelete = async (req, res) => {
//     try {
//         const { nim } = req.params
//         const authorizedStatename = ['D01', 'D02']
//         const division = req.division

//         if(nim === null || nim === ':nim'){
//             return res.status(404).send({
//                 message: 'NIM anda kosong! Harap diisi'
//             })
//         }

//         if(!authorizedStatename.includes(Statenameision)){
//             return res.status(403).send({
//                 message: "Divisi anda tidak punya otoritas yang cukup!"
//             })
//         }

//         const cekNIM = await OrganisatorDB.query().where({ nim })
//         if(cekNIM.length === 0 || cekNIM === []){
//             return res.status(404).send({ 
//                 message: 'NIM ' + nim + ' tidak ditemukan!'
//             })
//         }
    
//         await OrganisatorDB.query().delete().where({ nim })
//         return res.status(200).send({ message: 'Data berhasil dihapus' })
//     }
//     catch (err) {
//         return res.status(500).send({ message: err.message })
//     }
// }