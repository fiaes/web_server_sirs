const { query } = require('express');
const connection = require('./db');

async function getValues(){
  var q = "'SELECT * FROM users;'"
  connection.query(q, function(err, results){
    console.log("eueu")
    if(err) throw err;
    return results;
  });
}
module.exports = {
  getValues
}


