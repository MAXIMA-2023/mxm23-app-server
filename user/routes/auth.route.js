const authController = require('../controller/auth.controller');
const {isOrganisatorAndPanitia} = require('../../state/middleware/middleware');
const { verifyJWT } = require('./middleware/middleware');

module.exports = function(app){
    app.get(
        '/api/internal/login',
        verifyJWT,
        isOrganisatorAndPanitia,
        authController.loginpanitorganisator
    )
}