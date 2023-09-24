const { Model } = require('objection');
const knex = require('../../config/knex')

Model.knex(knex)

class External extends Model{
    static get tableName(){
        return 'external';
    }
}

module.exports = External;