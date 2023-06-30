const organisatorController = require('../controller/organisator.controller');
const middleware = require('../middleware/middleware')

module.exports = function(app){
    
    app.post(
        '/api/organisator/register',
        organisatorController.registerOrganisator
    )

    app.post(
        '/api/organisator/login',
        organisatorController.loginOrganisator
    )

    app.get(
        '/api/organisator/get',
        organisatorController.getOrganisator
    )
    app.get(
        '/api/organisator/get/:nim',
        organisatorController.getOrganisatorspesifik
    )

    app.put(
        '/api/organisator/update/:nim',
        middleware.verifyJWT, 
        middleware.isPanitia,
        organisatorController.getUpdate
    )

    app.put(
        '/api/organisator/updateAcc/:nim',
        middleware.verifyJWT, middleware.isPanitia,
        organisatorController.updateVerified
    )

    app.delete(
        '/api/organisator/delete/:nim',
        middleware.verifyJWT, 
        middleware.isPanitia,
        organisatorController.getDelete
    )
}