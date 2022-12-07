const { query } = require('express');
const connection = require('./db');

//Get all clients
async function clients_list() {
    if(err) throw err;
    let selectQuery = 'SELECT * FROM Client';    
    connection.query(selectQuery,function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
}

// Get a single client
async function get_client(username) {
    if(err) throw err;
    let selectQuery = 'SELECT * FROM Client WHERE username = ?';    
    connection.query(selectQuery,[username], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
}

// Create a Client.
async function create_client(req, res, next) {
    if (err) throw err;
    var selectQuery = "INSERT INTO Client (username, nome, password, morada) VALUES (?, ?, ?, ?)";
    var params = [req.body.username, req.body.nome, req.body.password, req.body.morada]
    connection.query(selectQuery,params, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
};

module.exports = {
    clients_list,
    get_client,
    create_client
}