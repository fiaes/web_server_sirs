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

//GET all clients contracts 
async function get_contract_token(req, res) {
    var params = [req.body.rnd_hash];
    const selectSession = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE ?;";
    connection.query(selectSession, params, function(err, result, fields) {
        if (err) throw err;
        if(result.length != 0){
            const clientID = result[0].clientID;
            let selectQuery = 'SELECT contractID FROM Appliance WHERE clientID = ?';
            connection.query(selectQuery, clientID, async function(err, result_contract_ids, fields) {
                if (err) throw err;
                const res_contracts = [];
                await Promise.all(result_contract_ids.map(async contract_id => {
                    let select_contracts = 'SELECT * FROM Contract WHERE id = ?';   
                    return new Promise((resolve, reject) => {
                        connection.query(select_contracts, contract_id.contractID, function (err, result, fields) {
                            if (err) reject(err);
                            res_contracts.push(result[0]);
                            resolve();
                        });
                    });
                }));
                res.send(JSON.stringify(res_contracts));
            });
        }
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
    get_contract_token,
    create_contract
}