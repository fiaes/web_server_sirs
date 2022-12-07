const { query } = require('express');
const connection = require('./db');

//Get all contracts
async function contracts_list() {
    let selectQuery = 'SELECT * FROM Contract';    
    connection.query(selectQuery,function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
}

// Get a single Contract
async function get_contract(id) {
    let selectQuery = 'SELECT * FROM Contract WHERE id = ?';    
    connection.query(selectQuery,[id], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
}

// Create a Contract.
async function create_contract(req, res, next) {
    var selectQuery = "INSERT INTO Contract (tipo) VALUES (?)";
    var params = [req.body.tipo]
    connection.query(selectQuery,params, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
};

module.exports = {
    contracts_list,
    get_contract,
    create_contract
}