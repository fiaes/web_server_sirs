const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

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
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Appliance_consumption WHERE id = ?';
    connection.query(selectQuery, [req.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Create a appliance_consumption.
async function create_consumption(req, res, next) {
    var params = [req.body.applianceID, req.body.ts, req.body.consumption];
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Appliance_consumption (applianceID,ts,consumption) VALUES (?,?,?)";
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