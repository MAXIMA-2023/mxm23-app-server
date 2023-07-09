const dayMan = require('../controller/day_management.controller')
const middleware = require('../../user/middleware/middleware')

module.exports = function (app){
    app.get(
        '/api/dayManagement/',
        middleware.verifyJWT, 
        dayMan.readAllData
    )
}
