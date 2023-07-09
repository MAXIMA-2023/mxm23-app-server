const { Model } = require('objection')
const knex = require('../../config/knex') 

Model.knex(knex)

class State_Activities extends Model { 
    static get tableName(){
        return 'state_activities'
    }

    static get relationMappings(){ 
        const Day_Management = require('./day_management.model')
        const StateRegistration = require('../../state/model/state_registration.model');
        return {
            day_management:{
                relation: Model.HasManyRelation,
                modelClass: Day_Management,
                join:{
                    from: 'state_activites.day',
                    to: 'day_management.day'
                }
            }, 
            state_registration : {
                relation: Model.HasManyRelation,
                modelClass: StateRegistration,
                join:{
                    from: 'state_activites.stateID',
                    to: 'state_registration.stateID'
                }
            }            
        }
    }
}

module.exports = State_Activities