const { query } = require('express');
const connection = require('./db');

//Get all appliances
async function appliances_list() {
    let selectQuery = 'SELECT * FROM Appliance';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Get a single appliance
async function get_appliance(id) {
    let selectQuery = 'SELECT * FROM Appliance WHERE id = ?';
    connection.query(selectQuery, [id], function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Create a appliance.
async function create_appliance(req, res, next) {
    var selectQuery = "INSERT INTO Appliance (nome,maxConsumption,isProducing,contractID) VALUES (?,?,?,?)";
    var params = [req.body.nome, req.body.maxConsumption, req.body.isProducing, req.body.contractID]
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    appliances_list,
    get_appliance,
    create_appliance
}