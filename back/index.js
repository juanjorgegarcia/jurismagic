const express = require('express')
const app = express()
const mysql = require('mysql')
const port = 5000

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : 'jurisprudencia_2_inst'
})

con.connect()

app.get('/q', function(req, res, next) {
    console.log(req.query.text)
    const sql = `SELECT * FROM jurisprudencia_2_inst WHERE texto_decisao LIKE '%${req.query.text}%' LIMIT 5`
    con.query(sql, function (err, result) {
    if (err) throw err
    res.json(result)
    })
})

app.listen(port, 'localhost', () => {
    console.log(`server started @ localhost:${port}`)
})

// module.exports = app;
