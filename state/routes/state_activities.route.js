const user_middleware = require ('../../user/middleware/middleware')
const state_middleware = require ('../middleware/middleware')
const sActController = require('../controller/state_activities.controller')
const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = app => {

    //Buat Public
    app.get(
        '/api/state_activities/',
        sActController.readState
    )

    // Public Login
    app.get(
        '/api/state/',
        user_middleware.verifyJWT, 
        sActController.readPublicState
    )

    app.get(
        '/api/stateAct',
        user_middleware.verifyJWT, state_middleware.isOrganisatorAndPanitia,
        sActController.readAllState
    )

    app.get(
        '/api/stateAct/:stateID',
        user_middleware.verifyJWT, state_middleware.isOrganisatorAndPanitia, 
        sActController.readSpecificState    
    )

    //Get State Activities by Day
    app.get(
        '/api/stateActivities/:day',
        user_middleware.verifyJWT, user_middleware.isPanitia,
        sActController.readStateByDay
    )

    //Create State Activities
    app.post(
        '/api/stateAct/createState',
        toggle.createState, toggle.checkToggle,
        user_middleware.verifyJWT, user_middleware.isPanitia,      
        sActController.createState
    )

    app.put(
        '/api/stateAct/update/:stateID',
        toggle.updateState, toggle.checkToggle,
        user_middleware.verifyJWT, state_middleware.isOrganisatorAndPanitiaSpesifik,
        sActController.updateState     
    )
    
    app.delete(
        '/api/stateAct/delete/:stateID',
        toggle.deleteState, toggle.checkToggle,
        user_middleware.verifyJWT, user_middleware.isPanitia,
        sActController.deleteState
    )
}