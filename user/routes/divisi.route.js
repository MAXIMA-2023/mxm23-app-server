const divisiController = require('../controller/divisi.controller');

module.exports = function(app){
    app.get(
        '/api/divisi',
        divisiController.getDivisi
    )
}