const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

//Get all rates
async function rates_list(res) {
    let selectQuery = 'SELECT * FROM Rates';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Get a single rate
async function get_rate(req, res) {
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Rates WHERE id = ?';
    connection.query(selectQuery, [req.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Create a rate.
async function create_rate(req, res, next) {
    var params = [req.body.rate, req.body.initial, req.body.finish, req.body.contractID];
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Rates (rate,initial,finish,contractID) VALUES (?,?,?,?)";
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    rates_list,
    get_rate,
    create_rate
}