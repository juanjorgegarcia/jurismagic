let express = require('express')
let app = express()
let mysql = require('mysql')
let port = 5000
var http = require('http')
var socketIo = require('socket.io');
let credentials = require('./credentials')
let fs = require("fs")
// let child_process = require("child_process");
let path = require('path')
let json2csv = require('json2csv').parse;
// let serveIndex = require('serve-index');

let server = http.createServer(app)
let io = socketIo(server)

app.use(express.static(path.join(__dirname, '/front/build')));
app.use(express.static(path.join(__dirname, '/public')));
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
    console.log(con.threadId)
    console.log(req.query.text)
    splitedQuery = req.query.text.split(" ")

    let sql = `SELECT * FROM jurisprudencia_2_inst WHERE 
     `
    splitedQuery.forEach(element => {
        sql = sql + ` texto_decisao LIKE '%${element}%' AND` 
    });
    sql = sql.substring(0,sql.length-3) + 'LIMIT 5'
    
    con.query(sql, function (err, result) {
        if (err) throw err
        // res.json(result)
        io.emit("preview", result)

        console.log('First 5 docs Found!')
    })

})
app.get('/killQuery', function (req, res, next) {
    // req.setTimeout(0) // no timeout
    console.log(con.threadId)
    let oldConID = con.threadId
    console.log(req.query.killQuery)
    if (req.query.killQuery && (req.query.counting || req.query.buildingArchives == 1)){
        try {
            let con = mysql.createConnection({
                host: "localhost",
                user: credentials.user,
                password: credentials.pass,
                database: 'jurisprudencia_2_inst'
            })
            
            con.connect()
            con.query("KILL QUERY" + oldConID, function(err) {
                if (err) throw err;
                console.log("I have interrupted the executing query for a new request");
                io.emit("count", null)

            });
            con.end(()=>{
                console.log('New Connection ended!')
            }) 
        } catch (error) {
            console.log('There is no query')
        
        }

    }
    else{
        console.log('There is no query')

    }

})



app.get('/count', function (req, res, next) {
    console.log(req.query.text)
    let splitedQuery = req.query.text.split(" ")


    let sql = `SELECT count(id) FROM jurisprudencia_2_inst WHERE `
    
    splitedQuery.forEach(element => {
        sql = sql + ` texto_decisao LIKE '%${element}%' AND` 
    });
    sql = sql.substring(0,sql.length-3) + 'LIMIT 5'
    
    con.query(sql, function (err, result) {
        if (err) throw err
        // res.json(result)
        io.emit("count", result)
        console.log(`${result[0]['count(id)']} docs found!`)


    })

})



app.get('/download', function (req, res, next) {
    console.log(req.query.text)
    let sql = `SELECT * FROM jurisprudencia_2_inst WHERE `
    let splitedQuery = req.query.text.split(" ")    
    splitedQuery.forEach(element => {
        sql = sql + ` texto_decisao LIKE '%${element}%' AND` 
    });
    sql = sql.substring(0,sql.length-3) + 'LIMIT 5'
    

    let filename = ''
    splitedQuery.forEach(element => {
        filename = filename + element +"_"
    });
    filename = filename.substring(0,filename.length-1)
    console.log(filename)

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

            let newLine = "\r\n";

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

            fs.stat(`./data/${filename}.csv`, function (err, stat) {
                if (err == null) {
                    console.log('File exists');

                    //write the actual data and end with newline
                    var csv = json2csv(toCsv) + newLine;

                    fs.appendFile(`./data/${filename}.csv`, csv, function (err) {
                        if (err) throw err;
                        console.log('The "data to append" was appended to file!');
                    });
                } else {
                    //write the headers and newline
                    console.log('New file, just writing headers');
                    fields = (fields + newLine);

                    fs.writeFile(`./data/${filename}.csv`, fields, function (err, stat) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                    //write the actual data and end with newline
                    let csv = json2csv(toCsv) + newLine;

                    fs.appendFile(`./data/${filename}.csv`, csv, function (err) {
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
            zip = spawn('zip',['-X' , `./data/${filename}.zip`, `./data/${filename}.csv`]);
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