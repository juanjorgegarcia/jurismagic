const express = require('express')
const app = express()
const mysql = require('mysql')
const port = 5000
var http = require('http')
var socketIo = require('socket.io');
const credentials = require('./credentials')
const fs = require("fs")
// const child_process = require("child_process");
const path = require('path')
const json2csv = require('json2csv').parse;
// const serveIndex = require('serve-index');

const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static(path.join(__dirname, '/front/build')));
app.use(express.static(path.join(__dirname, '/public')));
io.emit("alo", "socket funfou")
io.on('connection', function (socket) {
    io.emit('news','user connected');
      console.log('çonectou');
    
  });
// var socket = io.connect();
// console.log('check 1', socket.connected);
// socket.on('connect', function() {
//   console.log('check 2', socket.connected);
// });
app.use('/data', express.static(path.join(__dirname + '/data')));
console.log(path.join(__dirname + '/data'))

console.log(path.join(__dirname, 'public/'))


let con = mysql.createConnection({
    host: "localhost",
    user: credentials.user,
    password: credentials.pass,
    database: 'jurisprudencia_2_inst'
})

con.connect()

app.get('/q', function (req, res, next) {
    // req.setTimeout(0) // no timeout
    console.log(req.query.text)
    const sql = `SELECT SQL_CALC_FOUND_ROWS  * FROM jurisprudencia_2_inst WHERE 
    texto_decisao LIKE '%${req.query.text}%' LIMIT 5`
    
    con.query(sql, function (err, result) {
        if (err) throw err
        res.json(result)
        
    })
    
    con.query(`SET @rows = FOUND_ROWS()`, function (err, result) {
        if (err) throw err
        res.end()
        // console.log(result)
    })


})


app.get('/count', function (req, res, next) {
    console.log(req.query.text)

    const sql = `SELECT @rows `

    con.query(sql, function (err, result) {
        if (err) throw err
        // res.json(result)
        // io.emit("comecou","alo galera")
        io.emit("count", result)


    })

})



app.get('/download', function (req, res, next) {
    console.log(req.query.text)
    const sql = `SELECT * FROM jurisprudencia_2_inst WHERE 
    texto_decisao LIKE '%${req.query.text}%'`
    res.send("Request chegou")
    let query = con.query(sql)
    query.on('error', function (err) {
            // Handle error, an 'end' event will be emitted after this as well
        })
        .on('fields', function (fields) {
            // the field packets for the rows to follow
        })
        .on('result', function (row) {
            // Pausing the connnection is useful if your processing involves I/O
            
            // console.log("entrou no result")
            con.pause();

            const newLine = "\r\n";

            let fields = ['id', 'tribunal', "numero", "assunto", "classe", "data_decisao",
                "orgao_julgador", "julgador", "texto_decisao", "relatorio", "fundamentacao", "dispositivo",
                "polo_ativo", "polo_passivo", "origem", "classificacao", "classificacao_auto"
            ];
            // console.log(row)
            let string = JSON.stringify(row)
            let rowJSON = JSON.parse(string)
            // console.log(rowJSON)

            let toCsv = {
                data: rowJSON,
                fields: fields
            };

            fs.stat(`./data/${req.query.text}.csv`, function (err, stat) {
                if (err == null) {
                    console.log('File exists');

                    //write the actual data and end with newline
                    var csv = json2csv(toCsv) + newLine;

                    fs.appendFile(`./data/${req.query.text}.csv`, csv, function (err) {
                        if (err) throw err;
                        console.log('The "data to append" was appended to file!');
                    });
                } else {
                    //write the headers and newline
                    console.log('New file, just writing headers');
                    fields = (fields + newLine);

                    fs.writeFile(`./data/${req.query.text}.csv`, fields, function (err, stat) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                    //write the actual data and end with newline
                    let csv = json2csv(toCsv) + newLine;

                    fs.appendFile(`./data/${req.query.text}.csv`, csv, function (err) {
                        if (err) throw err;
                        console.log('The "data to append" was appended to file!');
                    });
                }
            });
            // console.log(JSON.stringify(row))
            con.resume();

        })
        .on('end', function () {
            // all rows have been received
            spawn = require('child_process').spawn;
            zip = spawn('zip',['-X' , `./data/${req.query.text}.zip`, `./data/${req.query.text}.csv`]);
            zip.on('exit', function(code) {
                console.log("The file has been zipped")
                // res.sendFile(path.join(__dirname + `/data/${req.query.text}.zip`))
                io.emit("download", true)
                console.log(code)
            });
            
        });

})

// app.listen(port, 'localhost', () => {
//     console.log(`server started @ localhost:${port}`)
// })

server.listen(port, () => console.log(`Listening on port ${port}`))


// module.exports = app;