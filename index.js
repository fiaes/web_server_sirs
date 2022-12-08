/*
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
//var cors = require("cors");
//app.use(cors());
app.listen(3019);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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
*/

const express = require("express");
const app = express();
const port = 3019;
const programmingLanguagesRouter = require("./routes/programmingLanguages");
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.get("/", (req, res) => {
    res.json({ message: "Connected!" });
});
app.use("/clients", programmingLanguagesRouter);
/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});