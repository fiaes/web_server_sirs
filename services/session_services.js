const moment = require('moment');
const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

//Returns true if a session is valid
async function is_session_valid(req, res) {
    let selectQuery = 'SELECT Session_table.ts FROM Session_table WHERE rnd_hash = ?';     
    connection.query(selectQuery,[req.body.token],function (err, result, fields) {
        if (err) throw err;
        if(result.length != 0){
            let current_ts_query = 'SELECT CURRENT_TIMESTAMP;';
            connection.query(current_ts_query, function(err, current_ts, fields) {
                if (err) throw err;
                const now = new Date(JSON.stringify(current_ts).split("\":\"")[1].slice(0, -4));
                const db_date = JSON.stringify(result).split("\":\"")[1].slice(0, -4);
                const expire = new Date(db_date);
                expire.setDate(expire.getDate()+1);
                if(now >= expire){
                    res.send(JSON.stringify({error: "Error redirect. (token expired)"}));
                }
                else{
                    res.send(JSON.stringify({success: "Token is valid."}));
                }
            });
            
                
        }else{
            console.log("generate token");
            res.send(JSON.stringify({error: "Error redirect. (generate token)"}));
        } 
      });
}

module.exports = {
    is_session_valid
}