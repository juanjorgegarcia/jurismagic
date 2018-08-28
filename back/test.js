const express = require('express')
const app = express()
const mysql = require('mysql')
const port = 5000
const credentials = require('./credentials')

let con = mysql.createConnection({
  host: "localhost",
  user: credentials.user,
  password: credentials.pass,
  database : 'jurisprudencia_2_inst'
})


async function resolveQuery(query) {
    return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const pyprog = spawn('python3', ['./../ranking/search.py',query,credentials.user,credentials.pass]);

        pyprog.stdout.on('data', (data) => {
            let parsedData = JSON.parse(data)
            console.log(parsedData)

            let sql = "SELECT * FROM jurisprudencia_2_inst WHERE id IN (0"
            // console.log(sql)
            parsedData.forEach(element => {
                sql = sql + `,${element}`
            });
            sql = sql+")"
            console.log(sql)
            con.query(sql,function (err, result) {
                if (err) throw err
                // console.log(result)
                resolve(result)
                // console.log(result)
            })
            
    
        });
    
        pyprog.stderr.on('data', (data) => {
            console.log("Timeout: Nenhum documento foi encontrado")
            reject(data);
        });

    })     


    

}


con.connect()
// const sql = `SELECT texto_decisao FROM jurisprudencia_2_inst WHERE id IN ({data})

app.get('/q', async function(req, res, next) {
    console.log(req.query.text)

    let fromRunpy = await resolveQuery(req.query.text)
    // console.log(JSON.stringify(fromRunpy))
    res.json(fromRunpy)

})  
 

app.listen(port, 'localhost', () => {
    console.log(`server started @ localhost:${port}`)
})

// module.exports = app;
