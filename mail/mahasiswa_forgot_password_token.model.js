const { Model } = require('objection')

class MahasiswaForgotPasswordTokenStorage extends Model {

    static get tableName(){
        return 'mahasiswa_password_recovery_token';
    }

}

module.exports = MahasiswaForgotPasswordTokenStorage