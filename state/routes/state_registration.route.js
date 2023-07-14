const stateRegController = require('../controller/state_registration.controller')
const middleware = require ('../../user/middleware/middleware')
const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = function (app){
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