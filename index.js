require('dotenv/config')
const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(fileUpload())

//user
require('./user/routes/divisi.route')(app)
require('./user/routes/mahasiswa.route')(app)
require('./user/routes/organisator.route')(app)
require('./user/routes/panitia.route')(app)

//state
require('./state/routes/day_management.route')(app)
require('./state/routes/state_activities.route')(app)
require('./state/routes/state_registration.route')(app)

app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to MAXIMA 2023 API</h1>')
})

const PORT = process.env.PORT || 80 
app.listen(PORT, () =>{
    console.log(`Listening to the server ${PORT}`)
})



/*
home = semua bole masuk maba dan matu
state = hanya maba
malam puncak = maba gratis, maba ga lolos dan external bayar
*/