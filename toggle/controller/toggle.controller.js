const toggleDB = require('../model/toggle.model')

exports.readAllToggle = async (req,res) =>{
    try {
        const result = await toggleDB.query()
        return res.status(200).send(result)  
    } 
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.checktoggle = async (req,res) =>{
    try {
        const { id } = req.params
        const result = await toggleDB.query().select('name','toggle').where({ id })
        return res.status(200).send(result)  
    } 
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}

exports.updateToggleValue = async(req,res)=>{
    try {
        const { id } = req.params
        const { toggle } = req.body

        const authorizedDiv = ['D01', 'D02', 'D05']
        const division = req.divisiID
        const cekToggleID = await toggleDB.query().where({ id })
        
        if(!authorizedDiv.includes(division)){
            return res.status(403).send({
                code: 403,
                message: "Divisi anda tidak punya otoritas yang cukup!"
            })
        }

        if(cekToggleID.length === 0 || cekToggleID === []){
            return res.status(404).send({
                code: 404,
                message: "Endpoint pada toggle ID: " + id + " tidak ditemukan!"
            })
        }

        if(toggle < 0 || toggle > 1)
            return res.status(406).send({ message: 'Input value hanya antara 0 atau 1!' })

        await toggleDB.query().update({ toggle }).where({ id })
        return res.status(200).send({ 
            code: 200,
            message: 'Data Toggle berhasil di update' 
        })
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}