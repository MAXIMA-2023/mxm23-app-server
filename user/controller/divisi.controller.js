const DivisiDB = require('../model/divisi.model')

exports.getDivisi = async (req, res) => {
    try {
        const result = await DivisiDB.query()
        return res.status(200).send(result)
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}