const toggle = require('../controller/toggle.controller')
const middleware = require('../../user/middleware/middleware')

module.exports = function(app){
    app.get(
        '/api/toggle/',
        toggle.readAllToggle
    )

    app.put(
        '/api/toggle/updateToggle/:id',
        middleware.verifyJWT, middleware.isPanitia,
        toggle.updateToggleValue
    )

    app.get(
        '/api/toggle/check/:id',
        toggle.checktoggle
    )
}