const { Model } = require('objection');
const knex = require('../../config/knex')

Model.knex(knex)

class MalpunTransaction extends Model{
    static get tableName(){
        return 'malpun_transaction';
    }

    static get relationMappings(){ 
        const Mahasiswa = require('../../user/model/mahasiswa.model');
        return {
            mahasiswa :{
                relation: Model.BelongsToOneRelation,
                modelClass: Mahasiswa,
                join:{
                    from: 'malpun_transaction.nim',
                    to: 'mahasiswa.nim'
                }
            }
        }
    }
}

module.exports = MalpunTransaction;