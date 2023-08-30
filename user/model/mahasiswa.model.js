const { Model } = require('objection')

class Mahasiswa extends Model {

    static get tableName(){
        return 'mahasiswa';
    }

    static get relationMappings(){
        const StateRegistration = require('../../state/model/state_registration.model');
        const MalpunTransaction = require('../../malpun/model/malpun_transaction.model');
        return {
            state_registration : {
                relation : Model.HasManyRelation, 
                modelClass : StateRegistration, 
                join : {
                    from : 'mahasiswa.nim', 
                    to : 'state_registration.nim'
                }
            }, 
            malpun_transaction : {
                relation : Model.HasManyRelation, 
                modelClass : MalpunTransaction, 
                join : {
                    from : 'mahasiswa.nim', 
                    to : 'malpun_transaction.nim'
                }                
            }
        }
    }

}

module.exports = Mahasiswa