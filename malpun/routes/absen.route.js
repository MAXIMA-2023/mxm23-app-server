const absenController = require('../controller/absen.controller')
const middleware = require('../../user/middleware/middleware')

module.exports= (app) => {   

    app.post(
        '/api/abseninternal/:nim',
        middleware.verifyJWT,
        middleware.isPanitia,
        absenController.absenmalpuninternal
    );

    // app.put(
    //     '/api/absenexternal/:nim',
    //     absenController.absenmalpunexternal
    // )

};