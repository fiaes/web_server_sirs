const mysql = require('mysql');
const config = require('../config');

async function query(sql, param){
  const con = await mysql.createConnection(config.db);
  //const [results, ] = await connection.execute(sql, params);
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, function (err, result) {
      if (err) throw err;
        console.log("Result: " + result);
        return result
      });
  }); 
}

module.exports = {
  query
}
