const { query } = require('express');
const connection = require('./db');

//Get all appliance_consumptions
async function consumptions_list() {
    let selectQuery = 'SELECT * FROM Appliance_consumption';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Get a single appliance_consumption
async function get_consumption(id) {
    let selectQuery = 'SELECT * FROM Appliance_consumption WHERE id = ?';
    connection.query(selectQuery, [id], function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Create a appliance_consumption.
async function create_consumption(req, res, next) {
    var selectQuery = "INSERT INTO Appliance_consumption (applianceID,ts,consumption) VALUES (?,?,?)";
    var params = [req.body.applianceID, req.body.ts, req.body.consumption]
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    consumptions_list,
    get_consumption,
    create_consumption
}