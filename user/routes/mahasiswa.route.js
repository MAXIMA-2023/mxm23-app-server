const {
  register,
  login,
  getProfile,
  getAllStudent,
  getAllStudentWithState,
  getSpecificStudentWithStateByNim,
  getSpecificStudent,
  updateStudent,
  deleteStudent,
  getStatistic,
  sendPasswordRecoveryLink,
  exchangePasswordRecoveryToken
} = require("../controller/mahasiswa.controller");
const {
  verifyJWT,
  isPanitia,
  isMahasiswa,
  rateLimit
} = require("../middleware/middleware");

//import midleware

module.exports = (app) => {
  app.post("/api/mahasiswa/register", register); // API Client
  app.post("/api/mahasiswa/login", login); // API Client
  app.get("/api/mahasiswa/profile", verifyJWT, isMahasiswa, getProfile); // API Client
  
  app.post(
    "/api/mahasiswa/forgot-password", 
    rateLimit,
    sendPasswordRecoveryLink
  );
  app.post(
    "/api/mahasiswa/forgot-password/validate-token", 
    exchangePasswordRecoveryToken
  );


  //give ispanitia middleware
  app.get("/api/mahasiswa/data", verifyJWT, isPanitia, getAllStudent); // API Internal

  // API Internal
  app.get("/api/mahasiswa/data/:nim", verifyJWT, isPanitia, getSpecificStudent); // API Internal
  app.put("/api/mahasiswa/data/:nim", verifyJWT, isPanitia, updateStudent); // API Internal
  app.delete("/api/mahasiswa/data/:nim", verifyJWT, isPanitia, deleteStudent); // API Internal

  app.get("/api/mahasiswa/statistic", verifyJWT, isPanitia, getStatistic);

  // with added state
  app.get(
    "/api/mahasiswa/dataWithState",
    verifyJWT,
    isPanitia,
    getAllStudentWithState
  );
  app.get(
    "/api/mahasiswa/dataWithState/:nim",
    verifyJWT,
    isPanitia,
    getSpecificStudentWithStateByNim
  );


};
