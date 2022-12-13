const { query } = require('express');
const connection = require('./db');

//Get all clients
async function clients_list(res) {
    let selectQuery = 'SELECT * FROM Client';    
    connection.query(selectQuery,function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Get a single client
async function get_client(req, res) {
    let selectQuery = 'SELECT * FROM Client WHERE id = ?';    
    connection.query(selectQuery,[req.params.id], function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Create a Client.
async function create_client(req, res, next) {
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