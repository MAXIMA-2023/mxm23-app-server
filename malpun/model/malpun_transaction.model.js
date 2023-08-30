const { Model } = require('objection');
const knex = require('../../config/knex')

Model.knex(knex)

class MalpunTransaction extends Model{
    static get tableName(){
        return 'malpun_transaction';
    }

    static get relationMappings(){}
}

module.exports = MalpunTransaction;