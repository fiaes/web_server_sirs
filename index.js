const express = require('express');
const app = express();
var createError = require('http-errors');
var routes = require('./routes/routes');
<<<<<<< HEAD
const fs = require('fs');
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: "192.168.0.100",
    user: "nodejs",
    password: "password",
    database: "remotedb",
    ssl: {
        ca: fs.readFileSync(__dirname + '/certs/ca.pem'),
        key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
        cert: fs.readFileSync(__dirname + '/certs/client-cert.pem')
    }
});
=======
const connection = require('./services/db');
var crypto = require('crypto');


var fs = require('fs');

var public_key = fs.readFileSync('./serverkeys/public.key');
var private_key = fs.readFileSync('./serverkeys/server.key');



// Generate Alice's keys...
const alice = crypto.createDiffieHellman(1024);
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = crypto.createDiffieHellman(alice.getPrime(), alice.getGenerator());
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// OK
console.log(aliceSecret.toString('hex') == bobSecret.toString('hex'))


const sign = crypto.createSign('SHA256');
sign.write('some data to sign');
sign.end();
const signature = sign.sign(private_key, 'hex');

const verify = crypto.createVerify('SHA256');
verify.write('some data to sign');
verify.end();
console.log(verify.verify(public_key, signature, 'hex'));



/*var buffer = Buffer.from("Ola123");
var data_encrypted = crypto.privateEncrypt(private_key, buffer) 

console.log(crypto.publicDecrypt(public_key, data_encrypted).toString('utf-8'))*/
>>>>>>> dfd131d7df32a1c6f944f6a02e53e46902a7b07d


//connection.connect();
//var cors = require("cors");
//app.use(cors());
const PORT = 3080;
app.listen(PORT, () => {
    console.log('server running at 3080');
   });
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send('Not found');
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
});

//connection.end();
module.exports = app;
