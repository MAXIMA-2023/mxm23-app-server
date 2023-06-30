const {
    register, 
    login, 
    getAllStudent, 
    getSpecificStudent, 
    updateStudent, 
    deleteStudent
} = require("../controller/mahasiswa.controller");

//import midleware

module.exports = (app) => { 
    app.post('/api/mahasiswa/register', register);  // API Client
    app.post('/api/mahasiswa/login', login); // API Client
    //give ispanitia middleware
    app.get('/api/mahasiswa', getAllStudent); // API Internal
    app.get('/api/mahasiswa/:nim', getSpecificStudent); // API Internal
    app.put('/api/mahasiswa/update/:nim', updateStudent); // API Internal
    app.delete('/api/mahasiswa/delete/:nim', deleteStudent); // API Internal
}