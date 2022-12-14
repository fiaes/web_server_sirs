const { query } = require('express');
const connection = require('./db');
const { SHA3 } = require('sha3');

//Get all roles
async function signup_client(req, res) {
    
    const username = req.body.username
    const password = req.body.password
    const publickey = req.body.publickey
    const name = req.body.name

    const selectClient = "SELECT * FROM Client WHERE Client.username LIKE '"+ username +"'";
    

    connection.query(selectClient, function(err, result, fields) {
        if (err) throw err;

        if(result.length != 0){
            res.send(JSON.stringify({error: "Username already exits"}));
            return
        }

        const hash = new SHA3(512);
        hash.update(password);
        const hashpassword = hash.digest('hex');

        const insertClient = "INSERT INTO Client (username, password, publickey, nome) VALUES ('"+ username +"', '"+ hashpassword +"', '"+ publickey +"', '"+ name +"');";
        console.log(insertClient)
        connection.query(insertClient, function(err, result, fields) {
            if (err) throw err;
            if(result.affectedRows != 0)
                res.send(JSON.stringify({success: "Account was created "+ username +" as username."}));
            else
                res.send(JSON.stringify({error: "Error creating account."}));
        });
    });
    

    


    // let selectQuery = 'SELECT * FROM Client  WHERE ';
    // connection.query(selectQuery, function(err, result, fields) {
    //     if (err) throw err;
    //     console.log(JSON.stringify(result));
    //     res.send(JSON.stringify(result));
    // });
}

module.exports = {
    signup_client
}