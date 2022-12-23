const express = require('express');
const app = express();
var createError = require('http-errors');
var routes = require('./routes/routes');
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


connection.connect();
const cors = require('cors');
app.use(cors());
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
