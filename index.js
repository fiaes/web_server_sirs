const express = require('express')
const app = express()
const fs = require('fs');
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host:"192.168.0.100",
  user:"nodejs",
  password:"password",
  database:"remotedb",
  ssl: {
    ca: fs.readFileSync(__dirname + '/certs/ca.pem'),
    key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
    cert: fs.readFileSync(__dirname + '/certs/client-cert.pem')
  }
});


connection.connect();
connection.query('SELECT * FROM Client', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results);
});

connection.end();