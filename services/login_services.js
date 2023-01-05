const { query } = require('express');
const connection = require('./db');
const { SHA3 } = require('sha3');
const crypto = require('crypto');

async function login(req, res) {

    var params = [req.body.username];
    const selectClient = "SELECT * FROM Client WHERE Client.username LIKE ?;";
    connection.query(selectClient, params, function(err, result, fields) {
        if (err) throw err;

        
        //creating hash object 
        var hash = crypto.createHash('sha512');
        //passing the data to be hashed
        const salt = result[0].salt
        data = hash.update(salt + req.body.password, 'utf-8');
        //Creating the hash in the required format
        const hashpassword= data.digest('hex');

        if(result[0].password != salt + hashpassword){
            res.send(JSON.stringify({error: "Username/Password are wrong."}));
            return
        }


        const userId = result[0].id;

        //creating hash object 
        var hash = crypto.createHash('sha512');
        //passing the data to be hashed
        data1 = hash.update(Date.now().toString(), 'utf-8');
        //Creating the hash in the required format
        const hashToAdd= data1.digest('hex');



        //VÊ SE JÁ EXISTE UMA SESSION DE UM USER
        const selectSession = "SELECT id FROM Session_table WHERE clientID = ?;";
        connection.query(selectSession, userId, function(err, result, fields) {
            if (err) throw err;
            //DAR UPDATE A SESSION
            if(result.length != 0){
                const sessionId = result[0].id;
                const updateSession = "UPDATE Session_table SET ts=now(),rnd_hash= '"+ hashToAdd +"' WHERE clientID = "+ userId +";";
                connection.query(updateSession, function(err, result, fields) {
                    res.send({
                        token: hashToAdd
                    });
                });
            }
            //FAZER INSERT DE UMA SESSION
            else{
                const insertSession = "INSERT INTO Session_table (clientID, ts, rnd_hash) VALUES (?, now(), ?);";
                connection.query(insertSession,[userId, hashToAdd], function(err, result, fields) {
                    if (err){
                        res.send(JSON.stringify({error: "Error creating Session."}));
                    }
                    else{
                        res.send({
                            token: hashToAdd
                        });
                    }
                });
            }
        });
    });
}

module.exports = {
    login
}