const PanitController = require('../controller/panitia.controller')
// const validation = require('../validation/validate')
const middleware = require('../middleware/middleware')
// const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = function(app){
    app.post('/api/panit/register',PanitController.register)

    app.post('/api/panit/login',PanitController.login)

    app.get('/api/panit',
        middleware.verifyJWT, 
        middleware.isPanitia,
        PanitController.readAllData
    )

    app.get('/api/panit/:nim',
        middleware.verifyJWT, 
        middleware.isPanitia,
        PanitController.readSpecificData
    )

    app.put('/api/panit/update/:nim',
        middleware.verifyJWT, 
        middleware.isPanitia,     
        PanitController.updateData
    )

    app.put('/api/panit/updateVerified/:nim',
        middleware.verifyJWT, 
        middleware.isPanitia,    
        PanitController.updateVerified
    ) 
        
    app.delete('/api/panit/delete/:nim',
        middleware.verifyJWT, 
        middleware.isPanitia,
        PanitController.deleteData
    )
}