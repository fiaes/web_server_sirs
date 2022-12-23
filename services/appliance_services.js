const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

//Get all appliances
async function appliances_list(res) {
    let selectQuery = 'SELECT * FROM Appliance';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Get a single appliance
async function get_appliance(req, res) {
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Appliance WHERE id = ?';
    connection.query(selectQuery, [req.params.id], function(err, result, fields) {
        if (err) throw err;
        //console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Get all appliances from client
async function get_client_appliances(req, res) {
    console.log("GET_CLIENT_APPLIANCES");
    if(isNaN(Number([req.params.clientID]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT id,nome,maxConsumption,isProducing FROM Appliance WHERE clientID = ?';
    connection.query(selectQuery, [req.params.clientID], function(err, result, fields) {
        if (err) throw err;
        //console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Create a appliance.
async function create_appliance(req, res, next) {
    var params = [req.body.nome, req.body.maxConsumption, req.body.isProducing, req.body.contractID];
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Appliance (nome,maxConsumption,isProducing,contractID) VALUES (?,?,?,?)";
    
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    appliances_list,
    get_appliance,
    get_client_appliances,
    create_appliance
}