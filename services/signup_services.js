const { query } = require('express');
const connection = require('./db');
const { SHA3 } = require('sha3');
const utils = require('./utils');

//Does the sign up of a new Client
async function signup_client(req, res) {
    //Sanitizar os valores
    const username = req.body.username
    const password = req.body.password
    const publickey = req.body.publickey
    const name = req.body.name
    const selectClient = "SELECT * FROM Client WHERE Client.username LIKE ?";
    
    connection.query(selectClient, req.body.username, function(err, result, fields) {
        if (err) throw err;
        if(result.length != 0){
            res.send(JSON.stringify({error: "Username already exits"}));
            return
        }
        const hash = new SHA3(512);
        hash.update(password);
        const hashpassword = hash.digest('hex');
        const insertClient = "INSERT INTO Client (username, password, publickey, nome) VALUES (?,?,?,?);";
        const params = [req.body.username, hashpassword, req.body.publickey, req.body.name];
        connection.query(insertClient, params, function(err, result, fields) {
            if (err) throw err;
            if(result.affectedRows != 0)
                res.send(JSON.stringify({success: "Account was created "+ username +" as username."}));
            else
                res.send(JSON.stringify({error: "Error creating account."}));
        });
    });
}

module.exports = {
    signup_client
}