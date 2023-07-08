const {
    register, 
    login, 
    getAllStudent, 
    getSpecificStudent, 
    updateStudent, 
    deleteStudent
} = require("../controller/mahasiswa.controller");
const { verifyJWT, isPanitia } = require('../middleware/middleware');

//import midleware

module.exports = (app) => { 

    app.post('/api/mahasiswa/register', register);  // API Client
    app.post('/api/mahasiswa/login', login); // API Client
    //give ispanitia middleware
    app.get('/api/mahasiswa', verifyJWT, isPanitia, getAllStudent); // API Internal
    app.get('/api/mahasiswa/:nim', verifyJWT, isPanitia, getSpecificStudent); // API Internal
    app.put('/api/mahasiswa/update/:nim', verifyJWT, isPanitia, updateStudent); // API Internal
    app.delete('/api/mahasiswa/delete/:nim', verifyJWT, isPanitia, deleteStudent); // API Internal
}