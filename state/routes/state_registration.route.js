const stateRegController = require('../controller/state_registration.controller')
const middleware = require ('../../user/middleware/middleware')
const toggle = require('../../toggle/middleware/toggle.middleware')
const state_middleware = require ('../middleware/middleware')

module.exports = function (app){
    app.get(
        '/api/state/data',
        middleware.verifyJWT,
        state_middleware.isOrganisatorAndPanitia,
        stateRegController.readAllReg
    )

    app.get(
        '/api/state/data/:nim',
        middleware.verifyJWT,
        state_middleware.isOrganisatorAndPanitiaSpesifik,
        stateRegController.readSpecificReg
    )
    //untuk organisator
    app.get(
        '/api/stateRegBySID/data/:stateID',
        middleware.verifyJWT,
        state_middleware.isOrganisatorAndPanitia,
        stateRegController.readStateRegByStateID
    )
    app.get(
        '/api/stateRegByDay/data/:day',
        middleware.verifyJWT,
        state_middleware.isOrganisatorAndPanitiaSpesifik,
        stateRegController.readStateRegByDay
    )
    // app.put(
    //     '/api/stateReg/updateReg/:stateID/:nim',// 
    //     middleware.verifyJWT,
    //     state_middleware.isOrganisatorAndPanitiaSpesifik,
    //     toggle.updateState,
    //     stateRegController.updateRegData
    // )
    app.delete(
        '/api/state/data/:stateID/:nim',
        middleware.verifyJWT,
        state_middleware.isOrganisatorAndPanitiaSpesifik,
        toggle.deleteState,
        stateRegController.deleteRegData
    )

    app.post('/api/state/registration', 
        middleware.verifyJWT, 
        middleware.isMahasiswa, 
        stateRegController.handleRegistration
    );

    app.delete('/api/state/cancel_registration/:stateID',
        middleware.verifyJWT, 
        middleware.isMahasiswa, 
        stateRegController.cancelRegistration
    ); 

    app.post('/api/state/attendance/first',     
        middleware.verifyJWT, 
        middleware.isPanitia,
        stateRegController.handleFirstAttendance
    );

    app.post('/api/state/attendance/last',     
        middleware.verifyJWT, 
        middleware.isPanitia,
        stateRegController.handleLastAttendance
    );    
}