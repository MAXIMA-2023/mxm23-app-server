const { Model } = require('objection')

class Mahasiswa extends Model {

    static get tableName(){
        return 'mahasiswa';
    }

    static get relationMappings(){
        const StateRegistration = require('../../state/model/state_registration.model');
        return {
            state_registration : {
                relation : Model.HasManyRelation, 
                modelClass : StateRegistration, 
                join : {
                    from : 'mahasiswa.nim', 
                    to : 'state_registration.nim'
                }
            }
        }
    }

}

module.exports = Mahasiswa