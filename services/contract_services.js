const { query } = require('express');
const connection = require('./db');

//Get all contracts
async function contracts_list(res) {
    let selectQuery = 'SELECT * FROM Contract';    
    connection.query(selectQuery,function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Get a single Contract
async function get_contract(req,res) {
    let selectQuery = 'SELECT * FROM Contract WHERE id = ?';    
    connection.query(selectQuery,[req.params.id], function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
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