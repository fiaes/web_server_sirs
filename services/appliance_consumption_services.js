const { query } = require('express');
const connection = require('./db');

//Get all appliance_consumptions
async function consumptions_list(res) {
    let selectQuery = 'SELECT * FROM Appliance_consumption';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Get a single appliance_consumption
async function get_consumption(req, res) {
    let selectQuery = 'SELECT * FROM Appliance_consumption WHERE id = ?';
    connection.query(selectQuery, [req.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
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