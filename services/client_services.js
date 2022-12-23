const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

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
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Client WHERE id = ?';    
    connection.query(selectQuery,[req.params.id], function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

//Get a client by his token
async function get_client_by_token(req, res){
    console.log("GET_CLIENT_BY_TOKEN");
    var params = [req.params.rnd_hash];
    const selectSession = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE ?;";
    connection.query(selectSession, params, function(err, result, fields) {
        if (err) throw err;
        if(result.length != 0){
            const clientID = result[0].clientID;
            const selectClient = "SELECT id,nome, morada FROM Client WHERE Client.id = ?";
            connection.query(selectClient, clientID, function(err, result2, fields) {
                if (err) throw err;
                res.send(JSON.stringify(result2));
            });
        }
    });
}

// Create a Client.
async function create_client(req, res, next) {
    var params = [req.body.username, req.body.nome, req.body.password, req.body.morada];
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Client (username, nome, password, morada) VALUES (?, ?, ?, ?)";
    
    connection.query(selectQuery,params, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
};

module.exports = {
    clients_list,
    get_client,
    get_client_by_token,
    create_client
}