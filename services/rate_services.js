const { query } = require('express');
const connection = require('./db');

//Get all rates
async function rates_list() {
    let selectQuery = 'SELECT * FROM Rates';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Get a single rate
async function get_rate(id) {
    let selectQuery = 'SELECT * FROM Rates WHERE id = ?';
    connection.query(selectQuery, [id.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Create a rate.
async function create_rate(req, res, next) {
    var selectQuery = "INSERT INTO Rates (rate,initial,finish,contractID) VALUES (?,?,?,?)";
    var params = [req.body.rate, req.body.initial, req.body.finish, req.body.contractID]
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