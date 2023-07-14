const OrganisatorDB = require('../model/organisator.model');
const StateDB = require('../../state/model/state_activities.model');
const PanitDB = require('../model/panitia.model');
const DivisiDB = require('../model/divisi.model');
const { validateEmptyEntries } = require("../../helpers/FormValidator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginpanitorganisator = async (req, res, next) => {
    try {
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

        const cekOrg = await OrganisatorDB.query().where({ nim })
        const cekPanit = await PanitDB.query().where({ nim })

        if(cekOrg.length === 0 && cekPanit.length === 0){
            return res.status(400).send({
                message: 'Akun anda belum terdaftar'
            })
        }

        if(cekOrg.length !== 0){
            const passwordIsValid = bcrypt.compareSync(password, cekOrg[0].password)
            if(!passwordIsValid){
                return res.status(401).send({
                    message: 'Password salah!'
                })
            }
        }else if(cekPanit.length !== 0){
            const passwordIsValid = bcrypt.compareSync(password, cekPanit[0].password)
            if(!passwordIsValid){
                return res.status(401).send({
                    message: 'Password salah!'
                })
            }
        }   

        const JWTtoken = jwt.sign({ 
            name: cekOrg[0].name,
            nim: cekOrg[0].nim,
            email: cekOrg[0].email,
            role: 'organisator',
            stateName: cekOrg[0].name,
            stateID: getStateName[0].stateID
        },process.env.JWT_SECRET, {
            expiresIn: 86400 //equals to 24H
        })

    }catch(err){
        return res.status(500).send({message: err.message})
    }
}