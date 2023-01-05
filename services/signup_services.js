const { query } = require('express');
const connection = require('./db');
const crypto = require('crypto');
const utils = require('./utils');

//Does the sign up of a new Client
async function signup_client(req, res) {
    //Sanitizar os valores
    const username = req.body.username
    const password = req.body.password
    const selectClient = "SELECT * FROM Client WHERE Client.username LIKE ?";
    
    connection.query(selectClient, req.body.username, function(err, result, fields) {
        if (err) throw err;
        if(result.length != 0){
            res.send(JSON.stringify({error: "Username already exits"}));
            return
        }

        //creating hash object 
        var hash = crypto.createHash('sha512');
        //passing the data to be hashed
        const salt = crypto.randomBytes(8).toString('hex');
        console.log(salt)

        data = hash.update(salt + password, 'utf-8');
        //Creating the hash in the required format
        const hashpassword= data.digest('hex');

        

        const insertClient = "INSERT INTO Client (username, password, nome, salt) VALUES (?,?,?,?);";
        const params = [req.body.username, salt + hashpassword, req.body.name, salt];
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