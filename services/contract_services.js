const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

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
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Contract WHERE id = ?';   
    connection.query(selectQuery,[req.params.id], function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Create a Contract.
async function create_contract(req, res, next) {
    var params = [req.body.tipo]
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Contract (tipo) VALUES (?)";
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