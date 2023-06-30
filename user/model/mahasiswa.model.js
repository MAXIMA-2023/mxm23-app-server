const { Model } = require('objection')

class Mahasiswa extends Model {

    static get tableName(){
        return 'mahasiswa';
    }

}

module.exports = Mahasiswa