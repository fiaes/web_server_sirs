import moment from "moment"
const { query } = require('express');
const connection = require('./db');

//Returns true if a session is valid
async function is_session_valid(req, res) {
    let selectQuery = 'SELECT Session_table.ts FROM Session_table WHERE rnd_hash = ?';     
    connection.query(selectQuery,[req.body.token],function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify());
        if(result.length != 0){
            console.log("Timestamp na db:" + JSON.stringify(result));
            const now = moment();
            const expire = moment(result).add(1, 'days');
            console.log("Expire ts: " + JSON.stringify(expire));
            if(now >= expire)
                res.send(JSON.stringify({error: "Error redirect. (new token)"}));
            else
                res.send(JSON.stringify({success: "Token is valid."}));
        }else
            res.send(JSON.stringify({error: "Error redirect. (new token)"}));
      });
}

module.exports = {
    is_session_valid
}