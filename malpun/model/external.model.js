const { Model } = require('objection')

class External extends Model {

    static get tableName(){
        return 'external';
    }

}

module.exports = External;