const { Model } = require('objection')
const knex = require('../../config/knex') 

Model.knex(knex)

class State_Registration extends Model { 
    static get tableName(){
        return 'state_registration'
    }

    static get relationMappings(){ 
        const Mahasiswa = require('../../user/model/mahasiswa.model');
        const StateActivities = require('../model/state_activities.model');
        return {
            mahasiswa : { 
                relation: Model.BelongsToOneRelation,
                modelClass: Mahasiswa,
                join:{
                    from: 'state_registration.nim',
                    to: 'mahasiswa.nim'
                }
            }, 
            state_activities : { 
                relation: Model.BelongsToOneRelation,
                modelClass: StateActivities,
                join:{
                    from: 'state_registration.stateID',
                    to: 'state_activities.stateID',
                }
            }            
        }
    }    
}

module.exports = State_Registration