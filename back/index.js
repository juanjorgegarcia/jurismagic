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
app.use('/data', express.static(path.join(__dirname + '/data')));
console.log(path.join(__dirname + '/data'))

console.log(path.join(__dirname, 'public/'))
io.on('connection', function (socket) {
    io.emit('news','user connected');
    console.log('çonectou');
    console.log(socket.id)
    io.emit('teste','ronaldo')
    io.to(socket.id).emit('individualId',`esse e o id: ${socket.id}`)

    let con = mysql.createConnection({
        host: "localhost",
        user: credentials.user,
        password: credentials.pass,
        database: 'jurisprudencia_2_inst'
    })
    
    con.connect()
    // socket.on('/q', (data) => {
    //     console.log(`ClientID:${socket.id}, msg:${data}`)

    //     console.log(JSON.stringify(data))
    //     splitedQuery = data.split(" ")
    
    //     let sql = `SELECT * FROM jurisprudencia_2_inst WHERE 
    //      `
    //     splitedQuery.forEach(element => {
    //         sql = sql + ` texto_decisao LIKE '%${element}%' AND` 
    //     });
    //     sql = sql.substring(0,sql.length-3) + 'LIMIT 5'
        
    //     con.query(sql, function (err, result) {
    //         if (err) throw err
    //         // res.json(result)
    //         setTimeout(()=>{
    //             io.to(socket.id).emit('preview',result)

    //         },1000)
    //         console.log('First 5 docs Found!')
    //     })
  
    //   })
    //   socket.on('/killQuery', (data) => {
    //     console.log(con.threadId)
    //     let oldConID = con.threadId
    //     console.log(data.killQuery)
    //     if (data.killQuery && (data.counting || data.buildingArchives == 1)){
    //         try {
    //             let con = mysql.createConnection({
    //                 host: "localhost",
    //                 user: credentials.user,
    //                 password: credentials.pass,
    //                 database: 'jurisprudencia_2_inst'
    //             })
                
    //             con.connect()
    //             con.query("KILL QUERY " + oldConID, function(err) {
    //                 if (err) throw err;
    //                 console.log("I have interrupted the executing query for a new request");
    //                 io.to(socket.id).emit("count", null)

    
    //             });
    //             con.end(()=>{
    //                 console.log('New Connection ended!')
    //             }) 
    //         } catch (error) {
    //             console.log('There is no query')
            
    //         }
    
    //     }
    //     else{
    //         console.log('There is no query')
    
    //     }
  
    //   })
    //   socket.on('/count', (data) => {
    //     console.log(data)
    //     let splitedQuery = data.split(" ")
    
    
    //     let sql = `SELECT count(id) FROM jurisprudencia_2_inst WHERE `
        
    //     splitedQuery.forEach(element => {
    //         sql = sql + ` texto_decisao LIKE '%${element}%' AND` 
    //     });
    //     sql = sql.substring(0,sql.length-3) + 'LIMIT 5'
        
    //     con.query(sql, function (err, result) {
    //         if (err) {
    //             console.log('Query Cancelada')
    //             io.to(socket.id).emit("count", null)
    //         }
    //         // res.json(result)
    //         if (result){
    //             io.to(socket.id).emit("count", result)
    //             console.log(`${result[0]['count(id)']} docs found!`)
    //         }
    
    
    
    //     })
  
    //   })
      socket.on('/download', (data) => {
        console.log('chegou')
        let downloadInfo = JSON.parse(data)
        let docsId = downloadInfo.docsId
        
        console.log(downloadInfo)
        let sql = `SELECT * FROM jurisprudencia_2_inst WHERE id in (`
        let splitedQuery = downloadInfo.query.split(" ")    

        docsId.forEach((id)=>{
            sql = sql + id + ','
        })
        sql = sql.substring(0,sql.length-1) +')'
        console.log(sql)
        let filename = ''
        splitedQuery.forEach(element => {
            filename = filename + element +"_"
        });
        filename = filename.substring(0,filename.length-1)
        console.log(filename)
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
    
                // let toCsv = {
                //     data: rowJSON,
                //     fields: fields
                // };
                let toCsv = rowJSON
                fs.stat(`./data/${filename}.json`, function (err, stat) {
                    if (err == null) {
                        console.log('File exists');
                        //write the actual data and end with newline
                        var csv = toCsv + newLine;
                        console.log('penis')
                        console.log(csv)

                        fs.appendFile(`./data/${filename}.json`, csv, function (err) {
                            if (err) throw err;
                            console.log('The "data to append" was appended to file!');
                        });
                    } else {
                        //write the headers and newline
                        console.log('New file, just writing headers');
                        fields = (fields + newLine);
    
                        fs.writeFile(`./data/${filename}.json`, fields, function (err, stat) {
                            if (err) throw err;
                            console.log('file saved');
                        });
                        //write the actual data and end with newline
                        let csv = (toCsv) + newLine;
    
                        fs.appendFile(`./data/${filename}.json`, csv, function (err) {
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
                zip = spawn('zip',['-X' , `./data/${filename}.zip`, `./data/${filename}.`]);
                zip.on('exit', function(code) {
                    console.log("The file has been zipped")
                    // res.sendFile(path.join(__dirname + `/data/${req.query.text}.zip`))
                    io.to(socket.id).emit("download", true)
                    console.log(code)
                });
                
            });
  
      })
});
  


server.listen(port, () => console.log(`Listening on port ${port}`))


// module.exports = app;