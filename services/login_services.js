const { query } = require('express');
const connection = require('./db');
const { SHA3 } = require('sha3');

//Get all roles
async function login(req, res) {

    const password = req.body.password
    const hash = new SHA3(512);
    hash.update(password);
    const hashpassword = hash.digest('hex');
    
    var params = [req.body.username, hashpassword];
    const selectClient = "SELECT * FROM Client WHERE Client.username LIKE ? AND Client.password LIKE ? ;";
    connection.query(selectClient, params, function(err, result, fields) {
        if (err) throw err;

        if(result.length == 0){
            res.send(JSON.stringify({error: "Username/Password are wrong."}));
            return
        }

        const userId = result[0].id;

        const hashSession = new SHA3(512);
        hashSession.update(Date.now().toString());
        const hashToAdd = hashSession.digest('hex');

        //VÊ SE JÁ EXISTE UMA SESSION DE UM USER
        const selectSession = "SELECT id FROM Session_table WHERE clientID = ?;";
        connection.query(selectSession, userId, function(err, result, fields) {
            if (err) throw err;
            //DAR UPDATE A SESSION
            if(result.length != 0){
                const sessionId = result[0].id;
                const updateSession = "UPDATE Session_table SET ts=now(),rnd_hash= ? WHERE ?;";
                connection.query(updateSession, [hashToAdd, sessionId], function(err, result, fields) {
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