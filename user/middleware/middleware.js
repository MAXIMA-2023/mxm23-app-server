const jwt = require("jsonwebtoken");
const PanitiaDB = require("../model/panitia.model");

exports.verifyJWT = async(req, res, next)=>{
    const token = req.headers['x-access-token']
    if(!token){
        return res.status(403).send({ message: "Harap login terlebih dahulu!" })
    }

    await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({ message: "Unauthorized!" })
        }

        req.decoded_nim = decoded.nim
        next()
    })
}

exports.isPanitia = async(req, res, next)=>{
    try{
        const nim = req.decoded_nim
        const data = await PanitiaDB.query().where({ nim })

        if(data.length === 0){
            return res.status(200).send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" })
        }

        req.divisiID = data[0].divisiID 
        
        next()
    }
    catch(err){
        return res.status(500).send({ message: err.message })
    }
}

exports.isOrganisator = async(req, res, next)=>{
    try{
        const nim = req.decoded_nim
        const data = await OrgDB.query().where({ nim })

        if(data.length === 0){
            return res.status(200).send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" })
        }

        next()
    }
    catch(err){
        return res.status(500).send({ message: err.message })
    }
}

